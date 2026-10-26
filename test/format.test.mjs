/** Response formatting: response_format json/markdown, pagination meta and truncation at CHARACTER_LIMIT. */
import "./helpers/env.mjs";
import assert from "node:assert/strict";
import { after, before, beforeEach, test } from "node:test";
import { CHARACTER_LIMIT } from "../dist/constants.js";
import { formatList, formatOne, toolError, toolText } from "../dist/services/format.js";
import { paginationMeta } from "../dist/services/pagination.js";
import { ResponseFormat } from "../dist/types.js";
import { installAxiosMock } from "./helpers/axios-mock.mjs";
import { connectClient, resultText } from "./helpers/mcp.mjs";

const TRUNCATION_NOTE = `\n\n[... truncated at ${CHARACTER_LIMIT} characters. Use pagination (page/per_page) or filters to narrow the result.]`;

let mock;
let mcp;
before(async () => {
  mock = installAxiosMock();
  mcp = await connectClient();
});
beforeEach(() => mock.reset());
after(async () => {
  await mcp.close();
  mock.restore();
});

test("pagination: a full page means there is probably a next page", () => {
  assert.deepEqual(paginationMeta(Array(25).fill({}), 25, 2), { count: 25, page: 2, per_page: 25, has_more: true, next_page: 3 });
});

test("pagination: a short page or no per_page means no next page", () => {
  assert.deepEqual(paginationMeta([{}, {}, {}], 25, 1), { count: 3, page: 1, per_page: 25, has_more: false });
  assert.deepEqual(paginationMeta([{}, {}, {}]), { count: 3, page: 1, has_more: false });
  assert.deepEqual(paginationMeta({ not: "a list" }, 10), { count: 0, page: 1, per_page: 10, has_more: false });
});

test("pagination through a list tool: page/per_page sent, meta in the result", async () => {
  const items = [{ id: 1, last_name: "Muster" }, { id: 2, last_name: "Beispiel" }];
  mock.reply(200, items);
  const json = await mcp.client.callTool({ name: "placetel_list_contacts", arguments: { page: 2, per_page: 2, response_format: "json" } });
  assert.equal(mock.requests[0].url.search, "?page=2&per_page=2");
  assert.deepEqual(JSON.parse(resultText(json)), { count: 2, page: 2, per_page: 2, has_more: true, next_page: 3, items });

  mock.reply(200, items.slice(0, 1));
  const markdown = await mcp.client.callTool({ name: "placetel_list_contacts", arguments: { page: 3, per_page: 2, response_format: "markdown" } });
  assert.equal(resultText(markdown), "**1 item(s)** (page 3)\n\n### 1\n- **id**: 1\n- **last_name**: Muster");
});

test("response_format json and markdown of single objects and lists", () => {
  const contact = { id: 5, first_name: "Erika", email: "", tags: ["a", "b"], company: null };
  assert.equal(resultText(formatOne(contact, ResponseFormat.JSON)), JSON.stringify(contact, null, 2));
  assert.equal(resultText(formatOne(contact, ResponseFormat.MARKDOWN)), '- **id**: 5\n- **first_name**: Erika\n- **tags**: ["a","b"]');
  assert.equal(resultText(formatOne({}, ResponseFormat.MARKDOWN)), "_(empty)_");
  assert.equal(resultText(formatList([], paginationMeta([]), ResponseFormat.MARKDOWN)), "**0 item(s)** (page 1)\n\n_No results._");
  const more = formatList([{ id: 1 }], paginationMeta([{ id: 1 }], 1, 1), ResponseFormat.MARKDOWN);
  assert.equal(resultText(more), "**1 item(s)** (page 1) — more available, increase `page`.\n\n### 1\n- **id**: 1");
});

test("errors are flagged with isError", () => {
  assert.deepEqual(toolError("Error 404"), { content: [{ type: "text", text: "Error 404" }], isError: true });
});

test("text up to CHARACTER_LIMIT is not truncated", () => {
  const text = "a".repeat(CHARACTER_LIMIT);
  assert.equal(resultText(toolText(text)), text);
});

test("text above CHARACTER_LIMIT is cut with a pagination hint", () => {
  assert.equal(resultText(toolText("b".repeat(CHARACTER_LIMIT) + "c")), "b".repeat(CHARACTER_LIMIT) + TRUNCATION_NOTE);
  assert.equal(resultText(toolText("d".repeat(CHARACTER_LIMIT * 2))), "d".repeat(CHARACTER_LIMIT) + TRUNCATION_NOTE);
});

test("large tool results are truncated at CHARACTER_LIMIT", async () => {
  const items = Array.from({ length: 500 }, (_, i) => ({ id: i, name: `Contact ${i}`, notes: "n".repeat(100) }));
  for (const format of ["json", "markdown"]) {
    mock.reply(200, items);
    const result = await mcp.client.callTool({ name: "placetel_list_contacts", arguments: { response_format: format } });
    const text = resultText(result);
    assert.notEqual(result.isError, true);
    assert.equal(text.length, CHARACTER_LIMIT + TRUNCATION_NOTE.length, format);
    assert.ok(text.endsWith(TRUNCATION_NOTE), format);
  }
});
