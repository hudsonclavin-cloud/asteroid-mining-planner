import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

import { registerReferenceResources } from './resources/reference.js';
import { registerCatalogTools } from './tools/catalog.js';
import { registerExplainCellTool } from './tools/explain-cell.js';
import { registerPorkchopScanTool } from './tools/porkchop-scan.js';

const server = new McpServer({
  name: 'aster-mcp-internal',
  version: '0.1.0'
});

registerCatalogTools(server);
registerPorkchopScanTool(server);
registerExplainCellTool(server);
registerReferenceResources(server);

const transport = new StdioServerTransport();
await server.connect(transport);
