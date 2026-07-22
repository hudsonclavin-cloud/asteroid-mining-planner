// S16-ENVELOPE-MEASURE — house-measured payload sizes for the Slice 15 MCP
// eval gate's tools/list schema + its 10 committed tool_call inputs.
//
// Supersedes Query 3's third-party per-call response estimate (0.5-3 KB) in
// the Slice 16 cost model with real measurements against the locally built
// aster-mission-mcp server.
//
// Spawn command, initialize handshake, and JSON-RPC line framing mirror
// mcp/eval/run-eval.ts exactly (read first, per dispatch precedent) — this
// script does not re-derive the transport.

import { spawn, spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const REQUEST_TIMEOUT_MS = 10_000;
const MARKER = 'S16-ENVELOPE-MEASURE-2026-07-21-A';

const __dirname = dirname(fileURLToPath(import.meta.url));
// tools/slice16-research/measurements -> repo root
const repoRoot = resolve(__dirname, '..', '..', '..');
const mcpRoot = resolve(repoRoot, 'mcp');
const serverPath = resolve(mcpRoot, 'dist', 'mcp', 'src', 'index.js');
const pairsPath = resolve(mcpRoot, 'eval', 'slice15-eval-pairs.json');
const outPath = resolve(__dirname, 'envelope-payload-sizes.json');

const evalSet = JSON.parse(readFileSync(pairsPath, 'utf8'));
if (!Array.isArray(evalSet.pairs) || evalSet.pairs.length !== 10) {
  throw new Error(`Expected 10 eval pairs; found ${Array.isArray(evalSet.pairs) ? evalSet.pairs.length : 'non-array'}`);
}

const headHash = runGitHead(repoRoot);
const measuredAt = new Date().toISOString();

function byteSize(jsonValue) {
  const s = JSON.stringify(jsonValue);
  return { bytes: Buffer.byteLength(s, 'utf8'), chars: s.length, est_tokens: Math.ceil(s.length / 4) };
}

function classifyKind(result) {
  // Slice 15 envelope shape: structuredContent carries { value, refusal } (XOR).
  // A CallToolResult with isError:true and no structuredContent is an MCP
  // transport-level error (e.g. Zod input validation) — its own class, not a
  // graded envelope and not ambiguous ('unclassified' is reserved for shapes
  // that genuinely don't fit).
  if (result && result.isError === true && result.structuredContent === undefined) {
    return 'error';
  }
  const sc = result && result.structuredContent;
  if (sc && typeof sc === 'object') {
    if (sc.refusal !== undefined && sc.refusal !== null) return 'refusal';
    if (sc.value !== undefined && sc.value !== null) return 'value';
  }
  return 'unclassified';
}

let server = null;
try {
  server = spawn(process.execPath, [serverPath], {
    cwd: repoRoot,
    stdio: ['pipe', 'pipe', 'pipe'],
  });

  server.stderr.on('data', (chunk) => {
    const text = chunk.toString().trim();
    if (text.length > 0) process.stderr.write(`${text}\n`);
  });

  const rpc = createJsonRpcLineClient(server);

  await rpc.request(0, 'initialize', {
    protocolVersion: '2025-11-25',
    capabilities: {},
    clientInfo: { name: 'slice16-envelope-measure', version: '1.0.0' },
  });

  const toolsListResponse = await rpc.request(1, 'tools/list', {});
  if (toolsListResponse.error) {
    throw new Error(`tools/list errored: ${JSON.stringify(toolsListResponse.error)}`);
  }
  const toolsListSize = byteSize(toolsListResponse.result);

  const rows = [];
  for (const [index, pair] of evalSet.pairs.entries()) {
    const requestId = index + 2; // 0=initialize, 1=tools/list
    const sentArgs = pair.tool_call.arguments;
    const response = await rpc.request(requestId, 'tools/call', {
      name: pair.tool_call.name,
      arguments: sentArgs,
    });

    if (response.error) {
      throw new Error(
        `REGRESSION (tripwire d): pair ${pair.id} (${pair.tool_call.name}) errored: ${JSON.stringify(response.error)}`
      );
    }
    const result = response.result;
    // isError on a CallToolResult is only a REGRESSION if this pair's own committed
    // ground_truth did not already expect an MCP transport error (e.g. P7 is a
    // deliberate boundary/error-path case, graded PASS on isError:true by the sealed
    // gate itself). Anything else returning isError unexpectedly is a real regression.
    const expectsMcpError = Boolean(pair.ground_truth && pair.ground_truth.mcpError && pair.ground_truth.mcpError.isError === true);
    if (result && result.isError === true && !expectsMcpError) {
      throw new Error(
        `REGRESSION (tripwire d): pair ${pair.id} (${pair.tool_call.name}) returned unexpected isError:true — raw: ${JSON.stringify(result)}`
      );
    }

    // (f) recorded responses == requests sent — verify the echoed request shape,
    // where available, matches what we sent (defense against a stale/mismatched pairing).
    // The MCP result itself doesn't echo the request; verification here is structural:
    // confirm the response corresponds to THIS request id (already enforced by the
    // JSON-RPC id-keyed pending map in createJsonRpcLineClient) and that arguments
    // sent are exactly the pair's tool_call.arguments (no mutation in this script).
    const argsUnchanged = JSON.stringify(sentArgs) === JSON.stringify(pair.tool_call.arguments);
    if (!argsUnchanged) {
      throw new Error(`TRIPWIRE (f): pair ${pair.id} arguments mutated before send`);
    }

    const size = byteSize(result);
    const kind = classifyKind(result);
    rows.push({ pair_id: pair.id, tool: pair.tool_call.name, ...size, kind });
  }

  if (rows.length !== 10) {
    throw new Error(`TRIPWIRE (f): expected 10 response rows, got ${rows.length}`);
  }

  const responseBytes = rows.map((r) => r.bytes).sort((a, b) => a - b);
  const median = (arr) => (arr.length % 2 === 1 ? arr[(arr.length - 1) / 2] : (arr[arr.length / 2 - 1] + arr[arr.length / 2]) / 2);

  const byKind = {};
  for (const kind of ['value', 'refusal', 'error', 'unclassified']) {
    const kindBytes = rows.filter((r) => r.kind === kind).map((r) => r.bytes).sort((a, b) => a - b);
    if (kindBytes.length > 0) {
      byKind[kind] = { count: kindBytes.length, min: kindBytes[0], median: median(kindBytes), max: kindBytes[kindBytes.length - 1] };
    }
  }

  const artifact = {
    marker: MARKER,
    head_at_measurement: headHash,
    measured_at: measuredAt,
    method:
      'replay of committed slice15-eval-pairs tool_call inputs against locally built server; sizes in bytes and chars; est_tokens = ceil(chars/4), stated heuristic, not a tokenizer count',
    tools_list_payload: toolsListSize,
    responses: rows,
    summary: {
      count: rows.length,
      responses: { min: responseBytes[0], median: median(responseBytes), max: responseBytes[responseBytes.length - 1] },
      by_kind: byKind,
    },
  };

  writeFileSync(outPath, `${JSON.stringify(artifact, null, 2)}\n`, 'utf8');

  console.log('\n=== S16-ENVELOPE-MEASURE summary ===');
  console.log(`tools/list payload: ${toolsListSize.bytes} bytes (${toolsListSize.chars} chars, ~${toolsListSize.est_tokens} est-tok)`);
  console.log(`responses: n=${rows.length} min=${responseBytes[0]}B median=${median(responseBytes)}B max=${responseBytes[responseBytes.length - 1]}B`);
  for (const [kind, s] of Object.entries(byKind)) {
    console.log(`  by_kind.${kind}: n=${s.count} min=${s.min}B median=${s.median}B max=${s.max}B`);
  }
  console.log('\nPer-pair rows:');
  console.table(rows.map(({ pair_id, tool, bytes, chars, est_tokens, kind }) => ({ pair_id, tool, bytes, chars, est_tokens, kind })));
} finally {
  if (server !== null && server.exitCode === null) {
    server.kill();
  }
}

function createJsonRpcLineClient(child) {
  let buffer = '';
  const pending = new Map();

  child.stdout.on('data', (chunk) => {
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

  function handleLine(line) {
    if (line.length === 0) return;
    let parsed;
    try {
      parsed = JSON.parse(line);
    } catch {
      return;
    }
    if (typeof parsed.id !== 'number') return;
    const waiter = pending.get(parsed.id);
    if (waiter === undefined) return;
    clearTimeout(waiter.timer);
    pending.delete(parsed.id);
    waiter.resolve(parsed);
  }

  function request(id, method, params) {
    const payload = JSON.stringify({ jsonrpc: '2.0', id, method, params });
    return new Promise((resolvePromise, rejectPromise) => {
      const timer = setTimeout(() => {
        pending.delete(id);
        rejectPromise(new Error('timeout'));
      }, REQUEST_TIMEOUT_MS);
      pending.set(id, { resolve: resolvePromise, reject: rejectPromise, timer });
      child.stdin.write(`${payload}\n`, (error) => {
        if (error !== null && error !== undefined) {
          clearTimeout(timer);
          pending.delete(id);
          rejectPromise(error);
        }
      });
    });
  }

  function rejectAll(error) {
    for (const [id, waiter] of pending) {
      clearTimeout(waiter.timer);
      waiter.reject(error);
      pending.delete(id);
    }
  }

  return { request };
}

function runGitHead(cwd) {
  const child = spawnSync(process.platform === 'win32' ? 'git.exe' : 'git', ['log', '--format=%H', '-1'], {
    cwd,
    encoding: 'utf8',
  });
  if (child.status !== 0) {
    const stderr = child.stderr.trim();
    throw new Error(`git log failed${stderr ? `: ${stderr}` : ''}`);
  }
  return child.stdout.trim();
}
