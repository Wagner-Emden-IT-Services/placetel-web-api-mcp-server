/**
 * Error texts (src/services/errors.ts), directly and as seen by an MCP client.
 */
import "./helpers/env.mjs";
import assert from "node:assert/strict";
import { after, afterEach, describe, it } from "node:test";
import axios from "axios";
import { z } from "zod";
import { placetelRequest } from "../dist/services/client.js";
import { handleApiError } from "../dist/services/errors.js";
import { resetMock, respondWith } from "./helpers/axios-mock.mjs";
import { connectClient, resultText } from "./helpers/mcp.mjs";

afterEach(() => resetMock());

/** The error placetelRequest throws for a given HTTP answer. */
async function errorFor(status, data, headers) {
  respondWith(() => ({ status, data, headers }));
  try {
    await placetelRequest("GET", "/contacts/{id}", { pathParams: { id: 1 } });
  } catch (error) {
    return error;
  } finally {
    resetMock();
  }
  throw new Error(`HTTP ${status} did not throw`);
}

describe("handleApiError", () => {
  it("401 points to the API key", async () => {
    assert.equal(
      handleApiError(await errorFor(401, { error: "unauthorized" })),
      "Error 401 (Unauthorized): PLACETEL_API_KEY is missing or invalid. Verify the API key.",
    );
  });

  it("404 points to the ID", async () => {
    assert.equal(handleApiError(await errorFor(404, {})), "Error 404 (Not Found): the resource does not exist. Check the ID.");
  });

  it("422 includes the validation details from the response", async () => {
    const text = handleApiError(await errorFor(422, { errors: { name: ["can't be blank"] } }));
    assert.match(text, /^Error 422 \(Unprocessable Entity\): validation failed\. /);
    assert.ok(text.includes(`{"errors":{"name":["can't be blank"]}}`), text);
  });

  it("429 explains the rate limit after the client retries", async () => {
    const error = await errorFor(429, {}, { "retry-after": "0.01" });
    assert.equal(
      handleApiError(error),
      "Error 429 (Rate Limited): too many requests. The client already retried with Retry-After; try again shortly.",
    );
  });

  it("400 and 403 have their own texts", async () => {
    assert.equal(handleApiError(await errorFor(400, "bad page")), "Error 400 (Bad Request): bad page");
    assert.equal(handleApiError(await errorFor(400, undefined)), "Error 400 (Bad Request): check the request parameters.");
    assert.equal(handleApiError(await errorFor(403, {})), "Error 403 (Forbidden): the API key lacks permission for this resource.");
  });

  it("other statuses report the code and a shortened body", async () => {
    const text = handleApiError(await errorFor(503, "x".repeat(800)));
    assert.equal(text, `Error 503: API request failed. ${"x".repeat(500)}`);
  });

  it("timeouts and network errors without a response", () => {
    const timeout = new axios.AxiosError("timeout of 30000ms exceeded", "ECONNABORTED");
    assert.equal(handleApiError(timeout), "Error: request timed out. Please try again.");
    const refused = new axios.AxiosError("connect ECONNREFUSED", "ECONNREFUSED");
    assert.equal(handleApiError(refused), "Error: network error (ECONNREFUSED): connect ECONNREFUSED");
  });

  it("invalid input and unexpected errors", () => {
    const zodError = z.object({ id: z.number() }).safeParse({ id: "x" }).error;
    assert.match(handleApiError(zodError), /^Error: invalid input: id: /);
    assert.equal(handleApiError(new Error("boom")), "Error: unexpected error: boom");
    assert.equal(handleApiError("plain"), "Error: unexpected error: plain");
  });
});

describe("error results through the MCP client", () => {
  const connection = connectClient();
  after(async () => (await connection).close());

  for (const [status, expected] of [
    [401, /^Error 401 \(Unauthorized\)/],
    [404, /^Error 404 \(Not Found\)/],
    [422, /^Error 422 \(Unprocessable Entity\)/],
    [500, /^Error 500: API request failed\./],
  ]) {
    it(`HTTP ${status} becomes an isError result`, async () => {
      const { client } = await connection;
      respondWith(() => ({ status, data: { error: "example" } }));
      const result = await client.callTool({ name: "placetel_get_contact", arguments: { id: 1 } });
      assert.equal(result.isError, true);
      assert.match(resultText(result), expected);
    });
  }
});
