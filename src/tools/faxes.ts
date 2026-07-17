import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { placetelRequest } from "../services/client.js";
import { handleApiError } from "../services/errors.js";
import { formatList, formatOne, toolError } from "../services/format.js";
import { paginationMeta, paginationShape } from "../services/pagination.js";
import { ResponseFormat, responseFormatSchema } from "../types.js";

/** Auto-generated tool module for Placetel (4 tools). */
export function registerFaxesTools(server: McpServer): void {
  server.registerTool(
    "placetel_list_faxes",
    {
      title: "Fetch in- and outbound faxes",
      description: "Fetch in- and outbound faxes. (GET /faxes) Read-only.",
      inputSchema: {
    ...paginationShape,
    filter_type: z.string().optional().describe("Query filter[type]."),
    filter_from_number: z.string().optional().describe("Query filter[from_number]."),
    filter_to_number: z.string().optional().describe("Query filter[to_number]."),
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
        query["filter[type]"] = a.filter_type;
        query["filter[from_number]"] = a.filter_from_number;
        query["filter[to_number]"] = a.filter_to_number;
        query["order"] = a.order;
        const data = await placetelRequest("GET", "/faxes", { query });
        const meta = paginationMeta(data as unknown[], a.per_page as number | undefined, a.page as number | undefined);
        return formatList(data as unknown[], meta, args.response_format as ResponseFormat);
      } catch (error) {
        return toolError(handleApiError(error));
      }
    },
  );

  server.registerTool(
    "placetel_create_fax",
    {
      title: "Create outbound fax",
      description: "Create outbound fax. (POST /faxes)",
      inputSchema: {
    from_number: z.string().describe("Body field from_number (required)."),
    to_number: z.string().describe("Body field to_number (required)."),
    email: z.string().describe("Body field email (required)."),
    file: z.string().describe("Body field file (required)."),
    header: z.string().optional().describe("Body field header."),
    response_format: responseFormatSchema,
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    },
    async (args) => {
      try {
        const a = args as Record<string, unknown>;
        const body: Record<string, unknown> = {};
        if (a.from_number !== undefined) body["from_number"] = a.from_number;
        if (a.to_number !== undefined) body["to_number"] = a.to_number;
        if (a.email !== undefined) body["email"] = a.email;
        if (a.file !== undefined) body["file"] = a.file;
        if (a.header !== undefined) body["header"] = a.header;
        const data = await placetelRequest("POST", "/faxes", { body });
        return formatOne(data ?? { success: true }, args.response_format as ResponseFormat);
      } catch (error) {
        return toolError(handleApiError(error));
      }
    },
  );

  server.registerTool(
    "placetel_get_fax",
    {
      title: "Fetch specific fax",
      description: "Fetch specific fax. (GET /faxes/{id}) Read-only.",
      inputSchema: {
    id: z.number().int().describe("Path parameter id."),
    response_format: responseFormatSchema,
      },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (args) => {
      try {
        const a = args as Record<string, unknown>;
        const data = await placetelRequest("GET", "/faxes/{id}", { pathParams: { id: a.id as string | number } });
        return formatOne(data ?? { success: true }, args.response_format as ResponseFormat);
      } catch (error) {
        return toolError(handleApiError(error));
      }
    },
  );

  server.registerTool(
    "placetel_delete_fax",
    {
      title: "Delete a fax",
      description: "Delete a fax. (DELETE /faxes/{id}) Destructive.",
      inputSchema: {
    id: z.number().int().describe("Path parameter id."),
    response_format: responseFormatSchema,
      },
      annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: true },
    },
    async (args) => {
      try {
        const a = args as Record<string, unknown>;
        const data = await placetelRequest("DELETE", "/faxes/{id}", { pathParams: { id: a.id as string | number } });
        return formatOne(data ?? { success: true }, args.response_format as ResponseFormat);
      } catch (error) {
        return toolError(handleApiError(error));
      }
    },
  );
}
