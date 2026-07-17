import { CHARACTER_LIMIT } from "../constants.js";
import { ResponseFormat } from "../types.js";

/**
 * Standard MCP tool result shape (text content only; structuredContent intentionally omitted).
 * The index signature keeps it assignable to the SDK's CallToolResult return type.
 */
export interface ToolResult {
  [key: string]: unknown;
  content: Array<{ type: "text"; text: string }>;
  isError?: boolean;
}

/** Wrap a successful text payload as an MCP tool result. */
export function toolText(text: string): ToolResult {
  return { content: [{ type: "text", text: truncate(text) }] };
}

/** Wrap an error message as an MCP tool result flagged isError. */
export function toolError(message: string): ToolResult {
  return { content: [{ type: "text", text: message }], isError: true };
}

function truncate(text: string): string {
  if (text.length <= CHARACTER_LIMIT) return text;
  return (
    text.slice(0, CHARACTER_LIMIT) +
    `\n\n[... truncated at ${CHARACTER_LIMIT} characters. Use pagination (page/per_page) or filters to narrow the result.]`
  );
}

function bullets(obj: unknown): string {
  if (obj === null || typeof obj !== "object") return String(obj);
  const entries = Object.entries(obj as Record<string, unknown>).filter(
    ([, v]) => v !== null && v !== undefined && v !== "",
  );
  if (!entries.length) return "_(empty)_";
  return entries
    .map(([k, v]) => `- **${k}**: ${typeof v === "object" ? JSON.stringify(v) : String(v)}`)
    .join("\n");
}

function itemsToMarkdown(items: unknown[]): string {
  if (!items.length) return "_No results._";
  return items.map((item, i) => `### ${i + 1}\n${bullets(item)}`).join("\n\n");
}

/**
 * Format a list result (bare array from Placetel) plus pagination meta.
 * JSON: `{ ...meta, items }`. Markdown: a count header + bulleted items.
 */
export function formatList(items: unknown[], meta: Record<string, unknown>, format: ResponseFormat): ToolResult {
  const safeItems = Array.isArray(items) ? items : [];
  if (format === ResponseFormat.JSON) {
    return toolText(JSON.stringify({ ...meta, items: safeItems }, null, 2));
  }
  const header = `**${safeItems.length} item(s)**` + (meta.page ? ` (page ${meta.page})` : "") + (meta.has_more ? " — more available, increase `page`." : "");
  return toolText(`${header}\n\n${itemsToMarkdown(safeItems)}`);
}

/** Format a single-object (or scalar) result. */
export function formatOne(data: unknown, format: ResponseFormat): ToolResult {
  if (format === ResponseFormat.JSON) {
    return toolText(JSON.stringify(data, null, 2));
  }
  return toolText(bullets(data));
}
