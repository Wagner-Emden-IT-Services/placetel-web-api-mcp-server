/**
 * Connects a real MCP client to a server with all Placetel tools over the SDK's
 * in-memory transport. Does not import dist/index.js (which loads dotenv and stdio).
 */
import "./env.mjs";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerAllTools } from "../../dist/tools/index.js";

export async function connectClient() {
  const server = new McpServer({ name: "placetel-mcp-server-test", version: "0.0.0" });
  registerAllTools(server);
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  await server.connect(serverTransport);
  const client = new Client({ name: "placetel-offline-tests", version: "0.0.0" });
  await client.connect(clientTransport);
  return {
    client,
    async close() {
      await client.close();
      await server.close();
    },
  };
}

/** Text of the first content item of a tool result. */
export function resultText(result) {
  const item = result?.content?.[0];
  return item && item.type === "text" ? item.text : "";
}
