import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { placetelRequest } from "../services/client.js";
import { handleApiError } from "../services/errors.js";
import { formatList, formatOne, toolError } from "../services/format.js";
import { paginationMeta, paginationShape } from "../services/pagination.js";
import { ResponseFormat, responseFormatSchema } from "../types.js";

/** Auto-generated tool module for Placetel (5 tools). */
export function registerMicrosoftTeamsTools(server: McpServer): void {
  server.registerTool(
    "placetel_get_microsoft_teams_integration",
    {
      title: "Integration",
      description: "Integration. (GET /microsoft_teams/integration) Read-only.",
      inputSchema: {
    response_format: responseFormatSchema,
      },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (args) => {
      try {
        const a = args as Record<string, unknown>;
        const data = await placetelRequest("GET", "/microsoft_teams/integration", {  });
        return formatOne(data ?? { success: true }, args.response_format as ResponseFormat);
      } catch (error) {
        return toolError(handleApiError(error));
      }
    },
  );

  server.registerTool(
    "placetel_import_microsoft_teams_user",
    {
      title: "Import user",
      description: "Import user. (POST /microsoft_teams/users)",
      inputSchema: {
    sip_user_id: z.number().int().describe("Body field sip_user_id (required)."),
    ms_uuid: z.string().describe("Body field ms_uuid (required)."),
    response_format: responseFormatSchema,
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    },
    async (args) => {
      try {
        const a = args as Record<string, unknown>;
        const body: Record<string, unknown> = {};
        if (a.sip_user_id !== undefined) body["sip_user_id"] = a.sip_user_id;
        if (a.ms_uuid !== undefined) body["ms_uuid"] = a.ms_uuid;
        const data = await placetelRequest("POST", "/microsoft_teams/users", { body });
        return formatOne(data ?? { success: true }, args.response_format as ResponseFormat);
      } catch (error) {
        return toolError(handleApiError(error));
      }
    },
  );

  server.registerTool(
    "placetel_list_microsoft_teams_users",
    {
      title: "Fetch all users",
      description: "Fetch all users. (GET /microsoft_teams/users) Read-only.",
      inputSchema: {
    ...paginationShape,
    filter_sync_status: z.string().optional().describe("Query filter[sync_status]."),
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
        query["filter[sync_status]"] = a.filter_sync_status;
        const data = await placetelRequest("GET", "/microsoft_teams/users", { query });
        const meta = paginationMeta(data as unknown[], a.per_page as number | undefined, a.page as number | undefined);
        return formatList(data as unknown[], meta, args.response_format as ResponseFormat);
      } catch (error) {
        return toolError(handleApiError(error));
      }
    },
  );

  server.registerTool(
    "placetel_sync_microsoft_teams_user",
    {
      title: "Sync user",
      description: "Sync user. (PATCH /microsoft_teams/sync/{sip_user_id})",
      inputSchema: {
    sip_user_id: z.number().int().describe("Path parameter sip_user_id."),
    response_format: responseFormatSchema,
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    },
    async (args) => {
      try {
        const a = args as Record<string, unknown>;
        const data = await placetelRequest("PATCH", "/microsoft_teams/sync/{sip_user_id}", { pathParams: { sip_user_id: a.sip_user_id as string | number } });
        return formatOne(data ?? { success: true }, args.response_format as ResponseFormat);
      } catch (error) {
        return toolError(handleApiError(error));
      }
    },
  );

  server.registerTool(
    "placetel_disconnect_microsoft_teams_user",
    {
      title: "Disconnect user",
      description: "Disconnect user. (DELETE /microsoft_teams/users/{sip_user_id}) Destructive.",
      inputSchema: {
    sip_user_id: z.number().int().describe("Path parameter sip_user_id."),
    response_format: responseFormatSchema,
      },
      annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: true },
    },
    async (args) => {
      try {
        const a = args as Record<string, unknown>;
        const data = await placetelRequest("DELETE", "/microsoft_teams/users/{sip_user_id}", { pathParams: { sip_user_id: a.sip_user_id as string | number } });
        return formatOne(data ?? { success: true }, args.response_format as ResponseFormat);
      } catch (error) {
        return toolError(handleApiError(error));
      }
    },
  );
}
