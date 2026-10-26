/** Error texts returned to the agent: HTTP 401, 404, 422, 429, other statuses, network and input errors. */
import "./helpers/env.mjs";
import assert from "node:assert/strict";
import { test } from "node:test";
import { AxiosError } from "axios";
import { z } from "zod";
import { handleApiError } from "../dist/services/errors.js";
import { installAxiosMock } from "./helpers/axios-mock.mjs";
import { connectClient, resultText } from "./helpers/mcp.mjs";

function httpError(status, data) {
  const response = { status, statusText: "", data, headers: {}, config: {} };
  return new AxiosError(`Request failed with status code ${status}`, AxiosError.ERR_BAD_REQUEST, {}, {}, response);
}

test("401: points to the API key", () => {
  assert.equal(
    handleApiError(httpError(401, { error: "unauthorized" })),
    "Error 401 (Unauthorized): PLACETEL_API_KEY is missing or invalid. Verify the API key.",
  );
});

test("404: points to the id", () => {
  assert.equal(handleApiError(httpError(404, "")), "Error 404 (Not Found): the resource does not exist. Check the ID.");
});

test("422: includes the validation details", () => {
  assert.equal(
    handleApiError(httpError(422, { errors: { name: ["can't be blank"] } })),
    'Error 422 (Unprocessable Entity): validation failed. {"errors":{"name":["can\'t be blank"]}}',
  );
});

test("429: says the client already retried with Retry-After", () => {
  assert.equal(
    handleApiError(httpError(429, {})),
    "Error 429 (Rate Limited): too many requests. The client already retried with Retry-After; try again shortly.",
  );
});

test("400 and 403 have their own texts", () => {
  assert.equal(handleApiError(httpError(400, "page must be positive")), "Error 400 (Bad Request): page must be positive");
  assert.equal(handleApiError(httpError(400, undefined)), "Error 400 (Bad Request): check the request parameters.");
  assert.equal(
    handleApiError(httpError(403, {})),
    "Error 403 (Forbidden): the API key lacks permission for this resource.",
  );
});

test("other statuses report the status code and the details", () => {
  assert.equal(handleApiError(httpError(500, { error: "boom" })), 'Error 500: API request failed. {"error":"boom"}');
  assert.equal(handleApiError(httpError(503, "maintenance")), "Error 503: API request failed. maintenance");
});

test("details are cut to 500 characters", () => {
  const text = handleApiError(httpError(500, "x".repeat(800)));
  assert.equal(text, `Error 500: API request failed. ${"x".repeat(500)}`);
});

test("timeouts and network errors without a response", () => {
  assert.equal(
    handleApiError(new AxiosError("timeout of 30000ms exceeded", "ECONNABORTED")),
    "Error: request timed out. Please try again.",
  );
  assert.equal(
    handleApiError(new AxiosError("connect ECONNREFUSED", "ECONNREFUSED")),
    "Error: network error (ECONNREFUSED): connect ECONNREFUSED",
  );
});

test("invalid input and unexpected errors", () => {
  const zodError = z.object({ id: z.number() }).safeParse({ id: "x" }).error;
  assert.match(handleApiError(zodError), /^Error: invalid input: id: /);
  assert.equal(handleApiError(new Error("boom")), "Error: unexpected error: boom");
  assert.equal(handleApiError("boom"), "Error: unexpected error: boom");
});

test("tools return API errors as isError results", async () => {
  const mock = installAxiosMock();
  const { client, close } = await connectClient();
  try {
    await expectToolErrors(client, mock);
  } finally {
    await close();
    mock.restore();
  }
});

async function expectToolErrors(client, mock) {
  const cases = [
    [401, {}, "placetel_list_contacts", {}, /^Error 401 \(Unauthorized\)/],
    [404, "", "placetel_get_contact", { id: 99 }, /^Error 404 \(Not Found\)/],
    [422, { errors: { recipient: ["is invalid"] } }, "placetel_send_sms", { recipient: "0", message: "hi" }, /^Error 422 .*is invalid/],
    [502, "bad gateway", "placetel_get_me", {}, /^Error 502: API request failed\. bad gateway$/],
  ];
  for (const [status, data, name, args, expected] of cases) {
    mock.reset();
    mock.reply(status, data);
    const result = await client.callTool({ name, arguments: { ...args, response_format: "json" } });
    assert.equal(result.isError, true, name);
    assert.match(resultText(result), expected);
  }
}
