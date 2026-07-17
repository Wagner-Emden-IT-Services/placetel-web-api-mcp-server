import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { placetelRequest } from "../services/client.js";
import { handleApiError } from "../services/errors.js";
import { formatList, formatOne, toolError } from "../services/format.js";
import { paginationMeta, paginationShape } from "../services/pagination.js";
import { ResponseFormat, responseFormatSchema } from "../types.js";

/** Auto-generated tool module for Placetel (5 tools). */
export function registerGroupsTools(server: McpServer): void {
  server.registerTool(
    "placetel_list_groups",
    {
      title: "Fetch all groups",
      description: "Fetch all groups. (GET /groups) Read-only.",
      inputSchema: {
    ...paginationShape,
    filter_name: z.string().optional().describe("Query filter[name]."),
    filter_description: z.string().optional().describe("Query filter[description]."),
    filter_type: z.string().optional().describe("Query filter[type]."),
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
        query["filter[name]"] = a.filter_name;
        query["filter[description]"] = a.filter_description;
        query["filter[type]"] = a.filter_type;
        const data = await placetelRequest("GET", "/groups", { query });
        const meta = paginationMeta(data as unknown[], a.per_page as number | undefined, a.page as number | undefined);
        return formatList(data as unknown[], meta, args.response_format as ResponseFormat);
      } catch (error) {
        return toolError(handleApiError(error));
      }
    },
  );

  server.registerTool(
    "placetel_create_group",
    {
      title: "Create a group",
      description: "Create a group. (POST /groups)",
      inputSchema: {
    name: z.string().describe("Body field name (required)."),
    type: z.enum(["ring_all", "monitoring", "hunt"]).describe("Body field type (required)."),
    description: z.string().optional().describe("Body field description."),
    member_ids: z.array(z.number().int()).optional().describe("Body field member_ids."),
    response_format: responseFormatSchema,
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    },
    async (args) => {
      try {
        const a = args as Record<string, unknown>;
        const body: Record<string, unknown> = {};
        if (a.name !== undefined) body["name"] = a.name;
        if (a.type !== undefined) body["type"] = a.type;
        if (a.description !== undefined) body["description"] = a.description;
        if (a.member_ids !== undefined) body["member_ids"] = a.member_ids;
        const data = await placetelRequest("POST", "/groups", { body });
        return formatOne(data ?? { success: true }, args.response_format as ResponseFormat);
      } catch (error) {
        return toolError(handleApiError(error));
      }
    },
  );

  server.registerTool(
    "placetel_get_group",
    {
      title: "Fetch a group",
      description: "Fetch a group. (GET /groups/{id}) Read-only.",
      inputSchema: {
    id: z.number().int().describe("Path parameter id."),
    response_format: responseFormatSchema,
      },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (args) => {
      try {
        const a = args as Record<string, unknown>;
        const data = await placetelRequest("GET", "/groups/{id}", { pathParams: { id: a.id as string | number } });
        return formatOne(data ?? { success: true }, args.response_format as ResponseFormat);
      } catch (error) {
        return toolError(handleApiError(error));
      }
    },
  );

  server.registerTool(
    "placetel_update_group",
    {
      title: "Update a group",
      description: "Update a group. (PUT /groups/{id})",
      inputSchema: {
    id: z.number().int().describe("Path parameter id."),
    name: z.string().optional().describe("Body field name."),
    description: z.string().optional().describe("Body field description."),
    member_ids: z.array(z.number().int()).optional().describe("Body field member_ids."),
    response_format: responseFormatSchema,
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (args) => {
      try {
        const a = args as Record<string, unknown>;
        const body: Record<string, unknown> = {};
        if (a.name !== undefined) body["name"] = a.name;
        if (a.description !== undefined) body["description"] = a.description;
        if (a.member_ids !== undefined) body["member_ids"] = a.member_ids;
        const data = await placetelRequest("PUT", "/groups/{id}", { pathParams: { id: a.id as string | number }, body });
        return formatOne(data ?? { success: true }, args.response_format as ResponseFormat);
      } catch (error) {
        return toolError(handleApiError(error));
      }
    },
  );

  server.registerTool(
    "placetel_delete_group",
    {
      title: "Delete a group",
      description: "Delete a group. (DELETE /groups/{id}) Destructive.",
      inputSchema: {
    id: z.number().int().describe("Path parameter id."),
    response_format: responseFormatSchema,
      },
      annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: true },
    },
    async (args) => {
      try {
        const a = args as Record<string, unknown>;
        const data = await placetelRequest("DELETE", "/groups/{id}", { pathParams: { id: a.id as string | number } });
        return formatOne(data ?? { success: true }, args.response_format as ResponseFormat);
      } catch (error) {
        return toolError(handleApiError(error));
      }
    },
  );
}
