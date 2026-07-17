import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { placetelRequest } from "../services/client.js";
import { handleApiError } from "../services/errors.js";
import { formatList, formatOne, toolError } from "../services/format.js";
import { paginationMeta, paginationShape } from "../services/pagination.js";
import { ResponseFormat, responseFormatSchema } from "../types.js";

/** Auto-generated tool module for Placetel (14 tools). */
export function registerWebexTools(server: McpServer): void {
  server.registerTool(
    "placetel_list_webex_users",
    {
      title: "Fetch all Webex users",
      description: "Fetch all Webex users. (GET /webex/users) Read-only.",
      inputSchema: {
    ...paginationShape,
    filter_first_name: z.string().optional().describe("Query filter[first_name]."),
    filter_last_name: z.string().optional().describe("Query filter[last_name]."),
    filter_login: z.string().optional().describe("Query filter[login]."),
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
        query["filter[first_name]"] = a.filter_first_name;
        query["filter[last_name]"] = a.filter_last_name;
        query["filter[login]"] = a.filter_login;
        const data = await placetelRequest("GET", "/webex/users", { query });
        const meta = paginationMeta(data as unknown[], a.per_page as number | undefined, a.page as number | undefined);
        return formatList(data as unknown[], meta, args.response_format as ResponseFormat);
      } catch (error) {
        return toolError(handleApiError(error));
      }
    },
  );

  server.registerTool(
    "placetel_create_webex_user",
    {
      title: "Create a Webex user",
      description: "Create a Webex user. (POST /webex/users)",
      inputSchema: {
    first_name: z.string().describe("Body field first_name (required)."),
    last_name: z.string().describe("Body field last_name (required)."),
    email: z.string().describe("Body field email (required)."),
    package: z.enum(["voice", "meetings", "calling", "suite", "cx_essentials"]).optional().describe("Body field package."),
    location_id: z.string().optional().describe("Body field location_id."),
    phone_number: z.string().optional().describe("Body field phone_number."),
    extension: z.string().optional().describe("Body field extension."),
    response_format: responseFormatSchema,
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    },
    async (args) => {
      try {
        const a = args as Record<string, unknown>;
        const body: Record<string, unknown> = {};
        if (a.first_name !== undefined) body["first_name"] = a.first_name;
        if (a.last_name !== undefined) body["last_name"] = a.last_name;
        if (a.email !== undefined) body["email"] = a.email;
        if (a.package !== undefined) body["package"] = a.package;
        if (a.location_id !== undefined) body["location_id"] = a.location_id;
        if (a.phone_number !== undefined) body["phone_number"] = a.phone_number;
        if (a.extension !== undefined) body["extension"] = a.extension;
        const data = await placetelRequest("POST", "/webex/users", { body });
        return formatOne(data ?? { success: true }, args.response_format as ResponseFormat);
      } catch (error) {
        return toolError(handleApiError(error));
      }
    },
  );

  server.registerTool(
    "placetel_get_webex_user_license",
    {
      title: "Fetch Webex license for user",
      description: "Fetch Webex license for user. (GET /webex/users/{id}/license) Read-only.",
      inputSchema: {
    id: z.number().int().describe("Path parameter id."),
    response_format: responseFormatSchema,
      },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (args) => {
      try {
        const a = args as Record<string, unknown>;
        const data = await placetelRequest("GET", "/webex/users/{id}/license", { pathParams: { id: a.id as string | number } });
        return formatOne(data ?? { success: true }, args.response_format as ResponseFormat);
      } catch (error) {
        return toolError(handleApiError(error));
      }
    },
  );

  server.registerTool(
    "placetel_assign_webex_user_license",
    {
      title: "Assign Webex license to user",
      description: "Assign Webex license to user. (POST /webex/users/{id}/license)",
      inputSchema: {
    id: z.number().int().describe("Path parameter id."),
    package: z.enum(["voice", "meetings", "calling", "suite", "cx_essentials"]).describe("Body field package (required)."),
    location_id: z.string().optional().describe("Body field location_id."),
    phone_number: z.string().optional().describe("Body field phone_number."),
    extension: z.string().optional().describe("Body field extension."),
    response_format: responseFormatSchema,
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    },
    async (args) => {
      try {
        const a = args as Record<string, unknown>;
        const body: Record<string, unknown> = {};
        if (a.package !== undefined) body["package"] = a.package;
        if (a.location_id !== undefined) body["location_id"] = a.location_id;
        if (a.phone_number !== undefined) body["phone_number"] = a.phone_number;
        if (a.extension !== undefined) body["extension"] = a.extension;
        const data = await placetelRequest("POST", "/webex/users/{id}/license", { pathParams: { id: a.id as string | number }, body });
        return formatOne(data ?? { success: true }, args.response_format as ResponseFormat);
      } catch (error) {
        return toolError(handleApiError(error));
      }
    },
  );

  server.registerTool(
    "placetel_update_webex_user_license",
    {
      title: "Update Webex license for user",
      description: "Update Webex license for user. (PATCH /webex/users/{id}/license)",
      inputSchema: {
    id: z.number().int().describe("Path parameter id."),
    package: z.enum(["voice", "meetings", "calling", "suite", "cx_essentials"]).describe("Body field package (required)."),
    response_format: responseFormatSchema,
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    },
    async (args) => {
      try {
        const a = args as Record<string, unknown>;
        const body: Record<string, unknown> = {};
        if (a.package !== undefined) body["package"] = a.package;
        const data = await placetelRequest("PATCH", "/webex/users/{id}/license", { pathParams: { id: a.id as string | number }, body });
        return formatOne(data ?? { success: true }, args.response_format as ResponseFormat);
      } catch (error) {
        return toolError(handleApiError(error));
      }
    },
  );

  server.registerTool(
    "placetel_get_webex_user_numbers",
    {
      title: "Fetch numbers for user",
      description: "Fetch numbers for user. (GET /webex/users/{id}/numbers) Read-only.",
      inputSchema: {
    id: z.number().int().describe("Path parameter id."),
    ...paginationShape,
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
        const data = await placetelRequest("GET", "/webex/users/{id}/numbers", { pathParams: { id: a.id as string | number }, query });
        const meta = paginationMeta(data as unknown[], a.per_page as number | undefined, a.page as number | undefined);
        return formatList(data as unknown[], meta, args.response_format as ResponseFormat);
      } catch (error) {
        return toolError(handleApiError(error));
      }
    },
  );

  server.registerTool(
    "placetel_update_webex_user_numbers",
    {
      title: "Update numbers for user",
      description: "Update numbers for user. (PATCH /webex/users/{id}/numbers)",
      inputSchema: {
    id: z.number().int().describe("Path parameter id."),
    numbers: z.array(z.string()).optional().describe("Body field numbers."),
    response_format: responseFormatSchema,
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    },
    async (args) => {
      try {
        const a = args as Record<string, unknown>;
        const body: Record<string, unknown> = {};
        if (a.numbers !== undefined) body["numbers"] = a.numbers;
        const data = await placetelRequest("PATCH", "/webex/users/{id}/numbers", { pathParams: { id: a.id as string | number }, body });
        return formatOne(data ?? { success: true }, args.response_format as ResponseFormat);
      } catch (error) {
        return toolError(handleApiError(error));
      }
    },
  );

  server.registerTool(
    "placetel_delete_webex_user",
    {
      title: "Delete a Webex user",
      description: "Delete a Webex user. (DELETE /webex/users/{id}) Destructive.",
      inputSchema: {
    id: z.number().int().describe("Path parameter id."),
    response_format: responseFormatSchema,
      },
      annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: true },
    },
    async (args) => {
      try {
        const a = args as Record<string, unknown>;
        const data = await placetelRequest("DELETE", "/webex/users/{id}", { pathParams: { id: a.id as string | number } });
        return formatOne(data ?? { success: true }, args.response_format as ResponseFormat);
      } catch (error) {
        return toolError(handleApiError(error));
      }
    },
  );

  server.registerTool(
    "placetel_list_webex_workspaces",
    {
      title: "List all Webex workspaces",
      description: "List all Webex workspaces. (GET /webex/workspaces) Read-only.",
      inputSchema: {
    display_name: z.string().optional().describe("Query display_name."),
    response_format: responseFormatSchema,
      },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (args) => {
      try {
        const a = args as Record<string, unknown>;
        const query: Record<string, unknown> = {};
        query["display_name"] = a.display_name;
        const data = await placetelRequest("GET", "/webex/workspaces", { query });
        const meta = paginationMeta(data as unknown[], a.per_page as number | undefined, a.page as number | undefined);
        return formatList(data as unknown[], meta, args.response_format as ResponseFormat);
      } catch (error) {
        return toolError(handleApiError(error));
      }
    },
  );

  server.registerTool(
    "placetel_create_webex_workspace",
    {
      title: "Create a Webex workspace",
      description: "Create a Webex workspace. (POST /webex/workspaces)",
      inputSchema: {
    display_name: z.string().describe("Body field display_name (required)."),
    supported_devices: z.enum(["phones", "collaborationDevices"]).describe("Body field supported_devices (required)."),
    calling: z.enum(["webexCalling", "none", "freeCalling"]).describe("Body field calling (required)."),
    location_id: z.string().describe("Body field location_id (required)."),
    phone_number: z.string().optional().describe("Body field phone_number."),
    extension: z.string().optional().describe("Body field extension."),
    response_format: responseFormatSchema,
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    },
    async (args) => {
      try {
        const a = args as Record<string, unknown>;
        const body: Record<string, unknown> = {};
        if (a.display_name !== undefined) body["display_name"] = a.display_name;
        if (a.supported_devices !== undefined) body["supported_devices"] = a.supported_devices;
        if (a.calling !== undefined) body["calling"] = a.calling;
        if (a.location_id !== undefined) body["location_id"] = a.location_id;
        if (a.phone_number !== undefined) body["phone_number"] = a.phone_number;
        if (a.extension !== undefined) body["extension"] = a.extension;
        const data = await placetelRequest("POST", "/webex/workspaces", { body });
        return formatOne(data ?? { success: true }, args.response_format as ResponseFormat);
      } catch (error) {
        return toolError(handleApiError(error));
      }
    },
  );

  server.registerTool(
    "placetel_get_webex_workspace",
    {
      title: "Fetch a single Webex workspace",
      description: "Fetch a single Webex workspace. (GET /webex/workspaces/{id}) Read-only.",
      inputSchema: {
    id: z.number().int().describe("Path parameter id."),
    response_format: responseFormatSchema,
      },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (args) => {
      try {
        const a = args as Record<string, unknown>;
        const data = await placetelRequest("GET", "/webex/workspaces/{id}", { pathParams: { id: a.id as string | number } });
        return formatOne(data ?? { success: true }, args.response_format as ResponseFormat);
      } catch (error) {
        return toolError(handleApiError(error));
      }
    },
  );

  server.registerTool(
    "placetel_get_webex_number_fax_settings",
    {
      title: "Fetch fax settings for a number",
      description: "Fetch fax settings for a number. (GET /webex/numbers/{number_or_id}/fax_settings) Read-only.",
      inputSchema: {
    number_or_id: z.number().int().describe("Path parameter number_or_id."),
    response_format: responseFormatSchema,
      },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (args) => {
      try {
        const a = args as Record<string, unknown>;
        const data = await placetelRequest("GET", "/webex/numbers/{number_or_id}/fax_settings", { pathParams: { number_or_id: a.number_or_id as string | number } });
        return formatOne(data ?? { success: true }, args.response_format as ResponseFormat);
      } catch (error) {
        return toolError(handleApiError(error));
      }
    },
  );

  server.registerTool(
    "placetel_configure_webex_number_fax_settings",
    {
      title: "Configure a number as a fax number",
      description: "Configure a number as a fax number. (PUT /webex/numbers/{number_or_id}/fax_settings)",
      inputSchema: {
    number_or_id: z.number().int().describe("Path parameter number_or_id."),
    faxpin: z.string().describe("Body field faxpin (required)."),
    faxheader: z.string().describe("Body field faxheader (required)."),
    faxwhitelist: z.string().optional().describe("Body field faxwhitelist."),
    email: z.string().optional().describe("Body field email."),
    faxsettings: z.number().int().optional().describe("Body field faxsettings."),
    fax_attachment: z.boolean().optional().describe("Body field fax_attachment."),
    webex_room_ids: z.array(z.number().int()).optional().describe("Body field webex_room_ids."),
    response_format: responseFormatSchema,
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (args) => {
      try {
        const a = args as Record<string, unknown>;
        const body: Record<string, unknown> = {};
        if (a.faxpin !== undefined) body["faxpin"] = a.faxpin;
        if (a.faxheader !== undefined) body["faxheader"] = a.faxheader;
        if (a.faxwhitelist !== undefined) body["faxwhitelist"] = a.faxwhitelist;
        if (a.email !== undefined) body["email"] = a.email;
        if (a.faxsettings !== undefined) body["faxsettings"] = a.faxsettings;
        if (a.fax_attachment !== undefined) body["fax_attachment"] = a.fax_attachment;
        if (a.webex_room_ids !== undefined) body["webex_room_ids"] = a.webex_room_ids;
        const data = await placetelRequest("PUT", "/webex/numbers/{number_or_id}/fax_settings", { pathParams: { number_or_id: a.number_or_id as string | number }, body });
        return formatOne(data ?? { success: true }, args.response_format as ResponseFormat);
      } catch (error) {
        return toolError(handleApiError(error));
      }
    },
  );

  server.registerTool(
    "placetel_remove_webex_number_fax_settings",
    {
      title: "Remove the fax configuration from a number",
      description: "Remove the fax configuration from a number. (DELETE /webex/numbers/{number_or_id}/fax_settings) Destructive.",
      inputSchema: {
    number_or_id: z.number().int().describe("Path parameter number_or_id."),
    response_format: responseFormatSchema,
      },
      annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: true },
    },
    async (args) => {
      try {
        const a = args as Record<string, unknown>;
        const data = await placetelRequest("DELETE", "/webex/numbers/{number_or_id}/fax_settings", { pathParams: { number_or_id: a.number_or_id as string | number } });
        return formatOne(data ?? { success: true }, args.response_format as ResponseFormat);
      } catch (error) {
        return toolError(handleApiError(error));
      }
    },
  );
}
