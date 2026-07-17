import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { placetelRequest } from "../services/client.js";
import { handleApiError } from "../services/errors.js";
import { formatList, formatOne, toolError } from "../services/format.js";
import { paginationMeta, paginationShape } from "../services/pagination.js";
import { ResponseFormat, responseFormatSchema } from "../types.js";

/** Auto-generated tool module for Placetel (4 tools). */
export function registerCallsTools(server: McpServer): void {
  server.registerTool(
    "placetel_list_calls",
    {
      title: "Fetch all incoming calls",
      description: "Fetch all incoming calls. (GET /calls) Read-only.",
      inputSchema: {
    ...paginationShape,
    filter_date: z.string().optional().describe("Query filter[date]."),
    filter_from_number: z.string().optional().describe("Query filter[from_number]."),
    filter_to_number: z.string().optional().describe("Query filter[to_number]."),
    filter_type: z.string().optional().describe("Query filter[type]."),
    order: z.string().optional().describe("Query order."),
    response_format: responseFormatSchema,
      },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (args) => {
      try {
        const a = args as Record<string, unknown>;
        const query: Record<string, unknown> = {};
        query.page = a.page;
        query.per_page = a.per_page;
        query["filter[date]"] = a.filter_date;
        query["filter[from_number]"] = a.filter_from_number;
        query["filter[to_number]"] = a.filter_to_number;
        query["filter[type]"] = a.filter_type;
        query["order"] = a.order;
        const data = await placetelRequest("GET", "/calls", { query });
        const meta = paginationMeta(data as unknown[], a.per_page as number | undefined, a.page as number | undefined);
        return formatList(data as unknown[], meta, args.response_format as ResponseFormat);
      } catch (error) {
        return toolError(handleApiError(error));
      }
    },
  );

  server.registerTool(
    "placetel_initiate_call",
    {
      title: "Initiate a call",
      description: "Initiate a call. (POST /calls)",
      inputSchema: {
    sipuid: z.string().describe("Body field sipuid (required)."),
    target: z.string().describe("Body field target (required)."),
    from_name: z.string().optional().describe("Body field from_name."),
    response_format: responseFormatSchema,
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    },
    async (args) => {
      try {
        const a = args as Record<string, unknown>;
        const body: Record<string, unknown> = {};
        if (a.sipuid !== undefined) body["sipuid"] = a.sipuid;
        if (a.target !== undefined) body["target"] = a.target;
        if (a.from_name !== undefined) body["from_name"] = a.from_name;
        const data = await placetelRequest("POST", "/calls", { body });
        return formatOne(data ?? { success: true }, args.response_format as ResponseFormat);
      } catch (error) {
        return toolError(handleApiError(error));
      }
    },
  );

  server.registerTool(
    "placetel_get_call",
    {
      title: "Retrieve a call",
      description: "Retrieve a call. (GET /calls/{id}) Read-only.",
      inputSchema: {
    id: z.number().int().describe("Path parameter id."),
    response_format: responseFormatSchema,
      },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (args) => {
      try {
        const a = args as Record<string, unknown>;
        const data = await placetelRequest("GET", "/calls/{id}", { pathParams: { id: a.id as string | number } });
        return formatOne(data ?? { success: true }, args.response_format as ResponseFormat);
      } catch (error) {
        return toolError(handleApiError(error));
      }
    },
  );

  server.registerTool(
    "placetel_delete_call",
    {
      title: "Delete a call",
      description: "Delete a call. (DELETE /calls/{id}) Destructive.",
      inputSchema: {
    id: z.number().int().describe("Path parameter id."),
    response_format: responseFormatSchema,
      },
      annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: true },
    },
    async (args) => {
      try {
        const a = args as Record<string, unknown>;
        const data = await placetelRequest("DELETE", "/calls/{id}", { pathParams: { id: a.id as string | number } });
        return formatOne(data ?? { success: true }, args.response_format as ResponseFormat);
      } catch (error) {
        return toolError(handleApiError(error));
      }
    },
  );
}
