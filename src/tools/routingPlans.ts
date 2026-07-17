import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { placetelRequest } from "../services/client.js";
import { handleApiError } from "../services/errors.js";
import { formatList, formatOne, toolError } from "../services/format.js";
import { paginationMeta, paginationShape } from "../services/pagination.js";
import { ResponseFormat, responseFormatSchema } from "../types.js";

/** Auto-generated tool module for Placetel (7 tools). */
export function registerRoutingPlansTools(server: McpServer): void {
  server.registerTool(
    "placetel_list_routing_plans",
    {
      title: "Get all routing plans",
      description: "Get all routing plans. (GET /routing_plans) Read-only.",
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
        const data = await placetelRequest("GET", "/routing_plans", { query });
        const meta = paginationMeta(data as unknown[], a.per_page as number | undefined, a.page as number | undefined);
        return formatList(data as unknown[], meta, args.response_format as ResponseFormat);
      } catch (error) {
        return toolError(handleApiError(error));
      }
    },
  );

  server.registerTool(
    "placetel_create_routing_plan",
    {
      title: "Create a routing plan",
      description: "Create a routing plan. (POST /routing_plans)",
      inputSchema: {
    name: z.string().optional().describe("Body field name."),
    description: z.string().optional().describe("Body field description."),
    did: z.string().optional().describe("Body field did."),
    routing_objects: z.array(z.string()).optional().describe("Body field routing_objects."),
    response_format: responseFormatSchema,
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    },
    async (args) => {
      try {
        const a = args as Record<string, unknown>;
        const body: Record<string, unknown> = {};
        if (a.name !== undefined) body["name"] = a.name;
        if (a.description !== undefined) body["description"] = a.description;
        if (a.did !== undefined) body["did"] = a.did;
        if (a.routing_objects !== undefined) body["routing_objects"] = a.routing_objects;
        const data = await placetelRequest("POST", "/routing_plans", { body });
        return formatOne(data ?? { success: true }, args.response_format as ResponseFormat);
      } catch (error) {
        return toolError(handleApiError(error));
      }
    },
  );

  server.registerTool(
    "placetel_get_routing_plan",
    {
      title: "Get a routing plan",
      description: "Get a routing plan. (GET /routing_plans/{id}) Read-only.",
      inputSchema: {
    id: z.string().describe("Path parameter id."),
    response_format: responseFormatSchema,
      },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (args) => {
      try {
        const a = args as Record<string, unknown>;
        const data = await placetelRequest("GET", "/routing_plans/{id}", { pathParams: { id: a.id as string | number } });
        return formatOne(data ?? { success: true }, args.response_format as ResponseFormat);
      } catch (error) {
        return toolError(handleApiError(error));
      }
    },
  );

  server.registerTool(
    "placetel_update_routing_plan",
    {
      title: "Update a routing plan",
      description: "Update a routing plan. (PUT /routing_plans/{id})",
      inputSchema: {
    id: z.number().int().describe("Path parameter id."),
    name: z.string().describe("Body field name (required)."),
    description: z.string().optional().describe("Body field description."),
    did: z.string().optional().describe("Body field did."),
    routing_objects: z.array(z.string()).optional().describe("Body field routing_objects."),
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
        if (a.routing_objects !== undefined) body["routing_objects"] = a.routing_objects;
        const data = await placetelRequest("PUT", "/routing_plans/{id}", { pathParams: { id: a.id as string | number }, body });
        return formatOne(data ?? { success: true }, args.response_format as ResponseFormat);
      } catch (error) {
        return toolError(handleApiError(error));
      }
    },
  );

  server.registerTool(
    "placetel_delete_routing_plan",
    {
      title: "Delete a routing plan",
      description: "Delete a routing plan. (DELETE /routing_plans/{id}) Destructive.",
      inputSchema: {
    id: z.number().int().describe("Path parameter id."),
    response_format: responseFormatSchema,
      },
      annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: true },
    },
    async (args) => {
      try {
        const a = args as Record<string, unknown>;
        const data = await placetelRequest("DELETE", "/routing_plans/{id}", { pathParams: { id: a.id as string | number } });
        return formatOne(data ?? { success: true }, args.response_format as ResponseFormat);
      } catch (error) {
        return toolError(handleApiError(error));
      }
    },
  );

  server.registerTool(
    "placetel_list_routing_plan_routings",
    {
      title: "Get a routing plans objects",
      description: "Get a routing plans objects. (GET /routing_plans/{id}/routings) Read-only.",
      inputSchema: {
    id: z.string().describe("Path parameter id."),
    response_format: responseFormatSchema,
      },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (args) => {
      try {
        const a = args as Record<string, unknown>;
        const data = await placetelRequest("GET", "/routing_plans/{id}/routings", { pathParams: { id: a.id as string | number } });
        const meta = paginationMeta(data as unknown[], a.per_page as number | undefined, a.page as number | undefined);
        return formatList(data as unknown[], meta, args.response_format as ResponseFormat);
      } catch (error) {
        return toolError(handleApiError(error));
      }
    },
  );

  server.registerTool(
    "placetel_simulate_routing_plan",
    {
      title: "Simulate the usage of a routing plan",
      description: "Simulate the usage of a routing plan. (GET /routing_plans/{id}/simulate) Read-only.",
      inputSchema: {
    id: z.string().describe("Path parameter id."),
    time: z.string().optional().describe("Query time."),
    response_format: responseFormatSchema,
      },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (args) => {
      try {
        const a = args as Record<string, unknown>;
        const query: Record<string, unknown> = {};
        query["time"] = a.time;
        const data = await placetelRequest("GET", "/routing_plans/{id}/simulate", { pathParams: { id: a.id as string | number }, query });
        return formatOne(data ?? { success: true }, args.response_format as ResponseFormat);
      } catch (error) {
        return toolError(handleApiError(error));
      }
    },
  );
}
