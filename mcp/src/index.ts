#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

import { registerReferenceResources } from './resources/reference.js';
import { registerCatalogTools } from './tools/catalog.js';
import { registerDlaFeasibilityTool } from './tools/dla-feasibility.js';
import { registerEstimateMissionCostTool } from './tools/estimate-mission-cost.js';
import { registerExplainCellTool } from './tools/explain-cell.js';
import { registerGetValidationReportTool } from './tools/get-validation-report.js';
import { registerPorkchopScanTool } from './tools/porkchop-scan.js';

const server = new McpServer({
  name: 'aster-mission-mcp',
  version: '0.1.0'
});

registerCatalogTools(server);
registerPorkchopScanTool(server);
registerExplainCellTool(server);
registerDlaFeasibilityTool(server);
registerEstimateMissionCostTool(server);
registerGetValidationReportTool(server);
registerReferenceResources(server);

const transport = new StdioServerTransport();
await server.connect(transport);
