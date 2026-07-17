#!/usr/bin/env node
import "dotenv/config";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { SERVER_NAME, SERVER_VERSION } from "./constants.js";
import { registerAllTools } from "./tools/index.js";

async function main(): Promise<void> {
  if (!process.env.PLACETEL_API_KEY) {
    console.error(
      "ERROR: PLACETEL_API_KEY environment variable is required. Set it in .env or your MCP client config.",
    );
    process.exit(1);
  }

  const server = new McpServer({ name: SERVER_NAME, version: SERVER_VERSION });
  registerAllTools(server);

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(`${SERVER_NAME} v${SERVER_VERSION} running on stdio`);
}

main().catch((error) => {
  console.error("Fatal error starting placetel-mcp-server:", error);
  process.exit(1);
});
