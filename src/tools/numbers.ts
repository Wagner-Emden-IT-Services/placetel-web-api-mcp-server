import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { placetelRequest } from "../services/client.js";
import { handleApiError } from "../services/errors.js";
import { formatList, formatOne, toolError } from "../services/format.js";
import { paginationMeta, paginationShape } from "../services/pagination.js";
import { ResponseFormat, responseFormatSchema } from "../types.js";

/** Auto-generated tool module for Placetel (8 tools). */
export function registerNumbersTools(server: McpServer): void {
  server.registerTool(
    "placetel_list_number_profiles",
    {
      title: "List profiles for a number",
      description: "List profiles for a number. (GET /numbers/{number_id}/profiles) Read-only.",
      inputSchema: {
    number_id: z.number().int().describe("Path parameter number_id."),
    response_format: responseFormatSchema,
      },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (args) => {
      try {
        const a = args as Record<string, unknown>;
        const data = await placetelRequest("GET", "/numbers/{number_id}/profiles", { pathParams: { number_id: a.number_id as string | number } });
        return formatOne(data ?? { success: true }, args.response_format as ResponseFormat);
      } catch (error) {
        return toolError(handleApiError(error));
      }
    },
  );

  server.registerTool(
    "placetel_create_number_profile",
    {
      title: "Creates a new profile for a number",
      description: "Creates a new profile for a number. (POST /numbers/{number_id}/profiles)",
      inputSchema: {
    number_id: z.number().int().describe("Path parameter number_id."),
    name: z.string().describe("Body field name (required)."),
    response_format: responseFormatSchema,
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    },
    async (args) => {
      try {
        const a = args as Record<string, unknown>;
        const body: Record<string, unknown> = {};
        if (a.name !== undefined) body["name"] = a.name;
        const data = await placetelRequest("POST", "/numbers/{number_id}/profiles", { pathParams: { number_id: a.number_id as string | number }, body });
        return formatOne(data ?? { success: true }, args.response_format as ResponseFormat);
      } catch (error) {
        return toolError(handleApiError(error));
      }
    },
  );

  server.registerTool(
    "placetel_activate_number_profile",
    {
      title: "Activates a profile for a number",
      description: "Activates a profile for a number. (PUT /numbers/{number_id}/profiles)",
      inputSchema: {
    number_id: z.number().int().describe("Path parameter number_id."),
    id: z.number().int().describe("Body field id (required)."),
    response_format: responseFormatSchema,
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (args) => {
      try {
        const a = args as Record<string, unknown>;
        const body: Record<string, unknown> = {};
        if (a.id !== undefined) body["id"] = a.id;
        const data = await placetelRequest("PUT", "/numbers/{number_id}/profiles", { pathParams: { number_id: a.number_id as string | number }, body });
        return formatOne(data ?? { success: true }, args.response_format as ResponseFormat);
      } catch (error) {
        return toolError(handleApiError(error));
      }
    },
  );

  server.registerTool(
    "placetel_delete_number_profile",
    {
      title: "Delete a profile for a number",
      description: "Delete a profile for a number. (DELETE /numbers/{number_id}/profiles/{id}) Destructive.",
      inputSchema: {
    number_id: z.number().int().describe("Path parameter number_id."),
    id: z.number().int().describe("Path parameter id."),
    response_format: responseFormatSchema,
      },
      annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: true },
    },
    async (args) => {
      try {
        const a = args as Record<string, unknown>;
        const data = await placetelRequest("DELETE", "/numbers/{number_id}/profiles/{id}", { pathParams: { number_id: a.number_id as string | number, id: a.id as string | number } });
        return formatOne(data ?? { success: true }, args.response_format as ResponseFormat);
      } catch (error) {
        return toolError(handleApiError(error));
      }
    },
  );

  server.registerTool(
    "placetel_activate_number",
    {
      title: "Activate a number",
      description: "Activate a number. (POST /numbers/{id}/activation)",
      inputSchema: {
    id: z.number().int().describe("Path parameter id."),
    response_format: responseFormatSchema,
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    },
    async (args) => {
      try {
        const a = args as Record<string, unknown>;
        const data = await placetelRequest("POST", "/numbers/{id}/activation", { pathParams: { id: a.id as string | number } });
        return formatOne(data ?? { success: true }, args.response_format as ResponseFormat);
      } catch (error) {
        return toolError(handleApiError(error));
      }
    },
  );

  server.registerTool(
    "placetel_deactivate_number",
    {
      title: "Deactivate a number",
      description: "Deactivate a number. (DELETE /numbers/{id}/activation) Destructive.",
      inputSchema: {
    id: z.number().int().describe("Path parameter id."),
    response_format: responseFormatSchema,
      },
      annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: true },
    },
    async (args) => {
      try {
        const a = args as Record<string, unknown>;
        const data = await placetelRequest("DELETE", "/numbers/{id}/activation", { pathParams: { id: a.id as string | number } });
        return formatOne(data ?? { success: true }, args.response_format as ResponseFormat);
      } catch (error) {
        return toolError(handleApiError(error));
      }
    },
  );

  server.registerTool(
    "placetel_list_numbers",
    {
      title: "Get all numbers",
      description: "Get all numbers. (GET /numbers) Read-only.",
      inputSchema: {
    ...paginationShape,
    filter_prefix: z.string().optional().describe("Query filter[prefix]."),
    filter_number: z.string().optional().describe("Query filter[number]."),
    filter_activated: z.boolean().optional().describe("Query filter[activated]."),
    filter_name: z.string().optional().describe("Query filter[name]."),
    filter_description: z.string().optional().describe("Query filter[description]."),
    filter_site_id: z.number().int().optional().describe("Query filter[site_id]."),
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
        query["filter[prefix]"] = a.filter_prefix;
        query["filter[number]"] = a.filter_number;
        query["filter[activated]"] = a.filter_activated;
        query["filter[name]"] = a.filter_name;
        query["filter[description]"] = a.filter_description;
        query["filter[site_id]"] = a.filter_site_id;
        const data = await placetelRequest("GET", "/numbers", { query });
        const meta = paginationMeta(data as unknown[], a.per_page as number | undefined, a.page as number | undefined);
        return formatList(data as unknown[], meta, args.response_format as ResponseFormat);
      } catch (error) {
        return toolError(handleApiError(error));
      }
    },
  );

  server.registerTool(
    "placetel_get_number",
    {
      title: "Retrieve a number",
      description: "Retrieve a number. (GET /numbers/{id}) Read-only.",
      inputSchema: {
    id: z.number().int().describe("Path parameter id."),
    response_format: responseFormatSchema,
      },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (args) => {
      try {
        const a = args as Record<string, unknown>;
        const data = await placetelRequest("GET", "/numbers/{id}", { pathParams: { id: a.id as string | number } });
        return formatOne(data ?? { success: true }, args.response_format as ResponseFormat);
      } catch (error) {
        return toolError(handleApiError(error));
      }
    },
  );
}
