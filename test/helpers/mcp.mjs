import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SERVER_NAME, SERVER_VERSION } from "../../dist/constants.js";
import { registerAllTools } from "../../dist/tools/index.js";

/** Starts the built server with all tools and connects a real MCP client over the SDK's in-memory transport. */
export async function connectClient() {
  const server = new McpServer({ name: SERVER_NAME, version: SERVER_VERSION });
  registerAllTools(server);
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  const client = new Client({ name: "placetel-offline-tests", version: "1.0.0" });
  await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);
  return {
    client,
    async close() {
      await client.close();
      await server.close();
    },
  };
}

/** Text of the first content block of a tool result. */
export function resultText(result) {
  return result.content?.[0]?.type === "text" ? result.content[0].text : undefined;
}
