import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { placetelRequest } from "../services/client.js";
import { handleApiError } from "../services/errors.js";
import { formatList, formatOne, toolError } from "../services/format.js";
import { paginationMeta, paginationShape } from "../services/pagination.js";
import { ResponseFormat, responseFormatSchema } from "../types.js";

/** Auto-generated tool module for Placetel (5 tools). */
export function registerRoutingsTools(server: McpServer): void {
  server.registerTool(
    "placetel_list_routings",
    {
      title: "Get all routings",
      description: "Get all routings. (GET /routings) Read-only.",
      inputSchema: {
    ...paginationShape,
    filter_updated_at_gte: z.string().optional().describe("Query filter[updated_at_gte]."),
    filter_updated_at_lte: z.string().optional().describe("Query filter[updated_at_lte]."),
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
        query["filter[updated_at_gte]"] = a.filter_updated_at_gte;
        query["filter[updated_at_lte]"] = a.filter_updated_at_lte;
        const data = await placetelRequest("GET", "/routings", { query });
        const meta = paginationMeta(data as unknown[], a.per_page as number | undefined, a.page as number | undefined);
        return formatList(data as unknown[], meta, args.response_format as ResponseFormat);
      } catch (error) {
        return toolError(handleApiError(error));
      }
    },
  );

  server.registerTool(
    "placetel_create_routing",
    {
      title: "Create a routing object",
      description: "Create a routing object. (POST /routings)",
      inputSchema: {
    name: z.string().describe("Body field name (required)."),
    forward: z.record(z.unknown()).optional().describe("Body field forward."),
    group: z.record(z.unknown()).optional().describe("Body field group."),
    ivr: z.record(z.unknown()).optional().describe("Body field ivr."),
    queue: z.record(z.unknown()).optional().describe("Body field queue."),
    api: z.record(z.unknown()).optional().describe("Body field api."),
    mailbox: z.record(z.unknown()).optional().describe("Body field mailbox."),
    notification: z.record(z.unknown()).optional().describe("Body field notification."),
    time_settings: z.record(z.unknown()).optional().describe("Body field time_settings."),
    custom_callerid: z.record(z.unknown()).optional().describe("Body field custom_callerid."),
    music_on_hold: z.boolean().optional().describe("Body field music_on_hold."),
    notify_external_api: z.boolean().optional().describe("Body field notify_external_api."),
    response_format: responseFormatSchema,
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    },
    async (args) => {
      try {
        const a = args as Record<string, unknown>;
        const body: Record<string, unknown> = {};
        if (a.name !== undefined) body["name"] = a.name;
        if (a.forward !== undefined) body["forward"] = a.forward;
        if (a.group !== undefined) body["group"] = a.group;
        if (a.ivr !== undefined) body["ivr"] = a.ivr;
        if (a.queue !== undefined) body["queue"] = a.queue;
        if (a.api !== undefined) body["api"] = a.api;
        if (a.mailbox !== undefined) body["mailbox"] = a.mailbox;
        if (a.notification !== undefined) body["notification"] = a.notification;
        if (a.time_settings !== undefined) body["time_settings"] = a.time_settings;
        if (a.custom_callerid !== undefined) body["custom_callerid"] = a.custom_callerid;
        if (a.music_on_hold !== undefined) body["music_on_hold"] = a.music_on_hold;
        if (a.notify_external_api !== undefined) body["notify_external_api"] = a.notify_external_api;
        const data = await placetelRequest("POST", "/routings", { body });
        return formatOne(data ?? { success: true }, args.response_format as ResponseFormat);
      } catch (error) {
        return toolError(handleApiError(error));
      }
    },
  );

  server.registerTool(
    "placetel_get_routing",
    {
      title: "Retrieve routing",
      description: "Retrieve routing. (GET /routings/{number_or_id}) Read-only.",
      inputSchema: {
    number_or_id: z.string().describe("Path parameter number_or_id."),
    response_format: responseFormatSchema,
      },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (args) => {
      try {
        const a = args as Record<string, unknown>;
        const data = await placetelRequest("GET", "/routings/{number_or_id}", { pathParams: { number_or_id: a.number_or_id as string | number } });
        return formatOne(data ?? { success: true }, args.response_format as ResponseFormat);
      } catch (error) {
        return toolError(handleApiError(error));
      }
    },
  );

  server.registerTool(
    "placetel_update_routing",
    {
      title: "Update routing",
      description: "Update routing. (PUT /routings/{number_or_id})",
      inputSchema: {
    number_or_id: z.string().describe("Path parameter number_or_id."),
    name: z.string().optional().describe("Body field name."),
    forward: z.record(z.unknown()).optional().describe("Body field forward."),
    group: z.record(z.unknown()).optional().describe("Body field group."),
    plan: z.record(z.unknown()).optional().describe("Body field plan."),
    ivr: z.record(z.unknown()).optional().describe("Body field ivr."),
    queue: z.record(z.unknown()).optional().describe("Body field queue."),
    api: z.record(z.unknown()).optional().describe("Body field api."),
    mailbox: z.record(z.unknown()).optional().describe("Body field mailbox."),
    notification: z.record(z.unknown()).optional().describe("Body field notification."),
    time_settings: z.record(z.unknown()).optional().describe("Body field time_settings."),
    custom_callerid: z.record(z.unknown()).optional().describe("Body field custom_callerid."),
    music_on_hold: z.boolean().optional().describe("Body field music_on_hold."),
    notify_external_api: z.boolean().optional().describe("Body field notify_external_api."),
    response_format: responseFormatSchema,
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (args) => {
      try {
        const a = args as Record<string, unknown>;
        const body: Record<string, unknown> = {};
        if (a.name !== undefined) body["name"] = a.name;
        if (a.forward !== undefined) body["forward"] = a.forward;
        if (a.group !== undefined) body["group"] = a.group;
        if (a.plan !== undefined) body["plan"] = a.plan;
        if (a.ivr !== undefined) body["ivr"] = a.ivr;
        if (a.queue !== undefined) body["queue"] = a.queue;
        if (a.api !== undefined) body["api"] = a.api;
        if (a.mailbox !== undefined) body["mailbox"] = a.mailbox;
        if (a.notification !== undefined) body["notification"] = a.notification;
        if (a.time_settings !== undefined) body["time_settings"] = a.time_settings;
        if (a.custom_callerid !== undefined) body["custom_callerid"] = a.custom_callerid;
        if (a.music_on_hold !== undefined) body["music_on_hold"] = a.music_on_hold;
        if (a.notify_external_api !== undefined) body["notify_external_api"] = a.notify_external_api;
        const data = await placetelRequest("PUT", "/routings/{number_or_id}", { pathParams: { number_or_id: a.number_or_id as string | number }, body });
        return formatOne(data ?? { success: true }, args.response_format as ResponseFormat);
      } catch (error) {
        return toolError(handleApiError(error));
      }
    },
  );

  server.registerTool(
    "placetel_delete_routing",
    {
      title: "Delete a routing object",
      description: "Delete a routing object. (DELETE /routings/{number_or_id}) Destructive.",
      inputSchema: {
    number_or_id: z.string().describe("Path parameter number_or_id."),
    response_format: responseFormatSchema,
      },
      annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: true },
    },
    async (args) => {
      try {
        const a = args as Record<string, unknown>;
        const data = await placetelRequest("DELETE", "/routings/{number_or_id}", { pathParams: { number_or_id: a.number_or_id as string | number } });
        return formatOne(data ?? { success: true }, args.response_format as ResponseFormat);
      } catch (error) {
        return toolError(handleApiError(error));
      }
    },
  );
}
