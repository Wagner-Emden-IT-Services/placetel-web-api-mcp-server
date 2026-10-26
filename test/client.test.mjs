/** Central HTTP client: auth header, 429 retry with Retry-After, path and query handling. */
import { TEST_API_KEY } from "./helpers/env.mjs";
import assert from "node:assert/strict";
import { after, afterEach, test } from "node:test";
import { API_BASE_URL, MAX_RETRIES_429 } from "../dist/constants.js";
import { placetelRequest } from "../dist/services/client.js";
import { installAxiosMock } from "./helpers/axios-mock.mjs";

const mock = installAxiosMock();
afterEach(() => mock.reset());
after(() => mock.restore());

/** Makes the retry sleep instant for this test and records the requested delays in ms. */
function instantSleep(t) {
  const delays = [];
  const realSetTimeout = globalThis.setTimeout;
  t.mock.method(globalThis, "setTimeout", (fn, ms, ...rest) => {
    delays.push(ms);
    return realSetTimeout(fn, 0, ...rest);
  });
  return delays;
}

test("sends the API key as Bearer token and asks for JSON", async () => {
  mock.reply(200, { id: 7 });
  assert.deepEqual(await placetelRequest("GET", "/me"), { id: 7 });
  const [req] = mock.requests;
  assert.equal(req.method, "GET");
  assert.equal(req.url.href, `${API_BASE_URL}/me`);
  assert.equal(req.headers.authorization, `Bearer ${TEST_API_KEY}`);
  assert.equal(req.headers.accept, "application/json");
});

test("sends a request body as JSON", async () => {
  mock.reply(201, { id: 1 });
  await placetelRequest("POST", "/contacts", { body: { first_name: "Erika", tags: ["a"] } });
  const [req] = mock.requests;
  assert.equal(req.method, "POST");
  assert.deepEqual(req.body, { first_name: "Erika", tags: ["a"] });
  assert.match(req.headers["content-type"], /^application\/json/);
});

test("fails without PLACETEL_API_KEY and sends nothing", async () => {
  delete process.env.PLACETEL_API_KEY;
  try {
    await assert.rejects(placetelRequest("GET", "/me"), /PLACETEL_API_KEY environment variable is not set/);
  } finally {
    process.env.PLACETEL_API_KEY = TEST_API_KEY;
  }
  assert.equal(mock.requests.length, 0);
});

test("retries HTTP 429 after the delay given in Retry-After", async (t) => {
  const delays = instantSleep(t);
  mock.reply(429, { message: "Too many requests" }, { "Retry-After": "2" });
  mock.reply(200, { ok: true });
  assert.deepEqual(await placetelRequest("GET", "/numbers"), { ok: true });
  assert.equal(mock.requests.length, 2);
  assert.deepEqual(delays, [2000]);
});

test("backs off exponentially on HTTP 429 without Retry-After", async (t) => {
  const delays = instantSleep(t);
  mock.reply(429, {});
  mock.reply(429, {});
  mock.reply(200, []);
  assert.deepEqual(await placetelRequest("GET", "/numbers"), []);
  assert.equal(mock.requests.length, 3);
  assert.deepEqual(delays, [1000, 2000]);
});

test("gives up on HTTP 429 after MAX_RETRIES_429 retries", async (t) => {
  const delays = instantSleep(t);
  for (let i = 0; i <= MAX_RETRIES_429; i++) mock.reply(429, {}, { "Retry-After": "1" });
  await assert.rejects(placetelRequest("GET", "/numbers"), (error) => error.response?.status === 429);
  assert.equal(mock.requests.length, MAX_RETRIES_429 + 1);
  assert.deepEqual(delays, Array(MAX_RETRIES_429).fill(1000));
});

test("does not retry other HTTP errors", async (t) => {
  const delays = instantSleep(t);
  mock.reply(500, { error: "boom" });
  await assert.rejects(placetelRequest("GET", "/numbers"), (error) => error.response?.status === 500);
  assert.equal(mock.requests.length, 1);
  assert.deepEqual(delays, []);
});

test("rejects a missing path parameter without sending a request", async () => {
  await assert.rejects(placetelRequest("GET", "/contacts/{id}"), /Missing required path parameter\(s\): \{id\}/);
  await assert.rejects(
    placetelRequest("DELETE", "/sip_users/{id}/short_codes/{code_id}", { pathParams: { id: 3 } }),
    /Missing required path parameter\(s\): \{code_id\}/,
  );
  assert.equal(mock.requests.length, 0);
});

test("fills in and URL-encodes path parameters", async () => {
  mock.reply(204, "");
  await placetelRequest("DELETE", "/sip_users/{id}/short_codes/{code_id}", { pathParams: { id: 12, code_id: "a/b c" } });
  assert.equal(mock.requests[0].url.pathname, "/v2/sip_users/12/short_codes/a%2Fb%20c");
});

test("drops empty query values and keeps falsy ones", async () => {
  mock.reply(200, []);
  await placetelRequest("GET", "/contacts", {
    query: { page: 2, per_page: undefined, "filter[company]": null, "search[number]": "123", "filter[blocked]": false, zero: 0 },
  });
  const [req] = mock.requests;
  assert.deepEqual(req.params, { page: 2, "search[number]": "123", "filter[blocked]": false, zero: 0 });
  assert.deepEqual([...req.url.searchParams.keys()], ["page", "search[number]", "filter[blocked]", "zero"]);
});

test("sends no query string when every query value is empty", async () => {
  mock.reply(200, []);
  await placetelRequest("GET", "/contacts", { query: { page: undefined, "filter[email]": null } });
  const [req] = mock.requests;
  assert.equal(req.params, undefined);
  assert.equal(req.url.search, "");
});
