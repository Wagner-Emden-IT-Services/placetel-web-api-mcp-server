import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { placetelRequest } from "../services/client.js";
import { handleApiError } from "../services/errors.js";
import { formatList, formatOne, toolError } from "../services/format.js";
import { paginationMeta, paginationShape } from "../services/pagination.js";
import { ResponseFormat, responseFormatSchema } from "../types.js";

/** Auto-generated tool module for Placetel (8 tools). */
export function registerSipUsersTools(server: McpServer): void {
  server.registerTool(
    "placetel_list_sip_user_short_codes",
    {
      title: "Short codes",
      description: "Short codes. (GET /sip_users/{id}/short_codes) Read-only.",
      inputSchema: {
    id: z.number().int().describe("Path parameter id."),
    response_format: responseFormatSchema,
      },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (args) => {
      try {
        const a = args as Record<string, unknown>;
        const data = await placetelRequest("GET", "/sip_users/{id}/short_codes", { pathParams: { id: a.id as string | number } });
        return formatOne(data ?? { success: true }, args.response_format as ResponseFormat);
      } catch (error) {
        return toolError(handleApiError(error));
      }
    },
  );

  server.registerTool(
    "placetel_create_sip_user_short_code",
    {
      title: "Create short code",
      description: "Create short code. (POST /sip_users/{id}/short_codes)",
      inputSchema: {
    id: z.number().int().describe("Path parameter id."),
    action: z.enum(["set_out_anonymous", "set_forward", "clear_forward", "login_group", "mailbox", "profile", "set_out_number", "addto_routing"]).describe("Body field action (required)."),
    code: z.string().describe("Body field code (required)."),
    number: z.string().optional().describe("Body field number."),
    group_id: z.number().int().optional().describe("Body field group_id."),
    description: z.string().optional().describe("Body field description."),
    response_format: responseFormatSchema,
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    },
    async (args) => {
      try {
        const a = args as Record<string, unknown>;
        const body: Record<string, unknown> = {};
        if (a.action !== undefined) body["action"] = a.action;
        if (a.code !== undefined) body["code"] = a.code;
        if (a.number !== undefined) body["number"] = a.number;
        if (a.group_id !== undefined) body["group_id"] = a.group_id;
        if (a.description !== undefined) body["description"] = a.description;
        const data = await placetelRequest("POST", "/sip_users/{id}/short_codes", { pathParams: { id: a.id as string | number }, body });
        return formatOne(data ?? { success: true }, args.response_format as ResponseFormat);
      } catch (error) {
        return toolError(handleApiError(error));
      }
    },
  );

  server.registerTool(
    "placetel_delete_sip_user_short_code",
    {
      title: "Delete short code",
      description: "Delete short code. (DELETE /sip_users/{id}/short_codes/{code_id}) Destructive.",
      inputSchema: {
    id: z.number().int().describe("Path parameter id."),
    code_id: z.number().int().describe("Path parameter code_id."),
    response_format: responseFormatSchema,
      },
      annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: true },
    },
    async (args) => {
      try {
        const a = args as Record<string, unknown>;
        const data = await placetelRequest("DELETE", "/sip_users/{id}/short_codes/{code_id}", { pathParams: { id: a.id as string | number, code_id: a.code_id as string | number } });
        return formatOne(data ?? { success: true }, args.response_format as ResponseFormat);
      } catch (error) {
        return toolError(handleApiError(error));
      }
    },
  );

  server.registerTool(
    "placetel_list_sip_users",
    {
      title: "Fetch all sip users",
      description: "Fetch all sip users. (GET /sip_users) Read-only.",
      inputSchema: {
    ...paginationShape,
    filter_did: z.number().int().optional().describe("Query filter[did]."),
    filter_username: z.string().optional().describe("Query filter[username]."),
    filter_name: z.string().optional().describe("Query filter[name]."),
    filter_description: z.string().optional().describe("Query filter[description]."),
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
        query["filter[did]"] = a.filter_did;
        query["filter[username]"] = a.filter_username;
        query["filter[name]"] = a.filter_name;
        query["filter[description]"] = a.filter_description;
        const data = await placetelRequest("GET", "/sip_users", { query });
        const meta = paginationMeta(data as unknown[], a.per_page as number | undefined, a.page as number | undefined);
        return formatList(data as unknown[], meta, args.response_format as ResponseFormat);
      } catch (error) {
        return toolError(handleApiError(error));
      }
    },
  );

  server.registerTool(
    "placetel_create_sip_user",
    {
      title: "Create a sip user",
      description: "Create a sip user. (POST /sip_users)",
      inputSchema: {
    name: z.string().describe("Body field name (required)."),
    type: z.enum(["legacy_standard", "blf", "standard", "fax", "trunk"]).describe("Body field type (required)."),
    description: z.string().optional().describe("Body field description."),
    did: z.number().int().optional().describe("Body field did."),
    callerid: z.string().optional().describe("Body field callerid."),
    webuser_id: z.number().int().optional().describe("Body field webuser_id."),
    contact_speeddialing: z.boolean().optional().describe("Body field contact_speeddialing."),
    automatic_prefix: z.string().optional().describe("Body field automatic_prefix."),
    blocked_prefixes: z.string().optional().describe("Body field blocked_prefixes."),
    busy_on_busy: z.boolean().optional().describe("Body field busy_on_busy."),
    routing_plan_id: z.number().int().optional().describe("Body field routing_plan_id."),
    hotdesk_login: z.string().optional().describe("Body field hotdesk_login."),
    hotdesk_pin: z.string().optional().describe("Body field hotdesk_pin."),
    hotdesk_type: z.enum(["standard", "custom", "global_did"]).optional().describe("Body field hotdesk_type."),
    hotdesk_provisioning_id: z.number().int().optional().describe("Body field hotdesk_provisioning_id."),
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
        if (a.did !== undefined) body["did"] = a.did;
        if (a.callerid !== undefined) body["callerid"] = a.callerid;
        if (a.webuser_id !== undefined) body["webuser_id"] = a.webuser_id;
        if (a.contact_speeddialing !== undefined) body["contact_speeddialing"] = a.contact_speeddialing;
        if (a.automatic_prefix !== undefined) body["automatic_prefix"] = a.automatic_prefix;
        if (a.blocked_prefixes !== undefined) body["blocked_prefixes"] = a.blocked_prefixes;
        if (a.busy_on_busy !== undefined) body["busy_on_busy"] = a.busy_on_busy;
        if (a.routing_plan_id !== undefined) body["routing_plan_id"] = a.routing_plan_id;
        if (a.hotdesk_login !== undefined) body["hotdesk_login"] = a.hotdesk_login;
        if (a.hotdesk_pin !== undefined) body["hotdesk_pin"] = a.hotdesk_pin;
        if (a.hotdesk_type !== undefined) body["hotdesk_type"] = a.hotdesk_type;
        if (a.hotdesk_provisioning_id !== undefined) body["hotdesk_provisioning_id"] = a.hotdesk_provisioning_id;
        const data = await placetelRequest("POST", "/sip_users", { body });
        return formatOne(data ?? { success: true }, args.response_format as ResponseFormat);
      } catch (error) {
        return toolError(handleApiError(error));
      }
    },
  );

  server.registerTool(
    "placetel_get_sip_user",
    {
      title: "Fetch a sip user",
      description: "Fetch a sip user. (GET /sip_users/{id}) Read-only.",
      inputSchema: {
    id: z.number().int().describe("Path parameter id."),
    response_format: responseFormatSchema,
      },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (args) => {
      try {
        const a = args as Record<string, unknown>;
        const data = await placetelRequest("GET", "/sip_users/{id}", { pathParams: { id: a.id as string | number } });
        return formatOne(data ?? { success: true }, args.response_format as ResponseFormat);
      } catch (error) {
        return toolError(handleApiError(error));
      }
    },
  );

  server.registerTool(
    "placetel_update_sip_user",
    {
      title: "Update a sip user",
      description: "Update a sip user. (PUT /sip_users/{id})",
      inputSchema: {
    id: z.number().int().describe("Path parameter id."),
    name: z.string().optional().describe("Body field name."),
    description: z.string().optional().describe("Body field description."),
    did: z.number().int().optional().describe("Body field did."),
    callerid: z.string().optional().describe("Body field callerid."),
    webuser_id: z.number().int().optional().describe("Body field webuser_id."),
    contact_speeddialing: z.boolean().optional().describe("Body field contact_speeddialing."),
    p_asserted_identity: z.string().optional().describe("Body field p_asserted_identity."),
    automatic_prefix: z.string().optional().describe("Body field automatic_prefix."),
    blocked_prefixes: z.string().optional().describe("Body field blocked_prefixes."),
    busy_on_busy: z.boolean().optional().describe("Body field busy_on_busy."),
    routing_plan_id: z.number().int().optional().describe("Body field routing_plan_id."),
    hotdesk_login: z.string().optional().describe("Body field hotdesk_login."),
    hotdesk_pin: z.string().optional().describe("Body field hotdesk_pin."),
    hotdesk_type: z.enum(["standard", "custom", "global_did"]).optional().describe("Body field hotdesk_type."),
    hotdesk_provisioning_id: z.number().int().optional().describe("Body field hotdesk_provisioning_id."),
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
        if (a.did !== undefined) body["did"] = a.did;
        if (a.callerid !== undefined) body["callerid"] = a.callerid;
        if (a.webuser_id !== undefined) body["webuser_id"] = a.webuser_id;
        if (a.contact_speeddialing !== undefined) body["contact_speeddialing"] = a.contact_speeddialing;
        if (a.p_asserted_identity !== undefined) body["p_asserted_identity"] = a.p_asserted_identity;
        if (a.automatic_prefix !== undefined) body["automatic_prefix"] = a.automatic_prefix;
        if (a.blocked_prefixes !== undefined) body["blocked_prefixes"] = a.blocked_prefixes;
        if (a.busy_on_busy !== undefined) body["busy_on_busy"] = a.busy_on_busy;
        if (a.routing_plan_id !== undefined) body["routing_plan_id"] = a.routing_plan_id;
        if (a.hotdesk_login !== undefined) body["hotdesk_login"] = a.hotdesk_login;
        if (a.hotdesk_pin !== undefined) body["hotdesk_pin"] = a.hotdesk_pin;
        if (a.hotdesk_type !== undefined) body["hotdesk_type"] = a.hotdesk_type;
        if (a.hotdesk_provisioning_id !== undefined) body["hotdesk_provisioning_id"] = a.hotdesk_provisioning_id;
        const data = await placetelRequest("PUT", "/sip_users/{id}", { pathParams: { id: a.id as string | number }, body });
        return formatOne(data ?? { success: true }, args.response_format as ResponseFormat);
      } catch (error) {
        return toolError(handleApiError(error));
      }
    },
  );

  server.registerTool(
    "placetel_delete_sip_user",
    {
      title: "Delete a sip user",
      description: "Delete a sip user. (DELETE /sip_users/{id}) Destructive.",
      inputSchema: {
    id: z.number().int().describe("Path parameter id."),
    response_format: responseFormatSchema,
      },
      annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: true },
    },
    async (args) => {
      try {
        const a = args as Record<string, unknown>;
        const data = await placetelRequest("DELETE", "/sip_users/{id}", { pathParams: { id: a.id as string | number } });
        return formatOne(data ?? { success: true }, args.response_format as ResponseFormat);
      } catch (error) {
        return toolError(handleApiError(error));
      }
    },
  );
}
