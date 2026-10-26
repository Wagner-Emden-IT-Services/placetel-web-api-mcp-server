/**
 * Central HTTP client (src/services/client.ts): auth header, 429 retry with Retry-After,
 * path parameters and query pruning. All requests go to the axios-level mock.
 */
import { TEST_API_KEY } from "./helpers/env.mjs";
import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { API_BASE_URL, MAX_RETRIES_429 } from "../dist/constants.js";
import { placetelRequest } from "../dist/services/client.js";
import { recordedRequests, resetMock, respondWith } from "./helpers/axios-mock.mjs";

afterEach(() => resetMock());

describe("placetelRequest", () => {
  it("sends the API key as Bearer token and asks for JSON", async () => {
    respondWith(() => ({ status: 200, data: { id: 7 } }));
    const data = await placetelRequest("GET", "/me");
    assert.deepEqual(data, { id: 7 });
    const [request] = recordedRequests();
    assert.equal(request.authorization, `Bearer ${TEST_API_KEY}`);
    assert.equal(request.accept, "application/json");
    assert.equal(request.url, `${API_BASE_URL}/me`);
    assert.equal(request.method, "GET");
  });

  it("sends a JSON body with Content-Type only when a body is given", async () => {
    respondWith(() => ({ status: 200, data: {} }));
    await placetelRequest("POST", "/contacts", { body: { first_name: "Erika" } });
    await placetelRequest("DELETE", "/contacts/{id}", { pathParams: { id: 3 } });
    const [withBody, withoutBody] = recordedRequests();
    assert.deepEqual(withBody.body, { first_name: "Erika" });
    assert.match(String(withBody.contentType), /application\/json/);
    assert.equal(withoutBody.body, undefined);
  });

  it("fails without PLACETEL_API_KEY and sends nothing", async () => {
    respondWith(() => ({ status: 200, data: {} }));
    delete process.env.PLACETEL_API_KEY;
    try {
      await assert.rejects(placetelRequest("GET", "/me"), /PLACETEL_API_KEY environment variable is not set/);
    } finally {
      process.env.PLACETEL_API_KEY = TEST_API_KEY;
    }
    assert.equal(recordedRequests().length, 0);
  });

  it("substitutes and URL-encodes path parameters", async () => {
    respondWith(() => ({ status: 200, data: {} }));
    await placetelRequest("GET", "/routings/{number_or_id}", { pathParams: { number_or_id: "+49 221/123" } });
    assert.equal(recordedRequests()[0].url, `${API_BASE_URL}/routings/%2B49%20221%2F123`);
  });

  it("rejects a missing path parameter before sending anything", async () => {
    respondWith(() => ({ status: 200, data: {} }));
    await assert.rejects(
      placetelRequest("GET", "/numbers/{number_id}/profiles/{id}", { pathParams: { number_id: 5 } }),
      /Missing required path parameter\(s\): \{id\}/,
    );
    assert.equal(recordedRequests().length, 0);
  });

  it("drops undefined and null query values", async () => {
    respondWith(() => ({ status: 200, data: [] }));
    await placetelRequest("GET", "/contacts", { query: { page: 2, per_page: undefined, "filter[company]": null, "search[number]": "0221" } });
    assert.deepEqual(recordedRequests()[0].params, { page: 2, "search[number]": "0221" });
  });

  it("sends no query string when every query value is empty", async () => {
    respondWith(() => ({ status: 200, data: [] }));
    await placetelRequest("GET", "/contacts", { query: { page: undefined, per_page: null } });
    assert.equal(recordedRequests()[0].params, undefined);
  });

  it("retries after HTTP 429 and waits for the Retry-After seconds", async () => {
    let calls = 0;
    respondWith(() => {
      calls += 1;
      return calls === 1 ? { status: 429, headers: { "retry-after": "1" }, data: {} } : { status: 200, data: { ok: true } };
    });
    const started = process.hrtime.bigint();
    const data = await placetelRequest("GET", "/me");
    const waitedMs = Number(process.hrtime.bigint() - started) / 1e6;
    assert.deepEqual(data, { ok: true });
    assert.equal(recordedRequests().length, 2);
    assert.ok(waitedMs >= 900, `waited only ${waitedMs.toFixed(0)} ms for Retry-After: 1`);
  });

  it(`gives up after ${MAX_RETRIES_429} retries on persistent HTTP 429`, async () => {
    respondWith(() => ({ status: 429, headers: { "retry-after": "0.01" }, data: {} }));
    await assert.rejects(placetelRequest("GET", "/me"), (error) => error?.response?.status === 429);
    assert.equal(recordedRequests().length, MAX_RETRIES_429 + 1);
  });

  it("does not retry other errors", async () => {
    respondWith(() => ({ status: 500, data: { error: "boom" } }));
    await assert.rejects(placetelRequest("GET", "/me"), (error) => error?.response?.status === 500);
    assert.equal(recordedRequests().length, 1);
  });
});
