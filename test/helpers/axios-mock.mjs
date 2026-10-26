/**
 * Offline HTTP mock on the axios level.
 *
 * The client calls the axios default instance, so replacing `axios.defaults.adapter`
 * intercepts every request before it reaches the network. Each request is recorded;
 * without a responder set by the test, the adapter throws, so an unexpected request
 * fails loudly instead of leaving the machine.
 */
import axios from "axios";

const requests = [];
let responder = null;

function headerValue(headers, name) {
  if (!headers) return undefined;
  if (typeof headers.get === "function") return headers.get(name) ?? undefined;
  const key = Object.keys(headers).find((k) => k.toLowerCase() === name.toLowerCase());
  return key ? headers[key] : undefined;
}

function parseBody(data) {
  if (data === undefined || data === null || data === "") return undefined;
  if (typeof data !== "string") return data;
  try {
    return JSON.parse(data);
  } catch {
    return data;
  }
}

axios.defaults.adapter = async (config) => {
  const request = {
    method: String(config.method).toUpperCase(),
    url: config.url,
    params: config.params,
    body: parseBody(config.data),
    authorization: headerValue(config.headers, "Authorization"),
    accept: headerValue(config.headers, "Accept"),
    contentType: headerValue(config.headers, "Content-Type"),
  };
  requests.push(request);
  if (!responder) {
    throw new Error(`Unexpected HTTP request in offline tests: ${request.method} ${request.url}`);
  }
  const reply = await responder(request, config);
  const response = {
    data: reply.data,
    status: reply.status ?? 200,
    statusText: reply.statusText ?? "",
    headers: reply.headers ?? {},
    config,
    request: {},
  };
  const validate = config.validateStatus;
  if (!validate || validate(response.status)) return response;
  throw new axios.AxiosError(
    `Request failed with status code ${response.status}`,
    response.status >= 500 ? "ERR_BAD_RESPONSE" : "ERR_BAD_REQUEST",
    config,
    response.request,
    response,
  );
};

/** Set how the mock answers; `fn(request, config)` returns `{ status?, data?, headers? }` or throws. */
export function respondWith(fn) {
  responder = fn;
}

/** Forget recorded requests and the responder (every later request throws until respondWith). */
export function resetMock() {
  requests.length = 0;
  responder = null;
}

/** Requests recorded since the last reset. */
export function recordedRequests() {
  return requests.slice();
}
