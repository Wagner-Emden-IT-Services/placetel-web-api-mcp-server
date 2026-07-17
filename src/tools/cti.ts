import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { placetelRequest } from "../services/client.js";
import { handleApiError } from "../services/errors.js";
import { formatList, formatOne, toolError } from "../services/format.js";
import { paginationMeta, paginationShape } from "../services/pagination.js";
import { ResponseFormat, responseFormatSchema } from "../types.js";

/** Auto-generated tool module for Placetel (15 tools). */
export function registerCtiTools(server: McpServer): void {
  server.registerTool(
    "placetel_cti_answer",
    {
      title: "Answer",
      description: "Answer. (POST /cti/{mac}/answer)",
      inputSchema: {
    mac: z.number().int().describe("Path parameter mac."),
    line: z.number().int().describe("Body field line (required)."),
    call_id: z.number().int().describe("Body field call_id (required)."),
    response_format: responseFormatSchema,
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    },
    async (args) => {
      try {
        const a = args as Record<string, unknown>;
        const body: Record<string, unknown> = {};
        if (a.line !== undefined) body["line"] = a.line;
        if (a.call_id !== undefined) body["call_id"] = a.call_id;
        const data = await placetelRequest("POST", "/cti/{mac}/answer", { pathParams: { mac: a.mac as string | number }, body });
        return formatOne(data ?? { success: true }, args.response_format as ResponseFormat);
      } catch (error) {
        return toolError(handleApiError(error));
      }
    },
  );

  server.registerTool(
    "placetel_cti_blind_transfer",
    {
      title: "Blind transfer",
      description: "Blind transfer. (POST /cti/{mac}/blind_transfer)",
      inputSchema: {
    mac: z.number().int().describe("Path parameter mac."),
    line: z.number().int().describe("Body field line (required)."),
    call_id: z.number().int().describe("Body field call_id (required)."),
    number: z.string().describe("Body field number (required)."),
    response_format: responseFormatSchema,
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    },
    async (args) => {
      try {
        const a = args as Record<string, unknown>;
        const body: Record<string, unknown> = {};
        if (a.line !== undefined) body["line"] = a.line;
        if (a.call_id !== undefined) body["call_id"] = a.call_id;
        if (a.number !== undefined) body["number"] = a.number;
        const data = await placetelRequest("POST", "/cti/{mac}/blind_transfer", { pathParams: { mac: a.mac as string | number }, body });
        return formatOne(data ?? { success: true }, args.response_format as ResponseFormat);
      } catch (error) {
        return toolError(handleApiError(error));
      }
    },
  );

  server.registerTool(
    "placetel_cti_complete_conference",
    {
      title: "Complete conference",
      description: "Complete conference. (POST /cti/{mac}/complete_conference)",
      inputSchema: {
    mac: z.number().int().describe("Path parameter mac."),
    line: z.number().int().describe("Body field line (required)."),
    call_id: z.number().int().describe("Body field call_id (required)."),
    response_format: responseFormatSchema,
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    },
    async (args) => {
      try {
        const a = args as Record<string, unknown>;
        const body: Record<string, unknown> = {};
        if (a.line !== undefined) body["line"] = a.line;
        if (a.call_id !== undefined) body["call_id"] = a.call_id;
        const data = await placetelRequest("POST", "/cti/{mac}/complete_conference", { pathParams: { mac: a.mac as string | number }, body });
        return formatOne(data ?? { success: true }, args.response_format as ResponseFormat);
      } catch (error) {
        return toolError(handleApiError(error));
      }
    },
  );

  server.registerTool(
    "placetel_cti_complete_transfer",
    {
      title: "Complete transfer",
      description: "Complete transfer. (POST /cti/{mac}/complete_transfer)",
      inputSchema: {
    mac: z.number().int().describe("Path parameter mac."),
    line: z.number().int().describe("Body field line (required)."),
    call_id: z.number().int().describe("Body field call_id (required)."),
    response_format: responseFormatSchema,
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    },
    async (args) => {
      try {
        const a = args as Record<string, unknown>;
        const body: Record<string, unknown> = {};
        if (a.line !== undefined) body["line"] = a.line;
        if (a.call_id !== undefined) body["call_id"] = a.call_id;
        const data = await placetelRequest("POST", "/cti/{mac}/complete_transfer", { pathParams: { mac: a.mac as string | number }, body });
        return formatOne(data ?? { success: true }, args.response_format as ResponseFormat);
      } catch (error) {
        return toolError(handleApiError(error));
      }
    },
  );

  server.registerTool(
    "placetel_cti_decline",
    {
      title: "Decline",
      description: "Decline. (POST /cti/{mac}/decline)",
      inputSchema: {
    mac: z.number().int().describe("Path parameter mac."),
    line: z.number().int().describe("Body field line (required)."),
    call_id: z.number().int().describe("Body field call_id (required)."),
    response_format: responseFormatSchema,
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    },
    async (args) => {
      try {
        const a = args as Record<string, unknown>;
        const body: Record<string, unknown> = {};
        if (a.line !== undefined) body["line"] = a.line;
        if (a.call_id !== undefined) body["call_id"] = a.call_id;
        const data = await placetelRequest("POST", "/cti/{mac}/decline", { pathParams: { mac: a.mac as string | number }, body });
        return formatOne(data ?? { success: true }, args.response_format as ResponseFormat);
      } catch (error) {
        return toolError(handleApiError(error));
      }
    },
  );

  server.registerTool(
    "placetel_cti_dial",
    {
      title: "Dial",
      description: "Dial. (POST /cti/{mac}/dial)",
      inputSchema: {
    mac: z.number().int().describe("Path parameter mac."),
    line: z.number().int().describe("Body field line (required)."),
    number: z.string().describe("Body field number (required)."),
    response_format: responseFormatSchema,
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    },
    async (args) => {
      try {
        const a = args as Record<string, unknown>;
        const body: Record<string, unknown> = {};
        if (a.line !== undefined) body["line"] = a.line;
        if (a.number !== undefined) body["number"] = a.number;
        const data = await placetelRequest("POST", "/cti/{mac}/dial", { pathParams: { mac: a.mac as string | number }, body });
        return formatOne(data ?? { success: true }, args.response_format as ResponseFormat);
      } catch (error) {
        return toolError(handleApiError(error));
      }
    },
  );

  server.registerTool(
    "placetel_cti_dial_digit",
    {
      title: "Dial digit",
      description: "Dial digit. (POST /cti/{mac}/dial_digit)",
      inputSchema: {
    mac: z.number().int().describe("Path parameter mac."),
    line: z.number().int().describe("Body field line (required)."),
    call_id: z.number().int().describe("Body field call_id (required)."),
    digit: z.string().describe("Body field digit (required)."),
    response_format: responseFormatSchema,
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    },
    async (args) => {
      try {
        const a = args as Record<string, unknown>;
        const body: Record<string, unknown> = {};
        if (a.line !== undefined) body["line"] = a.line;
        if (a.call_id !== undefined) body["call_id"] = a.call_id;
        if (a.digit !== undefined) body["digit"] = a.digit;
        const data = await placetelRequest("POST", "/cti/{mac}/dial_digit", { pathParams: { mac: a.mac as string | number }, body });
        return formatOne(data ?? { success: true }, args.response_format as ResponseFormat);
      } catch (error) {
        return toolError(handleApiError(error));
      }
    },
  );

  server.registerTool(
    "placetel_cti_hangup",
    {
      title: "Hangup",
      description: "Hangup. (POST /cti/{mac}/hangup)",
      inputSchema: {
    mac: z.number().int().describe("Path parameter mac."),
    line: z.number().int().describe("Body field line (required)."),
    call_id: z.number().int().describe("Body field call_id (required)."),
    response_format: responseFormatSchema,
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    },
    async (args) => {
      try {
        const a = args as Record<string, unknown>;
        const body: Record<string, unknown> = {};
        if (a.line !== undefined) body["line"] = a.line;
        if (a.call_id !== undefined) body["call_id"] = a.call_id;
        const data = await placetelRequest("POST", "/cti/{mac}/hangup", { pathParams: { mac: a.mac as string | number }, body });
        return formatOne(data ?? { success: true }, args.response_format as ResponseFormat);
      } catch (error) {
        return toolError(handleApiError(error));
      }
    },
  );

  server.registerTool(
    "placetel_cti_hold",
    {
      title: "Hold",
      description: "Hold. (POST /cti/{mac}/hold)",
      inputSchema: {
    mac: z.number().int().describe("Path parameter mac."),
    line: z.number().int().describe("Body field line (required)."),
    call_id: z.number().int().describe("Body field call_id (required)."),
    response_format: responseFormatSchema,
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    },
    async (args) => {
      try {
        const a = args as Record<string, unknown>;
        const body: Record<string, unknown> = {};
        if (a.line !== undefined) body["line"] = a.line;
        if (a.call_id !== undefined) body["call_id"] = a.call_id;
        const data = await placetelRequest("POST", "/cti/{mac}/hold", { pathParams: { mac: a.mac as string | number }, body });
        return formatOne(data ?? { success: true }, args.response_format as ResponseFormat);
      } catch (error) {
        return toolError(handleApiError(error));
      }
    },
  );

  server.registerTool(
    "placetel_cti_resume",
    {
      title: "Resume",
      description: "Resume. (POST /cti/{mac}/resume)",
      inputSchema: {
    mac: z.number().int().describe("Path parameter mac."),
    line: z.number().int().describe("Body field line (required)."),
    call_id: z.number().int().describe("Body field call_id (required)."),
    response_format: responseFormatSchema,
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    },
    async (args) => {
      try {
        const a = args as Record<string, unknown>;
        const body: Record<string, unknown> = {};
        if (a.line !== undefined) body["line"] = a.line;
        if (a.call_id !== undefined) body["call_id"] = a.call_id;
        const data = await placetelRequest("POST", "/cti/{mac}/resume", { pathParams: { mac: a.mac as string | number }, body });
        return formatOne(data ?? { success: true }, args.response_format as ResponseFormat);
      } catch (error) {
        return toolError(handleApiError(error));
      }
    },
  );

  server.registerTool(
    "placetel_cti_start_conference",
    {
      title: "Start conference",
      description: "Start conference. (POST /cti/{mac}/start_conference)",
      inputSchema: {
    mac: z.number().int().describe("Path parameter mac."),
    line: z.number().int().describe("Body field line (required)."),
    call_id: z.number().int().describe("Body field call_id (required)."),
    response_format: responseFormatSchema,
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    },
    async (args) => {
      try {
        const a = args as Record<string, unknown>;
        const body: Record<string, unknown> = {};
        if (a.line !== undefined) body["line"] = a.line;
        if (a.call_id !== undefined) body["call_id"] = a.call_id;
        const data = await placetelRequest("POST", "/cti/{mac}/start_conference", { pathParams: { mac: a.mac as string | number }, body });
        return formatOne(data ?? { success: true }, args.response_format as ResponseFormat);
      } catch (error) {
        return toolError(handleApiError(error));
      }
    },
  );

  server.registerTool(
    "placetel_cti_start_transfer",
    {
      title: "Start transfer",
      description: "Start transfer. (POST /cti/{mac}/start_transfer)",
      inputSchema: {
    mac: z.number().int().describe("Path parameter mac."),
    line: z.number().int().describe("Body field line (required)."),
    call_id: z.number().int().describe("Body field call_id (required)."),
    response_format: responseFormatSchema,
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    },
    async (args) => {
      try {
        const a = args as Record<string, unknown>;
        const body: Record<string, unknown> = {};
        if (a.line !== undefined) body["line"] = a.line;
        if (a.call_id !== undefined) body["call_id"] = a.call_id;
        const data = await placetelRequest("POST", "/cti/{mac}/start_transfer", { pathParams: { mac: a.mac as string | number }, body });
        return formatOne(data ?? { success: true }, args.response_format as ResponseFormat);
      } catch (error) {
        return toolError(handleApiError(error));
      }
    },
  );

  server.registerTool(
    "placetel_cti_send_dtmf_digits",
    {
      title: "Send DTMF Digits",
      description: "Send DTMF Digits. (POST /cti/{mac}/send_dtmf_digits)",
      inputSchema: {
    mac: z.number().int().describe("Path parameter mac."),
    digits: z.string().describe("Body field digits (required)."),
    response_format: responseFormatSchema,
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    },
    async (args) => {
      try {
        const a = args as Record<string, unknown>;
        const body: Record<string, unknown> = {};
        if (a.digits !== undefined) body["digits"] = a.digits;
        const data = await placetelRequest("POST", "/cti/{mac}/send_dtmf_digits", { pathParams: { mac: a.mac as string | number }, body });
        return formatOne(data ?? { success: true }, args.response_format as ResponseFormat);
      } catch (error) {
        return toolError(handleApiError(error));
      }
    },
  );

  server.registerTool(
    "placetel_get_cti_config",
    {
      title: "Get config params",
      description: "Get config params. (GET /cti/{mac}) Read-only.",
      inputSchema: {
    mac: z.number().int().describe("Path parameter mac."),
    params: z.string().optional().describe("Query params."),
    response_format: responseFormatSchema,
      },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (args) => {
      try {
        const a = args as Record<string, unknown>;
        const query: Record<string, unknown> = {};
        query["params"] = a.params;
        const data = await placetelRequest("GET", "/cti/{mac}", { pathParams: { mac: a.mac as string | number }, query });
        return formatOne(data ?? { success: true }, args.response_format as ResponseFormat);
      } catch (error) {
        return toolError(handleApiError(error));
      }
    },
  );

  server.registerTool(
    "placetel_set_cti_config",
    {
      title: "Set config params",
      description: "Set config params. (PUT /cti/{mac})",
      inputSchema: {
    mac: z.number().int().describe("Path parameter mac."),
    params: z.record(z.unknown()).describe("Body field params (required)."),
    response_format: responseFormatSchema,
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (args) => {
      try {
        const a = args as Record<string, unknown>;
        const body: Record<string, unknown> = {};
        if (a.params !== undefined) body["params"] = a.params;
        const data = await placetelRequest("PUT", "/cti/{mac}", { pathParams: { mac: a.mac as string | number }, body });
        return formatOne(data ?? { success: true }, args.response_format as ResponseFormat);
      } catch (error) {
        return toolError(handleApiError(error));
      }
    },
  );
}
