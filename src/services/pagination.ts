import { z } from "zod";

/**
 * Reusable raw-shape fragment for paginated list tools.
 * Spread into a tool inputSchema: `{ ...paginationShape, response_format: responseFormatSchema }`.
 * Note: not every Placetel endpoint honors per_page.
 */
export const paginationShape = {
  page: z.number().int().min(1).optional().describe("Page number, starting at 1."),
  per_page: z
    .number()
    .int()
    .min(1)
    .max(100)
    .optional()
    .describe("Items per page (max 100). Not honored by every endpoint."),
};

/**
 * Placetel list endpoints return a bare JSON array with no total/next metadata.
 * We derive `has_more` heuristically: if the returned count equals the requested
 * per_page, there is probably another page.
 */
export function paginationMeta(items: unknown[], perPage?: number, page?: number): {
  count: number;
  page: number;
  per_page?: number;
  has_more: boolean;
  next_page?: number;
} {
  const count = Array.isArray(items) ? items.length : 0;
  const currentPage = page ?? 1;
  const hasMore = perPage != null ? count === perPage : false;
  return {
    count,
    page: currentPage,
    ...(perPage != null ? { per_page: perPage } : {}),
    has_more: hasMore,
    ...(hasMore ? { next_page: currentPage + 1 } : {}),
  };
}
