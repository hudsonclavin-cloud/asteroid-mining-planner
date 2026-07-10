import { spawn, spawnSync, type ChildProcessWithoutNullStreams } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

type EvalPair = {
  id: string;
  rq_tag: string;
  tool_call: {
    name: string;
    arguments: Record<string, unknown>;
  };
  grading: {
    type: 'deterministic';
    check: string;
  };
};

type EvalSet = {
  pairs: EvalPair[];
};

type JsonRpcResponse = {
  id?: number;
  result?: unknown;
  error?: {
    code?: number;
    message?: string;
    data?: unknown;
  };
};

type PairReport = {
  id: string;
  category: string;
  passed: boolean;
  reason: string;
  gradingCheck: string;
};

type EvalReport = {
  reportVersion: '1';
  generatedAt: string;
  origin: string;
  totalPairs: number;
  passed: number;
  failed: number;
  pairs: PairReport[];
};

const REQUEST_TIMEOUT_MS = 10_000;
const __dirname = dirname(fileURLToPath(import.meta.url));
const evalDir = resolve(__dirname) === resolve(process.cwd(), 'dist', 'eval')
  ? resolve(process.cwd(), 'eval')
  : resolve(__dirname);
const pairsPath = resolve(evalDir, 'slice15-eval-pairs.json');
const reportPath = resolve(evalDir, 'slice15-eval-report.json');
const summaryPath = resolve(evalDir, 'slice15-eval-summary.md');
const repoRoot = resolve(evalDir, '..', '..');
const mcpRoot = resolve(evalDir, '..');
const serverPath = resolve(mcpRoot, 'dist', 'mcp', 'src', 'index.js');

const evalSet = JSON.parse(readFileSync(pairsPath, 'utf8')) as EvalSet;

if (!Array.isArray(evalSet.pairs) || evalSet.pairs.length !== 10) {
  throw new Error(`Expected 10 eval pairs; found ${Array.isArray(evalSet.pairs) ? evalSet.pairs.length : 'non-array'}`);
}

const origin = runGitHead(repoRoot);
const generatedAt = new Date().toISOString();
let server: ChildProcessWithoutNullStreams | null = null;

try {
  server = spawn(process.execPath, [serverPath], {
    cwd: repoRoot,
    stdio: ['pipe', 'pipe', 'pipe']
  });

  server.stderr.on('data', (chunk: Buffer) => {
    const text = chunk.toString().trim();
    if (text.length > 0) {
      process.stderr.write(`${text}\n`);
    }
  });

  const rpc = createJsonRpcLineClient(server);

  await rpc.request(0, 'initialize', {
    protocolVersion: '2025-11-25',
    capabilities: {},
    clientInfo: {
      name: 'slice15-eval-runner',
      version: '1.0.0'
    }
  });

  const pairReports: PairReport[] = [];

  for (const [index, pair] of evalSet.pairs.entries()) {
    const requestId = index + 1;
    const pairReport = await runPair(rpc, requestId, pair);
    pairReports.push(pairReport);
  }

  const passed = pairReports.filter((pair) => pair.passed).length;
  const report: EvalReport = {
    reportVersion: '1',
    generatedAt,
    origin,
    totalPairs: evalSet.pairs.length,
    passed,
    failed: evalSet.pairs.length - passed,
    pairs: pairReports
  };

  writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  writeFileSync(summaryPath, renderSummary(report), 'utf8');
  console.log(`Eval complete: ${passed}/${evalSet.pairs.length} PASS`);
} finally {
  if (server !== null && server.exitCode === null) {
    server.kill();
  }
}

async function runPair(
  rpc: ReturnType<typeof createJsonRpcLineClient>,
  requestId: number,
  pair: EvalPair
): Promise<PairReport> {
  try {
    const response = await rpc.request(requestId, 'tools/call', {
      name: pair.tool_call.name,
      arguments: pair.tool_call.arguments
    });
    const result = normalizeToolResult(response);
    const passed = evaluateCheck(pair.grading.check, result);

    return {
      id: pair.id,
      category: pair.rq_tag,
      passed,
      reason: passed ? '' : 'grading-check returned false',
      gradingCheck: pair.grading.check
    };
  } catch (error) {
    return {
      id: pair.id,
      category: pair.rq_tag,
      passed: false,
      reason: error instanceof Error ? error.message : String(error),
      gradingCheck: pair.grading.check
    };
  }
}

function createJsonRpcLineClient(child: ChildProcessWithoutNullStreams) {
  let buffer = '';
  const pending = new Map<number, {
    resolve: (response: JsonRpcResponse) => void;
    reject: (error: Error) => void;
    timer: NodeJS.Timeout;
  }>();

  child.stdout.on('data', (chunk: Buffer) => {
    buffer += chunk.toString();
    let newlineIndex = buffer.indexOf('\n');
    while (newlineIndex !== -1) {
      const line = buffer.slice(0, newlineIndex).trim();
      buffer = buffer.slice(newlineIndex + 1);
      handleLine(line);
      newlineIndex = buffer.indexOf('\n');
    }
  });

  child.on('error', (error) => rejectAll(error));
  child.on('exit', (code, signal) => {
    if (pending.size > 0) {
      rejectAll(new Error(`server exited before response (code=${code ?? 'null'}, signal=${signal ?? 'null'})`));
    }
  });

  function handleLine(line: string): void {
    if (line.length === 0) {
      return;
    }

    let parsed: JsonRpcResponse;
    try {
      parsed = JSON.parse(line) as JsonRpcResponse;
    } catch {
      return;
    }

    if (typeof parsed.id !== 'number') {
      return;
    }

    const waiter = pending.get(parsed.id);
    if (waiter === undefined) {
      return;
    }

    clearTimeout(waiter.timer);
    pending.delete(parsed.id);
    waiter.resolve(parsed);
  }

  function request(id: number, method: string, params: Record<string, unknown>): Promise<JsonRpcResponse> {
    const payload = JSON.stringify({
      jsonrpc: '2.0',
      id,
      method,
      params
    });

    return new Promise((resolvePromise, rejectPromise) => {
      const timer = setTimeout(() => {
        pending.delete(id);
        rejectPromise(new Error('timeout'));
      }, REQUEST_TIMEOUT_MS);

      pending.set(id, {
        resolve: resolvePromise,
        reject: rejectPromise,
        timer
      });

      child.stdin.write(`${payload}\n`, (error) => {
        if (error !== null && error !== undefined) {
          clearTimeout(timer);
          pending.delete(id);
          rejectPromise(error);
        }
      });
    });
  }

  function rejectAll(error: Error): void {
    for (const [id, waiter] of pending) {
      clearTimeout(waiter.timer);
      waiter.reject(error);
      pending.delete(id);
    }
  }

  return { request };
}

function normalizeToolResult(response: JsonRpcResponse): unknown {
  if (response.error !== undefined) {
    return {
      error: response.error,
      isError: true
    };
  }
  return response.result;
}

function evaluateCheck(check: string, result: unknown): boolean {
  try {
    return Boolean(new Function('result', `return (${check});`)(result));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`grading-error: ${message}`);
  }
}

function runGitHead(cwd: string): string {
  const child = spawnSync(process.platform === 'win32' ? 'git.exe' : 'git', ['log', '--format=%H', '-1'], {
    cwd,
    encoding: 'utf8'
  });

  if (child.status !== 0) {
    const stderr = child.stderr.trim();
    throw new Error(`git log failed${stderr ? `: ${stderr}` : ''}`);
  }

  return child.stdout.trim();
}

function renderSummary(report: EvalReport): string {
  const lines = [
    '# Slice 15 Eval Report',
    `Generated: ${report.generatedAt}  `,
    `Origin: ${report.origin}  `,
    `Result: ${report.passed}/${report.totalPairs} PASS`,
    '',
    '| ID | Category | Result | Reason |',
    '|----|----------|--------|--------|'
  ];

  for (const pair of report.pairs) {
    lines.push(`| ${pair.id} | ${pair.category} | ${pair.passed ? 'PASS' : 'FAIL'} | ${pair.reason} |`);
  }

  const failures = report.pairs.filter((pair) => !pair.passed);
  if (failures.length > 0) {
    lines.push('', 'Failures:');
    for (const failure of failures) {
      lines.push(`- ${failure.id}: ${failure.reason}`);
    }
  }

  return `${lines.join('\n')}\n`;
}
