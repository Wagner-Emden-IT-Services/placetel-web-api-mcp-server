/**
 * Output formatting (src/services/format.ts), pagination metadata (src/services/pagination.ts)
 * and truncation at CHARACTER_LIMIT, directly and through the MCP client.
 */
import "./helpers/env.mjs";
import assert from "node:assert/strict";
import { after, afterEach, describe, it } from "node:test";
import { CHARACTER_LIMIT } from "../dist/constants.js";
import { formatList, formatOne, toolError, toolText } from "../dist/services/format.js";
import { paginationMeta } from "../dist/services/pagination.js";
import { ResponseFormat } from "../dist/types.js";
import { resetMock, respondWith } from "./helpers/axios-mock.mjs";
import { connectClient, resultText } from "./helpers/mcp.mjs";

afterEach(() => resetMock());

describe("paginationMeta", () => {
  it("reports more pages when a full page came back", () => {
    assert.deepEqual(paginationMeta([1, 2], 2, 3), { count: 2, page: 3, per_page: 2, has_more: true, next_page: 4 });
  });

  it("reports the last page when fewer items came back", () => {
    assert.deepEqual(paginationMeta([1], 2, 3), { count: 1, page: 3, per_page: 2, has_more: false });
  });

  it("defaults to page 1 and no has_more without per_page", () => {
    assert.deepEqual(paginationMeta([1, 2, 3]), { count: 3, page: 1, has_more: false });
  });

  it("treats a non-array answer as empty", () => {
    assert.deepEqual(paginationMeta({ id: 1 }, 10), { count: 0, page: 1, per_page: 10, has_more: false });
  });
});

describe("response_format", () => {
  const items = [{ id: 1, name: "Example entry", tags: ["a"], empty: "" }];

  it("json lists are pretty JSON with the pagination fields", () => {
    const result = formatList(items, paginationMeta(items, 1, 1), ResponseFormat.JSON);
    assert.deepEqual(JSON.parse(resultText(result)), { count: 1, page: 1, per_page: 1, has_more: true, next_page: 2, items });
  });

  it("markdown lists have a count header and bullet items without empty fields", () => {
    const text = resultText(formatList(items, paginationMeta(items, 1, 1), ResponseFormat.MARKDOWN));
    assert.ok(text.startsWith("**1 item(s)** (page 1) — more available, increase `page`."), text);
    assert.ok(text.includes("- **name**: Example entry"));
    assert.ok(text.includes('- **tags**: ["a"]'));
    assert.ok(!text.includes("**empty**"));
  });

  it("markdown says so when a list is empty", () => {
    assert.ok(resultText(formatList([], paginationMeta([]), ResponseFormat.MARKDOWN)).endsWith("_No results._"));
  });

  it("single objects in json and markdown", () => {
    assert.deepEqual(JSON.parse(resultText(formatOne({ id: 2 }, ResponseFormat.JSON))), { id: 2 });
    assert.equal(resultText(formatOne({ id: 2 }, ResponseFormat.MARKDOWN)), "- **id**: 2");
    assert.equal(resultText(formatOne({}, ResponseFormat.MARKDOWN)), "_(empty)_");
  });

  it("error results are flagged and not truncated", () => {
    const long = "e".repeat(CHARACTER_LIMIT + 10);
    assert.deepEqual(toolError(long), { content: [{ type: "text", text: long }], isError: true });
  });
});

describe("CHARACTER_LIMIT", () => {
  it("leaves text up to the limit unchanged", () => {
    const text = "a".repeat(CHARACTER_LIMIT);
    assert.equal(resultText(toolText(text)), text);
  });

  it("cuts longer text at the limit and says how to narrow the result", () => {
    const text = resultText(toolText("a".repeat(CHARACTER_LIMIT + 1)));
    assert.ok(text.startsWith("a".repeat(CHARACTER_LIMIT) + "\n\n"));
    assert.ok(text.endsWith(`[... truncated at ${CHARACTER_LIMIT} characters. Use pagination (page/per_page) or filters to narrow the result.]`));
    assert.ok(!text.includes("a".repeat(CHARACTER_LIMIT + 1)));
  });
});

describe("through the MCP client", () => {
  const connection = connectClient();
  after(async () => (await connection).close());

  it("list tools pass page and per_page and report has_more", async () => {
    const { client } = await connection;
    let params;
    respondWith((request) => {
      params = request.params;
      return { status: 200, data: [{ id: 1 }, { id: 2 }] };
    });
    const result = await client.callTool({
      name: "placetel_list_contacts",
      arguments: { page: 2, per_page: 2, response_format: "json" },
    });
    assert.deepEqual(params, { page: 2, per_page: 2 });
    const body = JSON.parse(resultText(result));
    assert.equal(body.has_more, true);
    assert.equal(body.next_page, 3);
    assert.equal(body.items.length, 2);
  });

  it("response_format defaults to markdown", async () => {
    const { client } = await connection;
    respondWith(() => ({ status: 200, data: { id: 9, first_name: "Erika" } }));
    const result = await client.callTool({ name: "placetel_get_contact", arguments: { id: 9 } });
    assert.equal(resultText(result), "- **id**: 9\n- **first_name**: Erika");
  });

  it("large answers are truncated at CHARACTER_LIMIT", async () => {
    const { client } = await connection;
    const many = Array.from({ length: 400 }, (_, i) => ({ id: i, note: "n".repeat(100) }));
    respondWith(() => ({ status: 200, data: many }));
    const result = await client.callTool({ name: "placetel_list_contacts", arguments: { response_format: "json" } });
    const text = resultText(result);
    assert.ok(!result.isError);
    assert.ok(text.includes(`[... truncated at ${CHARACTER_LIMIT} characters.`), "no truncation notice");
    assert.ok(text.length < CHARACTER_LIMIT + 200, `text has ${text.length} characters`);
  });
});
