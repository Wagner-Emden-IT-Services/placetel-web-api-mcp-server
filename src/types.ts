import { z } from "zod";

/** Output format shared by all data-returning tools. */
export enum ResponseFormat {
  MARKDOWN = "markdown",
  JSON = "json",
}

/**
 * Reusable Zod field for the `response_format` parameter.
 * Spread into a tool's raw-shape inputSchema: `{ ...otherFields, response_format: responseFormatSchema }`.
 */
export const responseFormatSchema = z
  .nativeEnum(ResponseFormat)
  .default(ResponseFormat.MARKDOWN)
  .describe("Output format: 'markdown' (human-readable, default) or 'json' (machine-readable).");
