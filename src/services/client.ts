import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { API_BASE_URL, MAX_RETRIES_429, REQUEST_TIMEOUT_MS } from "../constants.js";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface RequestOptions {
  /** Values substituted into `{placeholders}` in the path template, e.g. { id: 42 }. */
  pathParams?: Record<string, string | number>;
  /** Query string parameters. Undefined/null values are dropped. */
  query?: Record<string, unknown>;
  /** JSON request body (for POST/PUT/PATCH). */
  body?: unknown;
}

function getApiKey(): string {
  const key = process.env.PLACETEL_API_KEY;
  if (!key) {
    throw new Error("PLACETEL_API_KEY environment variable is not set.");
  }
  return key;
}

function buildPath(template: string, pathParams?: Record<string, string | number>): string {
  let path = template;
  if (pathParams) {
    for (const [key, value] of Object.entries(pathParams)) {
      path = path.replace(`{${key}}`, encodeURIComponent(String(value)));
    }
  }
  const missing = path.match(/\{[^}]+\}/g);
  if (missing) {
    throw new Error(`Missing required path parameter(s): ${missing.join(", ")}`);
  }
  return path;
}

function pruneQuery(query?: Record<string, unknown>): Record<string, unknown> | undefined {
  if (!query) return undefined;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(query)) {
    if (v !== undefined && v !== null) out[k] = v;
  }
  return Object.keys(out).length ? out : undefined;
}

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Central Placetel API request helper.
 * - Adds Bearer auth from PLACETEL_API_KEY.
 * - Substitutes path params, prunes empty query values.
 * - Retries automatically on HTTP 429, honoring the Retry-After header.
 * Throws on non-2xx (handle with handleApiError()).
 */
export async function placetelRequest<T = unknown>(
  method: HttpMethod,
  pathTemplate: string,
  options: RequestOptions = {},
): Promise<T> {
  const url = `${API_BASE_URL}${buildPath(pathTemplate, options.pathParams)}`;
  const config: AxiosRequestConfig = {
    method,
    url,
    params: pruneQuery(options.query),
    data: options.body,
    timeout: REQUEST_TIMEOUT_MS,
    headers: {
      Authorization: `Bearer ${getApiKey()}`,
      Accept: "application/json",
      ...(options.body !== undefined ? { "Content-Type": "application/json" } : {}),
    },
  };

  let attempt = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      const response = await axios<T>(config);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 429 && attempt < MAX_RETRIES_429) {
        const retryAfter = Number(axiosError.response.headers["retry-after"]);
        const waitMs =
          Number.isFinite(retryAfter) && retryAfter > 0
            ? retryAfter * 1000
            : Math.min(2 ** attempt * 1000, 8000);
        attempt += 1;
        await sleep(waitMs);
        continue;
      }
      throw error;
    }
  }
}
