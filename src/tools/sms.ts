import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { placetelRequest } from "../services/client.js";
import { handleApiError } from "../services/errors.js";
import { formatList, formatOne, toolError } from "../services/format.js";
import { paginationMeta, paginationShape } from "../services/pagination.js";
import { ResponseFormat, responseFormatSchema } from "../types.js";

/** Auto-generated tool module for Placetel (1 tools). */
export function registerSmsTools(server: McpServer): void {
  server.registerTool(
    "placetel_send_sms",
    {
      title: "Send SMS",
      description: "Send SMS. (POST /sms)",
      inputSchema: {
    recipient: z.string().describe("Body field recipient (required)."),
    message: z.string().describe("Body field message (required)."),
    response_format: responseFormatSchema,
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    },
    async (args) => {
      try {
        const a = args as Record<string, unknown>;
        const body: Record<string, unknown> = {};
        if (a.recipient !== undefined) body["recipient"] = a.recipient;
        if (a.message !== undefined) body["message"] = a.message;
        const data = await placetelRequest("POST", "/sms", { body });
        return formatOne(data ?? { success: true }, args.response_format as ResponseFormat);
      } catch (error) {
        return toolError(handleApiError(error));
      }
    },
  );
}
