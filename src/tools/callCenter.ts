import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { placetelRequest } from "../services/client.js";
import { handleApiError } from "../services/errors.js";
import { formatList, formatOne, toolError } from "../services/format.js";
import { paginationMeta, paginationShape } from "../services/pagination.js";
import { ResponseFormat, responseFormatSchema } from "../types.js";

/** Auto-generated tool module for Placetel (8 tools). */
export function registerCallCenterTools(server: McpServer): void {
  server.registerTool(
    "placetel_list_call_center_agents",
    {
      title: "Fetch all call center agents",
      description: "Fetch all call center agents. (GET /call_center_agents) Read-only.",
      inputSchema: {
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
        const data = await placetelRequest("GET", "/call_center_agents", { query });
        const meta = paginationMeta(data as unknown[], a.per_page as number | undefined, a.page as number | undefined);
        return formatList(data as unknown[], meta, args.response_format as ResponseFormat);
      } catch (error) {
        return toolError(handleApiError(error));
      }
    },
  );

  server.registerTool(
    "placetel_create_call_center_agent",
    {
      title: "Create an agent",
      description: "Create an agent. (POST /call_center_agents)",
      inputSchema: {
    name: z.string().describe("Body field name (required)."),
    extension_type: z.enum(["SIP", "PSTN"]).describe("Body field extension_type (required)."),
    extension_sip: z.string().describe("Body field extension_sip (required)."),
    extension_pstn: z.string().describe("Body field extension_pstn (required)."),
    agent_type: z.enum(["Supervisor", "Agent"]).optional().describe("Body field agent_type."),
    description: z.string().optional().describe("Body field description."),
    priority: z.number().int().optional().describe("Body field priority."),
    response_format: responseFormatSchema,
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    },
    async (args) => {
      try {
        const a = args as Record<string, unknown>;
        const body: Record<string, unknown> = {};
        if (a.name !== undefined) body["name"] = a.name;
        if (a.extension_type !== undefined) body["extension_type"] = a.extension_type;
        if (a.extension_sip !== undefined) body["extension_sip"] = a.extension_sip;
        if (a.extension_pstn !== undefined) body["extension_pstn"] = a.extension_pstn;
        if (a.agent_type !== undefined) body["agent_type"] = a.agent_type;
        if (a.description !== undefined) body["description"] = a.description;
        if (a.priority !== undefined) body["priority"] = a.priority;
        const data = await placetelRequest("POST", "/call_center_agents", { body });
        return formatOne(data ?? { success: true }, args.response_format as ResponseFormat);
      } catch (error) {
        return toolError(handleApiError(error));
      }
    },
  );

  server.registerTool(
    "placetel_update_call_center_agent",
    {
      title: "Update an agent",
      description: "Update an agent. (PUT /call_center_agents/{id})",
      inputSchema: {
    id: z.number().int().describe("Path parameter id."),
    name: z.string().optional().describe("Body field name."),
    priority: z.number().int().optional().describe("Body field priority."),
    description: z.string().optional().describe("Body field description."),
    status: z.enum(["offline", "online", "dail_out", "working", "pause"]).optional().describe("Body field status."),
    extension_type: z.enum(["SIP", "PSTN"]).optional().describe("Body field extension_type."),
    extension_sip: z.string().describe("Body field extension_sip (required)."),
    extension_pstn: z.string().describe("Body field extension_pstn (required)."),
    response_format: responseFormatSchema,
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (args) => {
      try {
        const a = args as Record<string, unknown>;
        const body: Record<string, unknown> = {};
        if (a.name !== undefined) body["name"] = a.name;
        if (a.priority !== undefined) body["priority"] = a.priority;
        if (a.description !== undefined) body["description"] = a.description;
        if (a.status !== undefined) body["status"] = a.status;
        if (a.extension_type !== undefined) body["extension_type"] = a.extension_type;
        if (a.extension_sip !== undefined) body["extension_sip"] = a.extension_sip;
        if (a.extension_pstn !== undefined) body["extension_pstn"] = a.extension_pstn;
        const data = await placetelRequest("PUT", "/call_center_agents/{id}", { pathParams: { id: a.id as string | number }, body });
        return formatOne(data ?? { success: true }, args.response_format as ResponseFormat);
      } catch (error) {
        return toolError(handleApiError(error));
      }
    },
  );

  server.registerTool(
    "placetel_list_call_center_calls",
    {
      title: "Fetch all call center calls",
      description: "Fetch all call center calls. (GET /call_center_calls) Read-only.",
      inputSchema: {
    ...paginationShape,
    date: z.string().optional().describe("Query date."),
    queue_ids: z.string().optional().describe("Query queue_ids."),
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
        query["date"] = a.date;
        query["queue_ids"] = a.queue_ids;
        const data = await placetelRequest("GET", "/call_center_calls", { query });
        const meta = paginationMeta(data as unknown[], a.per_page as number | undefined, a.page as number | undefined);
        return formatList(data as unknown[], meta, args.response_format as ResponseFormat);
      } catch (error) {
        return toolError(handleApiError(error));
      }
    },
  );

  server.registerTool(
    "placetel_pick_call_center_call",
    {
      title: "Pick a call center call",
      description: "Pick a call center call. (POST /call_center_calls/{id}/{pick})",
      inputSchema: {
    id: z.number().int().describe("Path parameter id."),
    pick: z.number().int().describe("Path parameter pick."),
    sipuid: z.string().describe("Body field sipuid (required)."),
    response_format: responseFormatSchema,
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    },
    async (args) => {
      try {
        const a = args as Record<string, unknown>;
        const body: Record<string, unknown> = {};
        if (a.sipuid !== undefined) body["sipuid"] = a.sipuid;
        const data = await placetelRequest("POST", "/call_center_calls/{id}/{pick}", { pathParams: { id: a.id as string | number, pick: a.pick as string | number }, body });
        return formatOne(data ?? { success: true }, args.response_format as ResponseFormat);
      } catch (error) {
        return toolError(handleApiError(error));
      }
    },
  );

  server.registerTool(
    "placetel_list_call_center_queues",
    {
      title: "Fetch all call center queues",
      description: "Fetch all call center queues. (GET /call_center_queues) Read-only.",
      inputSchema: {
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
        const data = await placetelRequest("GET", "/call_center_queues", { query });
        const meta = paginationMeta(data as unknown[], a.per_page as number | undefined, a.page as number | undefined);
        return formatList(data as unknown[], meta, args.response_format as ResponseFormat);
      } catch (error) {
        return toolError(handleApiError(error));
      }
    },
  );

  server.registerTool(
    "placetel_create_call_center_queue",
    {
      title: "Create a queue",
      description: "Create a queue. (POST /call_center_queues)",
      inputSchema: {
    name: z.string().describe("Body field name (required)."),
    num_loops: z.number().int().optional().describe("Body field num_loops."),
    priority: z.number().int().optional().describe("Body field priority."),
    description: z.string().optional().describe("Body field description."),
    mail_notification: z.string().optional().describe("Body field mail_notification."),
    ringing_time: z.number().int().optional().describe("Body field ringing_time."),
    max_iterations: z.number().int().optional().describe("Body field max_iterations."),
    play_prompt: z.boolean().optional().describe("Body field play_prompt."),
    prompt_id: z.number().int().optional().describe("Body field prompt_id."),
    play_prompt_waiting: z.boolean().optional().describe("Body field play_prompt_waiting."),
    prompt_waiting_id: z.number().int().optional().describe("Body field prompt_waiting_id."),
    play_prompt_end: z.boolean().optional().describe("Body field play_prompt_end."),
    prompt_end_id: z.number().int().optional().describe("Body field prompt_end_id."),
    play_mailbox: z.boolean().optional().describe("Body field play_mailbox."),
    prompt_mailbox_id: z.number().int().optional().describe("Body field prompt_mailbox_id."),
    response_format: responseFormatSchema,
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    },
    async (args) => {
      try {
        const a = args as Record<string, unknown>;
        const body: Record<string, unknown> = {};
        if (a.name !== undefined) body["name"] = a.name;
        if (a.num_loops !== undefined) body["num_loops"] = a.num_loops;
        if (a.priority !== undefined) body["priority"] = a.priority;
        if (a.description !== undefined) body["description"] = a.description;
        if (a.mail_notification !== undefined) body["mail_notification"] = a.mail_notification;
        if (a.ringing_time !== undefined) body["ringing_time"] = a.ringing_time;
        if (a.max_iterations !== undefined) body["max_iterations"] = a.max_iterations;
        if (a.play_prompt !== undefined) body["play_prompt"] = a.play_prompt;
        if (a.prompt_id !== undefined) body["prompt_id"] = a.prompt_id;
        if (a.play_prompt_waiting !== undefined) body["play_prompt_waiting"] = a.play_prompt_waiting;
        if (a.prompt_waiting_id !== undefined) body["prompt_waiting_id"] = a.prompt_waiting_id;
        if (a.play_prompt_end !== undefined) body["play_prompt_end"] = a.play_prompt_end;
        if (a.prompt_end_id !== undefined) body["prompt_end_id"] = a.prompt_end_id;
        if (a.play_mailbox !== undefined) body["play_mailbox"] = a.play_mailbox;
        if (a.prompt_mailbox_id !== undefined) body["prompt_mailbox_id"] = a.prompt_mailbox_id;
        const data = await placetelRequest("POST", "/call_center_queues", { body });
        return formatOne(data ?? { success: true }, args.response_format as ResponseFormat);
      } catch (error) {
        return toolError(handleApiError(error));
      }
    },
  );

  server.registerTool(
    "placetel_update_call_center_queue",
    {
      title: "Update a queue",
      description: "Update a queue. (PUT /call_center_queues/{id})",
      inputSchema: {
    id: z.number().int().describe("Path parameter id."),
    name: z.string().optional().describe("Body field name."),
    num_loops: z.number().int().optional().describe("Body field num_loops."),
    priority: z.number().int().optional().describe("Body field priority."),
    description: z.string().optional().describe("Body field description."),
    mail_notification: z.string().optional().describe("Body field mail_notification."),
    ringing_time: z.number().int().optional().describe("Body field ringing_time."),
    max_iterations: z.number().int().optional().describe("Body field max_iterations."),
    play_prompt: z.boolean().optional().describe("Body field play_prompt."),
    prompt_id: z.number().int().optional().describe("Body field prompt_id."),
    play_prompt_waiting: z.boolean().optional().describe("Body field play_prompt_waiting."),
    prompt_waiting_id: z.number().int().optional().describe("Body field prompt_waiting_id."),
    play_prompt_end: z.boolean().optional().describe("Body field play_prompt_end."),
    prompt_end_id: z.number().int().optional().describe("Body field prompt_end_id."),
    play_mailbox: z.boolean().optional().describe("Body field play_mailbox."),
    prompt_mailbox_id: z.number().int().optional().describe("Body field prompt_mailbox_id."),
    response_format: responseFormatSchema,
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (args) => {
      try {
        const a = args as Record<string, unknown>;
        const body: Record<string, unknown> = {};
        if (a.name !== undefined) body["name"] = a.name;
        if (a.num_loops !== undefined) body["num_loops"] = a.num_loops;
        if (a.priority !== undefined) body["priority"] = a.priority;
        if (a.description !== undefined) body["description"] = a.description;
        if (a.mail_notification !== undefined) body["mail_notification"] = a.mail_notification;
        if (a.ringing_time !== undefined) body["ringing_time"] = a.ringing_time;
        if (a.max_iterations !== undefined) body["max_iterations"] = a.max_iterations;
        if (a.play_prompt !== undefined) body["play_prompt"] = a.play_prompt;
        if (a.prompt_id !== undefined) body["prompt_id"] = a.prompt_id;
        if (a.play_prompt_waiting !== undefined) body["play_prompt_waiting"] = a.play_prompt_waiting;
        if (a.prompt_waiting_id !== undefined) body["prompt_waiting_id"] = a.prompt_waiting_id;
        if (a.play_prompt_end !== undefined) body["play_prompt_end"] = a.play_prompt_end;
        if (a.prompt_end_id !== undefined) body["prompt_end_id"] = a.prompt_end_id;
        if (a.play_mailbox !== undefined) body["play_mailbox"] = a.play_mailbox;
        if (a.prompt_mailbox_id !== undefined) body["prompt_mailbox_id"] = a.prompt_mailbox_id;
        const data = await placetelRequest("PUT", "/call_center_queues/{id}", { pathParams: { id: a.id as string | number }, body });
        return formatOne(data ?? { success: true }, args.response_format as ResponseFormat);
      } catch (error) {
        return toolError(handleApiError(error));
      }
    },
  );
}
