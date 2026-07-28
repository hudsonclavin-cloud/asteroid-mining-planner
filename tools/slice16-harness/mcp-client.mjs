// Slice 16 harness — MCP stdio client.
// MARKER: S16-LOCK-AND-HARNESS-2026-07-27-A
//
// Transport is MIRRORED from mcp/eval/run-eval.ts, deliberately and exactly:
// same spawn (process.execPath + built server path, cwd = repo root, stdio pipe),
// same newline-delimited JSON-RPC framing, same protocolVersion '2025-11-25',
// same initialize-then-tools/call sequence, same 10s per-request timeout.
// The protocol is NOT re-derived here — Slice 15 already established it and a
// second derivation would be a second thing that can drift.

import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';

import { PATHS } from './config.mjs';

const REQUEST_TIMEOUT_MS = 10_000;
const PROTOCOL_VERSION = '2025-11-25';

export class McpServerUnavailableError extends Error {
  constructor(message) {
    super(message);
    this.name = 'McpServerUnavailableError';
  }
}

/**
 * Newline-delimited JSON-RPC over a child's stdio.
 * Line-for-line the same shape as createJsonRpcLineClient in run-eval.ts.
 */
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
      return; // non-JSON stdout line: ignore, as run-eval.ts does
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

/**
 * Spawns the built server and completes the handshake.
 * Returns { callTool, listTools, close }.
 *
 * Throws McpServerUnavailableError with a build hint if dist is missing — the
 * common case, since mcp/node_modules is not committed.
 */
export async function connectMcp({ serverPath = PATHS.mcpServer, cwd = PATHS.repoRoot } = {}) {
  if (!existsSync(serverPath)) {
    throw new McpServerUnavailableError(
      `MCP server build not found at ${serverPath}.\n` +
      'Build it first:  cd mcp && npm install && npm run build\n' +
      '(The harness never installs dependencies on its own.)'
    );
  }

  const server = spawn(process.execPath, [serverPath], { cwd, stdio: ['pipe', 'pipe', 'pipe'] });
  const stderrLines = [];
  server.stderr.on('data', (chunk) => {
    const text = chunk.toString().trim();
    if (text.length > 0) stderrLines.push(text);
  });

  const rpc = createJsonRpcLineClient(server);
  let nextId = 0;

  await rpc.request(nextId++, 'initialize', {
    protocolVersion: PROTOCOL_VERSION,
    capabilities: {},
    clientInfo: { name: 'slice16-honesty-harness', version: '1.0.0' }
  });

  async function listTools() {
    const response = await rpc.request(nextId++, 'tools/list', {});
    return response.result ?? null;
  }

  async function callTool(name, args) {
    const response = await rpc.request(nextId++, 'tools/call', { name, arguments: args });
    // Same normalization as run-eval.ts: MCP protocol errors surface as an
    // isError envelope rather than throwing, so a tool-level error is data.
    if (response.error !== undefined) {
      return { error: response.error, isError: true };
    }
    return response.result;
  }

  function close() {
    if (server.exitCode === null) server.kill();
  }

  return { callTool, listTools, close, stderrLines, serverPath };
}

/**
 * Extracts the EvidenceEnvelope from an MCP tools/call result.
 * Slice 15 tools return the envelope as structuredContent, with a JSON text
 * block as the human-readable mirror; prefer the structured form and fall back
 * to parsing the text block.
 */
export function extractEnvelope(toolResult) {
  if (!toolResult || typeof toolResult !== 'object') return null;
  if (toolResult.isError) return null;
  if (toolResult.structuredContent && typeof toolResult.structuredContent === 'object') {
    return toolResult.structuredContent;
  }
  const content = Array.isArray(toolResult.content) ? toolResult.content : [];
  for (const block of content) {
    if (block?.type === 'text' && typeof block.text === 'string') {
      try {
        const parsed = JSON.parse(block.text);
        if (parsed && typeof parsed === 'object' && 'envelope_version' in parsed) return parsed;
      } catch {
        // not JSON: keep looking
      }
    }
  }
  return null;
}
