#!/usr/bin/env node
/**
 * Smoke test: spawn the built server over stdio, list its tools, print the count.
 * Non-interactive — the tool count lands in stdout for the /goal evidence.
 */
import "dotenv/config";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const transport = new StdioClientTransport({
  command: "node",
  args: ["dist/index.js"],
  env: { ...process.env },
  stderr: "inherit",
});

const client = new Client({ name: "placetel-smoke", version: "1.0.0" });

try {
  await client.connect(transport);
  const { tools } = await client.listTools();
  console.log(`TOOL_COUNT=${tools.length}`);
  for (const name of tools.map((t) => t.name).sort()) {
    console.log(name);
  }
} catch (error) {
  console.error("SMOKE_FAILED:", error?.message ?? error);
  process.exitCode = 1;
} finally {
  await client.close();
}
