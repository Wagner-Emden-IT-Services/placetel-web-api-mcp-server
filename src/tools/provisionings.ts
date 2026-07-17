import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { placetelRequest } from "../services/client.js";
import { handleApiError } from "../services/errors.js";
import { formatList, formatOne, toolError } from "../services/format.js";
import { paginationMeta, paginationShape } from "../services/pagination.js";
import { ResponseFormat, responseFormatSchema } from "../types.js";

/** Auto-generated tool module for Placetel (9 tools). */
export function registerProvisioningsTools(server: McpServer): void {
  server.registerTool(
    "placetel_list_provisionings",
    {
      title: "Get all phone provisionings",
      description: "Get all phone provisionings. (GET /provisionings) Read-only.",
      inputSchema: {
    ...paginationShape,
    search: z.string().optional().describe("Query search."),
    webuser_id: z.number().int().optional().describe("Query webuser_id."),
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
        query["search"] = a.search;
        query["webuser_id"] = a.webuser_id;
        const data = await placetelRequest("GET", "/provisionings", { query });
        const meta = paginationMeta(data as unknown[], a.per_page as number | undefined, a.page as number | undefined);
        return formatList(data as unknown[], meta, args.response_format as ResponseFormat);
      } catch (error) {
        return toolError(handleApiError(error));
      }
    },
  );

  server.registerTool(
    "placetel_create_provisioning",
    {
      title: "Creates a phone provisionings",
      description: "Creates a phone provisionings. (POST /provisionings)",
      inputSchema: {
    name: z.string().describe("Body field name (required)."),
    mac: z.string().describe("Body field mac (required)."),
    phone_model: z.number().int().describe("Body field phone_model (required)."),
    webuser_id: z.number().int().optional().describe("Body field webuser_id."),
    codec: z.enum(["G711a", "G729a", "G722", "OPUS"]).optional().describe("Body field codec."),
    call_waiting: z.boolean().optional().describe("Body field call_waiting."),
    encryption: z.enum(["disabled", "enabled", "template"]).optional().describe("Body field encryption."),
    locale: z.enum(["de", "en", "fr", "en-GB"]).optional().describe("Body field locale."),
    lines: z.array(z.string()).optional().describe("Body field lines."),
    keys: z.array(z.string()).optional().describe("Body field keys."),
    response_format: responseFormatSchema,
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    },
    async (args) => {
      try {
        const a = args as Record<string, unknown>;
        const body: Record<string, unknown> = {};
        if (a.name !== undefined) body["name"] = a.name;
        if (a.mac !== undefined) body["mac"] = a.mac;
        if (a.phone_model !== undefined) body["phone_model"] = a.phone_model;
        if (a.webuser_id !== undefined) body["webuser_id"] = a.webuser_id;
        if (a.codec !== undefined) body["codec"] = a.codec;
        if (a.call_waiting !== undefined) body["call_waiting"] = a.call_waiting;
        if (a.encryption !== undefined) body["encryption"] = a.encryption;
        if (a.locale !== undefined) body["locale"] = a.locale;
        if (a.lines !== undefined) body["lines"] = a.lines;
        if (a.keys !== undefined) body["keys"] = a.keys;
        const data = await placetelRequest("POST", "/provisionings", { body });
        return formatOne(data ?? { success: true }, args.response_format as ResponseFormat);
      } catch (error) {
        return toolError(handleApiError(error));
      }
    },
  );

  server.registerTool(
    "placetel_get_provisioning",
    {
      title: "Retrieve a phone provisionings",
      description: "Retrieve a phone provisionings. (GET /provisionings/{id}) Read-only.",
      inputSchema: {
    id: z.number().int().describe("Path parameter id."),
    response_format: responseFormatSchema,
      },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (args) => {
      try {
        const a = args as Record<string, unknown>;
        const data = await placetelRequest("GET", "/provisionings/{id}", { pathParams: { id: a.id as string | number } });
        return formatOne(data ?? { success: true }, args.response_format as ResponseFormat);
      } catch (error) {
        return toolError(handleApiError(error));
      }
    },
  );

  server.registerTool(
    "placetel_update_provisioning",
    {
      title: "Update a phone provisionings",
      description: "Update a phone provisionings. (PUT /provisionings/{id})",
      inputSchema: {
    id: z.number().int().describe("Path parameter id."),
    webuser_id: z.number().int().optional().describe("Body field webuser_id."),
    name: z.string().optional().describe("Body field name."),
    codec: z.enum(["G711a", "G729a", "G722", "OPUS"]).optional().describe("Body field codec."),
    call_waiting: z.boolean().optional().describe("Body field call_waiting."),
    encryption: z.enum(["disabled", "enabled", "template"]).optional().describe("Body field encryption."),
    locale: z.enum(["de", "en", "fr", "en-GB"]).optional().describe("Body field locale."),
    lines: z.array(z.string()).optional().describe("Body field lines."),
    keys: z.array(z.string()).optional().describe("Body field keys."),
    response_format: responseFormatSchema,
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (args) => {
      try {
        const a = args as Record<string, unknown>;
        const body: Record<string, unknown> = {};
        if (a.webuser_id !== undefined) body["webuser_id"] = a.webuser_id;
        if (a.name !== undefined) body["name"] = a.name;
        if (a.codec !== undefined) body["codec"] = a.codec;
        if (a.call_waiting !== undefined) body["call_waiting"] = a.call_waiting;
        if (a.encryption !== undefined) body["encryption"] = a.encryption;
        if (a.locale !== undefined) body["locale"] = a.locale;
        if (a.lines !== undefined) body["lines"] = a.lines;
        if (a.keys !== undefined) body["keys"] = a.keys;
        const data = await placetelRequest("PUT", "/provisionings/{id}", { pathParams: { id: a.id as string | number }, body });
        return formatOne(data ?? { success: true }, args.response_format as ResponseFormat);
      } catch (error) {
        return toolError(handleApiError(error));
      }
    },
  );

  server.registerTool(
    "placetel_delete_provisioning",
    {
      title: "Delete a phone provisionings",
      description: "Delete a phone provisionings. (DELETE /provisionings/{id}) Destructive.",
      inputSchema: {
    id: z.number().int().describe("Path parameter id."),
    response_format: responseFormatSchema,
      },
      annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: true },
    },
    async (args) => {
      try {
        const a = args as Record<string, unknown>;
        const data = await placetelRequest("DELETE", "/provisionings/{id}", { pathParams: { id: a.id as string | number } });
        return formatOne(data ?? { success: true }, args.response_format as ResponseFormat);
      } catch (error) {
        return toolError(handleApiError(error));
      }
    },
  );

  server.registerTool(
    "placetel_get_provisioning_custom_configurations",
    {
      title: "Retrieve a phone provisionings custom configurations",
      description: "Retrieve a phone provisionings custom configurations. (GET /provisionings/{id}/custom_configurations) Read-only.",
      inputSchema: {
    id: z.number().int().describe("Path parameter id."),
    response_format: responseFormatSchema,
      },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (args) => {
      try {
        const a = args as Record<string, unknown>;
        const data = await placetelRequest("GET", "/provisionings/{id}/custom_configurations", { pathParams: { id: a.id as string | number } });
        return formatOne(data ?? { success: true }, args.response_format as ResponseFormat);
      } catch (error) {
        return toolError(handleApiError(error));
      }
    },
  );

  server.registerTool(
    "placetel_upsert_provisioning_custom_configuration",
    {
      title: "Update or create a phone provisionings custom configuration key",
      description: "Update or create a phone provisionings custom configuration key. (PUT /provisionings/{id}/custom_configurations)",
      inputSchema: {
    id: z.number().int().describe("Path parameter id."),
    configurations: z.record(z.unknown()).describe("Body field configurations (required)."),
    response_format: responseFormatSchema,
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (args) => {
      try {
        const a = args as Record<string, unknown>;
        const body: Record<string, unknown> = {};
        if (a.configurations !== undefined) body["configurations"] = a.configurations;
        const data = await placetelRequest("PUT", "/provisionings/{id}/custom_configurations", { pathParams: { id: a.id as string | number }, body });
        return formatOne(data ?? { success: true }, args.response_format as ResponseFormat);
      } catch (error) {
        return toolError(handleApiError(error));
      }
    },
  );

  server.registerTool(
    "placetel_delete_provisioning_custom_configuration",
    {
      title: "Delete a phone provisionings custom configuration key",
      description: "Delete a phone provisionings custom configuration key. (DELETE /provisionings/{id}/custom_configurations/{custom_configuration_id}) Destructive.",
      inputSchema: {
    id: z.number().int().describe("Path parameter id."),
    custom_configuration_id: z.number().int().describe("Path parameter custom_configuration_id."),
    response_format: responseFormatSchema,
      },
      annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: true },
    },
    async (args) => {
      try {
        const a = args as Record<string, unknown>;
        const data = await placetelRequest("DELETE", "/provisionings/{id}/custom_configurations/{custom_configuration_id}", { pathParams: { id: a.id as string | number, custom_configuration_id: a.custom_configuration_id as string | number } });
        return formatOne(data ?? { success: true }, args.response_format as ResponseFormat);
      } catch (error) {
        return toolError(handleApiError(error));
      }
    },
  );

  server.registerTool(
    "placetel_reconfigure_provisioning",
    {
      title: "Trigger reconfiguration of a phone",
      description: "Trigger reconfiguration of a phone. (POST /provisionings/{id}/reconfigure)",
      inputSchema: {
    id: z.number().int().describe("Path parameter id."),
    response_format: responseFormatSchema,
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    },
    async (args) => {
      try {
        const a = args as Record<string, unknown>;
        const data = await placetelRequest("POST", "/provisionings/{id}/reconfigure", { pathParams: { id: a.id as string | number } });
        return formatOne(data ?? { success: true }, args.response_format as ResponseFormat);
      } catch (error) {
        return toolError(handleApiError(error));
      }
    },
  );
}
