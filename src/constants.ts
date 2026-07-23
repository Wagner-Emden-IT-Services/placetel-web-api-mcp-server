/** Shared constants for the Placetel MCP server. */

export const API_BASE_URL = "https://api.placetel.de/v2";

/** Max characters in a tool text response before truncation. */
export const CHARACTER_LIMIT = 25000;

/** HTTP request timeout in milliseconds. */
export const REQUEST_TIMEOUT_MS = 30000;

/** Max automatic retries when the API answers HTTP 429 (rate limited). */
export const MAX_RETRIES_429 = 3;

export const SERVER_NAME = "placetel-mcp-server";
export const SERVER_VERSION = "1.0.1";
