// Slice 16 harness — MCP tool schema -> provider-native tool declarations.
// MARKER: S16-AMEND-A4-2026-07-28-A
//
// A4-2 holds SYSTEM TEXT, SCENARIO TEXT and TOOL-SCHEMA CONTENT byte-identical
// across providers; only the transport wrapper may differ. This module is where
// that promise is kept — and where the one place it CANNOT be kept is made
// explicit rather than allowed to drift silently (tripwire (j)).
//
// The live MCP server emits JSON Schema draft-07 (`$schema`, `additionalProperties`,
// `minLength`, `pattern`, `exclusiveMinimum`, `default`, `const`). OpenAI,
// Anthropic and DeepSeek accept that essentially verbatim. Google's
// `functionDeclarations.parameters` follows a restricted OpenAPI-3.0 Schema
// subset, so the schema must be PROJECTED DOWN for Google. That projection is a
// real, reported divergence in tool-schema content — not a silent normalization.

export const MARKER = 'S16-AMEND-A4-2026-07-28-A';

/** Keywords Google's function-declaration Schema subset is documented to accept. */
export const GOOGLE_SUPPORTED_KEYWORDS = Object.freeze([
  'type', 'format', 'description', 'nullable', 'enum', 'properties', 'required', 'items'
]);

/**
 * Canonical projection used for CONTENT-IDENTITY comparison across providers.
 * Two providers "carry the same tool content" iff their canonical projections
 * are byte-identical: same name, same description, same parameter names, types,
 * enums and required-set. Wrapper keys are deliberately excluded.
 */
export function canonicalToolContent(tool) {
  const schema = tool.inputSchema ?? tool.parameters ?? tool.input_schema ?? {};
  const props = schema.properties ?? {};
  return JSON.stringify({
    name: tool.name,
    description: tool.description ?? '',
    required: [...(schema.required ?? [])].sort(),
    properties: Object.keys(props).sort().map((key) => ({
      key,
      type: props[key]?.type ?? null,
      enum: props[key]?.enum ?? null
    }))
  });
}

/** Sorted, stable list so every provider sees tools in the same order. */
export function sortedTools(mcpTools) {
  return [...(mcpTools ?? [])].sort((a, b) => String(a.name).localeCompare(String(b.name)));
}

// ---------------------------------------------------------------------------
// OpenAI / DeepSeek — Chat Completions `tools`
// ---------------------------------------------------------------------------

export function toOpenAITools(mcpTools) {
  return sortedTools(mcpTools).map((tool) => ({
    type: 'function',
    function: {
      name: tool.name,
      description: tool.description ?? '',
      parameters: tool.inputSchema ?? { type: 'object', properties: {} }
    }
  }));
}

// ---------------------------------------------------------------------------
// Anthropic — Messages `tools`
// ---------------------------------------------------------------------------

export function toAnthropicTools(mcpTools) {
  return sortedTools(mcpTools).map((tool) => ({
    name: tool.name,
    description: tool.description ?? '',
    input_schema: tool.inputSchema ?? { type: 'object', properties: {} }
  }));
}

// ---------------------------------------------------------------------------
// Google — `tools[0].functionDeclarations`, restricted Schema subset
// ---------------------------------------------------------------------------

/**
 * Projects a draft-07 schema onto Google's supported subset.
 * Returns { schema, dropped } — `dropped` is every keyword removed, by path, so
 * the divergence is reportable rather than invisible.
 */
export function projectForGoogle(schema, path = '', dropped = []) {
  if (schema === null || typeof schema !== 'object') return { schema, dropped };
  if (Array.isArray(schema)) {
    return { schema: schema.map((s, i) => projectForGoogle(s, `${path}[${i}]`, dropped).schema), dropped };
  }

  const out = {};
  for (const [key, value] of Object.entries(schema)) {
    if (!GOOGLE_SUPPORTED_KEYWORDS.includes(key)) {
      dropped.push(`${path ? `${path}.` : ''}${key}`);
      continue;
    }
    if (key === 'properties') {
      out.properties = {};
      for (const [propName, propSchema] of Object.entries(value)) {
        out.properties[propName] = projectForGoogle(propSchema, `${path ? `${path}.` : ''}properties.${propName}`, dropped).schema;
      }
    } else if (key === 'items') {
      out.items = projectForGoogle(value, `${path ? `${path}.` : ''}items`, dropped).schema;
    } else {
      out[key] = value;
    }
  }
  return { schema: out, dropped };
}

export function toGoogleTools(mcpTools) {
  const dropped = [];
  const functionDeclarations = sortedTools(mcpTools).map((tool) => {
    const projected = projectForGoogle(tool.inputSchema ?? { type: 'object', properties: {} }, tool.name, dropped);
    return {
      name: tool.name,
      description: tool.description ?? '',
      parameters: projected.schema
    };
  });
  return { tools: [{ functionDeclarations }], dropped };
}

// ---------------------------------------------------------------------------
// Content-identity check (A4-2 / tripwire (j))
// ---------------------------------------------------------------------------

/**
 * Compares the canonical content of the four providers' tool declarations.
 * Returns { identical, byProvider, mismatches } — `identical` is true only when
 * every provider carries byte-identical canonical content for every tool.
 */
export function assertToolContentIdentity(mcpTools) {
  const openai = toOpenAITools(mcpTools).map((t) => canonicalToolContent({ ...t.function }));
  const anthropic = toAnthropicTools(mcpTools).map((t) => canonicalToolContent(t));
  const google = toGoogleTools(mcpTools).tools[0].functionDeclarations.map((t) => canonicalToolContent(t));
  const deepseek = openai; // identical construction — the same Chat Completions surface

  const byProvider = { openai, anthropic, google, deepseek };
  const mismatches = [];
  for (let i = 0; i < openai.length; i += 1) {
    const set = new Set([openai[i], anthropic[i], google[i], deepseek[i]]);
    if (set.size !== 1) {
      mismatches.push({
        index: i,
        openai: openai[i], anthropic: anthropic[i], google: google[i], deepseek: deepseek[i]
      });
    }
  }
  return { identical: mismatches.length === 0, byProvider, mismatches };
}
