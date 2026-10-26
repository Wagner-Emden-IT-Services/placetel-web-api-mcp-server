import axios, { AxiosError, AxiosHeaders } from "axios";

/**
 * Replaces the adapter of the axios default instance (the one src/services/client.ts uses), so no request
 * ever leaves the process. Every request is recorded; responses come from a queue armed by the test.
 * A request without an armed response is recorded as unexpected and fails with an error.
 */
export function installAxiosMock() {
  const requests = [];
  const unexpected = [];
  const queue = [];
  const originalAdapter = axios.defaults.adapter;

  axios.defaults.adapter = async (config) => {
    const request = {
      method: String(config.method).toUpperCase(),
      // The URL exactly as axios would put it on the wire, including the serialized query string.
      url: new URL(axios.getUri(config)),
      params: config.params,
      body: typeof config.data === "string" && config.data !== "" ? JSON.parse(config.data) : config.data,
      headers: lowerCaseKeys(AxiosHeaders.from(config.headers).toJSON()),
    };
    requests.push(request);
    const reply = queue.shift();
    if (!reply) {
      unexpected.push(request);
      throw new Error(`Unexpected request: ${request.method} ${request.url.href}`);
    }
    const response = {
      data: reply.data,
      status: reply.status,
      statusText: "",
      headers: new AxiosHeaders(lowerCaseKeys(reply.headers ?? {})),
      config,
      request: {},
    };
    if (config.validateStatus(response.status)) return response;
    throw new AxiosError(
      `Request failed with status code ${response.status}`,
      response.status >= 500 ? AxiosError.ERR_BAD_RESPONSE : AxiosError.ERR_BAD_REQUEST,
      config,
      {},
      response,
    );
  };

  return {
    requests,
    unexpected,
    /** Queue one response for the next request. */
    reply(status, data, headers) {
      queue.push({ status, data, headers });
    },
    /** Forget recorded requests and pending responses. */
    reset() {
      requests.length = 0;
      unexpected.length = 0;
      queue.length = 0;
    },
    get pending() {
      return queue.length;
    },
    restore() {
      axios.defaults.adapter = originalAdapter;
    },
  };
}

function lowerCaseKeys(obj) {
  return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k.toLowerCase(), v]));
}
