import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import { registerGetBodyTool } from './get-body.js';
import { registerSearchBodiesTool } from './search-bodies.js';

export function registerCatalogTools(server: McpServer): void {
  registerSearchBodiesTool(server);
  registerGetBodyTool(server);
}
