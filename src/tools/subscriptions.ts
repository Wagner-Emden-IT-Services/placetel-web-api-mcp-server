import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { placetelRequest } from "../services/client.js";
import { handleApiError } from "../services/errors.js";
import { formatList, formatOne, toolError } from "../services/format.js";
import { paginationMeta, paginationShape } from "../services/pagination.js";
import { ResponseFormat, responseFormatSchema } from "../types.js";

/** Auto-generated tool module for Placetel (3 tools). */
export function registerSubscriptionsTools(server: McpServer): void {
  server.registerTool(
    "placetel_list_subscriptions",
    {
      title: "List subscriptions",
      description: "List subscriptions. (GET /subscriptions) Read-only.",
      inputSchema: {
    response_format: responseFormatSchema,
      },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (args) => {
      try {
        const a = args as Record<string, unknown>;
        const data = await placetelRequest("GET", "/subscriptions", {  });
        const meta = paginationMeta(data as unknown[], a.per_page as number | undefined, a.page as number | undefined);
        return formatList(data as unknown[], meta, args.response_format as ResponseFormat);
      } catch (error) {
        return toolError(handleApiError(error));
      }
    },
  );

  server.registerTool(
    "placetel_add_subscription",
    {
      title: "Add a subscription",
      description: "Add a subscription. (PUT /subscriptions)",
      inputSchema: {
    service: z.string().describe("Body field service (required)."),
    url: z.string().describe("Body field url (required)."),
    incoming: z.boolean().optional().describe("Body field incoming."),
    outgoing: z.boolean().optional().describe("Body field outgoing."),
    hungup: z.boolean().optional().describe("Body field hungup."),
    accepted: z.boolean().optional().describe("Body field accepted."),
    phone: z.boolean().optional().describe("Body field phone."),
    numbers: z.array(z.string()).optional().describe("Body field numbers."),
    response_format: responseFormatSchema,
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (args) => {
      try {
        const a = args as Record<string, unknown>;
        const body: Record<string, unknown> = {};
        if (a.service !== undefined) body["service"] = a.service;
        if (a.url !== undefined) body["url"] = a.url;
        if (a.incoming !== undefined) body["incoming"] = a.incoming;
        if (a.outgoing !== undefined) body["outgoing"] = a.outgoing;
        if (a.hungup !== undefined) body["hungup"] = a.hungup;
        if (a.accepted !== undefined) body["accepted"] = a.accepted;
        if (a.phone !== undefined) body["phone"] = a.phone;
        if (a.numbers !== undefined) body["numbers"] = a.numbers;
        const data = await placetelRequest("PUT", "/subscriptions", { body });
        return formatOne(data ?? { success: true }, args.response_format as ResponseFormat);
      } catch (error) {
        return toolError(handleApiError(error));
      }
    },
  );

  server.registerTool(
    "placetel_delete_subscription",
    {
      title: "Delete a subscription",
      description: "Delete a subscription. (DELETE /subscriptions/{id}) Destructive.",
      inputSchema: {
    id: z.string().describe("Path parameter id."),
    response_format: responseFormatSchema,
      },
      annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: true },
    },
    async (args) => {
      try {
        const a = args as Record<string, unknown>;
        const data = await placetelRequest("DELETE", "/subscriptions/{id}", { pathParams: { id: a.id as string | number } });
        return formatOne(data ?? { success: true }, args.response_format as ResponseFormat);
      } catch (error) {
        return toolError(handleApiError(error));
      }
    },
  );
}
