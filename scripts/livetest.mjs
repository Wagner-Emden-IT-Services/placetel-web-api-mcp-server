#!/usr/bin/env node
/**
 * Live test against the Placetel test account via the built MCP server.
 * Testaccount guard first (get_me), then read-only smoke, then a safe
 * create -> get -> delete roundtrip on a throwaway contact.
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
const client = new Client({ name: "placetel-livetest", version: "1.0.0" });

const textOf = (r) => (r?.content ?? []).map((c) => c.text).join("\n");
async function call(name, args = {}) {
  const res = await client.callTool({ name, arguments: args });
  return { text: textOf(res), isError: !!res.isError };
}

try {
  await client.connect(transport);

  console.log("=== (4) TESTACCOUNT GUARD: placetel_get_me ===");
  const me = await call("placetel_get_me", { response_format: "json" });
  console.log("isError:", me.isError);
  console.log(me.text.slice(0, 600));

  console.log("\n=== (5) READ-ONLY SMOKE ===");
  for (const [tool, args] of [
    ["placetel_list_contacts", { per_page: 2, response_format: "json" }],
    ["placetel_list_numbers", { per_page: 2, response_format: "json" }],
    ["placetel_list_sip_users", { per_page: 2, response_format: "json" }],
  ]) {
    const r = await call(tool, args);
    console.log(`\n-- ${tool} -- isError=${r.isError}`);
    console.log(r.text.slice(0, 300));
  }

  console.log("\n=== (6) SAFE WRITE ROUNDTRIP (create -> get -> delete) ===");
  const stamp = Date.now();
  const created = await call("placetel_create_contact", {
    first_name: "MCP",
    last_name: `Smoke ${stamp}`,
    company: "MCP Roundtrip (delete me)",
    phone: "+4972100000000",
    response_format: "json",
  });
  console.log("\n-- create -- isError=", created.isError);
  console.log(created.text.slice(0, 400));

  let id;
  try {
    id = JSON.parse(created.text)?.id;
  } catch {
    const m = created.text.match(/"id"\s*:\s*(\d+)/);
    id = m ? Number(m[1]) : undefined;
  }
  console.log("parsed id:", id);

  if (id !== undefined) {
    const got = await call("placetel_get_contact", { id, response_format: "json" });
    console.log("\n-- get -- isError=", got.isError);
    console.log(got.text.slice(0, 300));

    const del = await call("placetel_delete_contact", { id });
    console.log("\n-- delete -- isError=", del.isError);
    console.log(del.text.slice(0, 200));
  } else {
    console.log("Could not parse created contact id; skipping get/delete.");
    process.exitCode = 1;
  }
} catch (error) {
  console.error("LIVETEST_FAILED:", error?.message ?? error);
  process.exitCode = 1;
} finally {
  await client.close();
}
