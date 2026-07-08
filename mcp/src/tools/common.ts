export const CLOSED_WORLD_TOOL_ANNOTATIONS = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false
} as const;

export function toolResult(envelope: object): {
  structuredContent: Record<string, unknown>;
  content: Array<{ type: 'text'; text: string }>;
} {
  return {
    structuredContent: envelope as Record<string, unknown>,
    content: [
      {
        type: 'text',
        text: JSON.stringify(envelope, null, 2)
      }
    ]
  };
}
