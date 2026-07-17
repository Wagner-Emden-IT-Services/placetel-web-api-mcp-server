import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { placetelRequest } from "../services/client.js";
import { handleApiError } from "../services/errors.js";
import { formatList, formatOne, toolError } from "../services/format.js";
import { paginationMeta, paginationShape } from "../services/pagination.js";
import { ResponseFormat, responseFormatSchema } from "../types.js";

/** Auto-generated tool module for Placetel (8 tools). */
export function registerUsersTools(server: McpServer): void {
  server.registerTool(
    "placetel_list_users",
    {
      title: "Fetch all users",
      description: "Fetch all users. (GET /users) Read-only.",
      inputSchema: {
    ...paginationShape,
    filter_first_name: z.string().optional().describe("Query filter[first_name]."),
    filter_last_name: z.string().optional().describe("Query filter[last_name]."),
    filter_email: z.string().optional().describe("Query filter[email]."),
    filter_login: z.string().optional().describe("Query filter[login]."),
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
        query["filter[first_name]"] = a.filter_first_name;
        query["filter[last_name]"] = a.filter_last_name;
        query["filter[email]"] = a.filter_email;
        query["filter[login]"] = a.filter_login;
        query["filter[type]"] = a.filter_type;
        const data = await placetelRequest("GET", "/users", { query });
        const meta = paginationMeta(data as unknown[], a.per_page as number | undefined, a.page as number | undefined);
        return formatList(data as unknown[], meta, args.response_format as ResponseFormat);
      } catch (error) {
        return toolError(handleApiError(error));
      }
    },
  );

  server.registerTool(
    "placetel_create_user",
    {
      title: "Create new subuser",
      description: "Create new subuser. (POST /users)",
      inputSchema: {
    first_name: z.string().describe("Body field first_name (required)."),
    last_name: z.string().describe("Body field last_name (required)."),
    email: z.string().optional().describe("Body field email."),
    did: z.number().int().optional().describe("Body field did."),
    assign_did: z.boolean().optional().describe("Body field assign_did."),
    callerid: z.string().optional().describe("Body field callerid."),
    phone_model: z.string().optional().describe("Body field phone_model."),
    phone_mac: z.string().optional().describe("Body field phone_mac."),
    sip_user_type: z.enum(["standard", "blf"]).optional().describe("Body field sip_user_type."),
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
        if (a.did !== undefined) body["did"] = a.did;
        if (a.assign_did !== undefined) body["assign_did"] = a.assign_did;
        if (a.callerid !== undefined) body["callerid"] = a.callerid;
        if (a.phone_model !== undefined) body["phone_model"] = a.phone_model;
        if (a.phone_mac !== undefined) body["phone_mac"] = a.phone_mac;
        if (a.sip_user_type !== undefined) body["sip_user_type"] = a.sip_user_type;
        const data = await placetelRequest("POST", "/users", { body });
        return formatOne(data ?? { success: true }, args.response_format as ResponseFormat);
      } catch (error) {
        return toolError(handleApiError(error));
      }
    },
  );

  server.registerTool(
    "placetel_get_user",
    {
      title: "Fetch user by ID",
      description: "Fetch user by ID. (GET /users/{id}) Read-only.",
      inputSchema: {
    id: z.number().int().describe("Path parameter id."),
    response_format: responseFormatSchema,
      },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (args) => {
      try {
        const a = args as Record<string, unknown>;
        const data = await placetelRequest("GET", "/users/{id}", { pathParams: { id: a.id as string | number } });
        return formatOne(data ?? { success: true }, args.response_format as ResponseFormat);
      } catch (error) {
        return toolError(handleApiError(error));
      }
    },
  );

  server.registerTool(
    "placetel_update_user",
    {
      title: "Update a subuser",
      description: "Update a subuser. (PUT /users/{id})",
      inputSchema: {
    id: z.number().int().describe("Path parameter id."),
    first_name: z.string().optional().describe("Body field first_name."),
    last_name: z.string().optional().describe("Body field last_name."),
    email: z.string().optional().describe("Body field email."),
    did: z.number().int().optional().describe("Body field did."),
    callerid: z.string().optional().describe("Body field callerid."),
    primary_sip_user_id: z.number().int().optional().describe("Body field primary_sip_user_id."),
    admin_user: z.boolean().optional().describe("Body field admin_user."),
    rights_numbers: z.array(z.string()).optional().describe("Body field rights_numbers."),
    locale: z.string().optional().describe("Body field locale."),
    obfuscate_billing_records: z.boolean().optional().describe("Body field obfuscate_billing_records."),
    obfuscate_others: z.boolean().optional().describe("Body field obfuscate_others."),
    permissions: z.record(z.unknown()).optional().describe("Body field permissions."),
    avatar: z.string().optional().describe("Body field avatar."),
    response_format: responseFormatSchema,
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (args) => {
      try {
        const a = args as Record<string, unknown>;
        const body: Record<string, unknown> = {};
        if (a.first_name !== undefined) body["first_name"] = a.first_name;
        if (a.last_name !== undefined) body["last_name"] = a.last_name;
        if (a.email !== undefined) body["email"] = a.email;
        if (a.did !== undefined) body["did"] = a.did;
        if (a.callerid !== undefined) body["callerid"] = a.callerid;
        if (a.primary_sip_user_id !== undefined) body["primary_sip_user_id"] = a.primary_sip_user_id;
        if (a.admin_user !== undefined) body["admin_user"] = a.admin_user;
        if (a.rights_numbers !== undefined) body["rights_numbers"] = a.rights_numbers;
        if (a.locale !== undefined) body["locale"] = a.locale;
        if (a.obfuscate_billing_records !== undefined) body["obfuscate_billing_records"] = a.obfuscate_billing_records;
        if (a.obfuscate_others !== undefined) body["obfuscate_others"] = a.obfuscate_others;
        if (a.permissions !== undefined) body["permissions"] = a.permissions;
        if (a.avatar !== undefined) body["avatar"] = a.avatar;
        const data = await placetelRequest("PUT", "/users/{id}", { pathParams: { id: a.id as string | number }, body });
        return formatOne(data ?? { success: true }, args.response_format as ResponseFormat);
      } catch (error) {
        return toolError(handleApiError(error));
      }
    },
  );

  server.registerTool(
    "placetel_delete_user",
    {
      title: "Delete a subuser",
      description: "Delete a subuser. (DELETE /users/{id}) Destructive.",
      inputSchema: {
    id: z.number().int().describe("Path parameter id."),
    response_format: responseFormatSchema,
      },
      annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: true },
    },
    async (args) => {
      try {
        const a = args as Record<string, unknown>;
        const data = await placetelRequest("DELETE", "/users/{id}", { pathParams: { id: a.id as string | number } });
        return formatOne(data ?? { success: true }, args.response_format as ResponseFormat);
      } catch (error) {
        return toolError(handleApiError(error));
      }
    },
  );

  server.registerTool(
    "placetel_reset_user_password",
    {
      title: "Reset password for account",
      description: "Reset password for account. (POST /users/{id}/password_reset)",
      inputSchema: {
    id: z.number().int().describe("Path parameter id."),
    response_format: responseFormatSchema,
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    },
    async (args) => {
      try {
        const a = args as Record<string, unknown>;
        const data = await placetelRequest("POST", "/users/{id}/password_reset", { pathParams: { id: a.id as string | number } });
        return formatOne(data ?? { success: true }, args.response_format as ResponseFormat);
      } catch (error) {
        return toolError(handleApiError(error));
      }
    },
  );

  server.registerTool(
    "placetel_reset_user_two_factor_authentication",
    {
      title: "Reset two factor authentication for user",
      description: "Reset two factor authentication for user. (DELETE /users/{id}/two_factor_authentication) Destructive.",
      inputSchema: {
    id: z.number().int().describe("Path parameter id."),
    response_format: responseFormatSchema,
      },
      annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: true },
    },
    async (args) => {
      try {
        const a = args as Record<string, unknown>;
        const data = await placetelRequest("DELETE", "/users/{id}/two_factor_authentication", { pathParams: { id: a.id as string | number } });
        return formatOne(data ?? { success: true }, args.response_format as ResponseFormat);
      } catch (error) {
        return toolError(handleApiError(error));
      }
    },
  );

  server.registerTool(
    "placetel_get_me",
    {
      title: "Me",
      description: "Me. (GET /me) Read-only.",
      inputSchema: {
    response_format: responseFormatSchema,
      },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (args) => {
      try {
        const a = args as Record<string, unknown>;
        const data = await placetelRequest("GET", "/me", {  });
        return formatOne(data ?? { success: true }, args.response_format as ResponseFormat);
      } catch (error) {
        return toolError(handleApiError(error));
      }
    },
  );
}
