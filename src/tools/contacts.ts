import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { placetelRequest } from "../services/client.js";
import { handleApiError } from "../services/errors.js";
import { formatList, formatOne, toolError, toolText } from "../services/format.js";
import { paginationMeta, paginationShape } from "../services/pagination.js";
import { ResponseFormat, responseFormatSchema } from "../types.js";

/**
 * REFERENCE MODULE — the pattern every other tool module follows.
 * Contacts: list / create / get / update / delete (Swagger tag "Contacts").
 * Body fields derived from Swagger definitions postContacts / putContactsId.
 */

const contactWritableShape = {
  speeddial: z.string().optional(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  email: z.string().optional(),
  email_work: z.string().optional(),
  company: z.string().optional(),
  address: z.string().optional(),
  address_work: z.string().optional(),
  phone_work: z.string().optional(),
  mobile_work: z.string().optional(),
  phone: z.string().optional(),
  mobile: z.string().optional(),
  fax: z.string().optional(),
  fax_work: z.string().optional(),
  facebook_url: z.string().optional(),
  linkedin_url: z.string().optional(),
  xing_url: z.string().optional(),
  twitter_account: z.string().optional(),
  blocked: z.boolean().optional(),
  color: z.string().optional(),
  tags: z.array(z.string()).optional(),
};

type ContactWritable = { [K in keyof typeof contactWritableShape]?: unknown };

function pickBody(args: Record<string, unknown>, shape: Record<string, unknown>): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  for (const key of Object.keys(shape)) {
    if (args[key] !== undefined) body[key] = args[key];
  }
  return body;
}

export function registerContactsTools(server: McpServer): void {
  server.registerTool(
    "placetel_list_contacts",
    {
      title: "List contacts",
      description:
        "Fetch all contacts of the Placetel account. Supports field filters, number search and pagination. Read-only.\n\nReturns a list of contact objects (id, first_name, last_name, company, phone/mobile numbers, email, tags, ...).",
      inputSchema: {
        ...paginationShape,
        filter_first_name: z.string().optional().describe("Filter by first name (filter[first_name])."),
        filter_last_name: z.string().optional().describe("Filter by last name (filter[last_name])."),
        filter_company: z.string().optional().describe("Filter by company (filter[company])."),
        filter_email: z.string().optional().describe("Filter by email (filter[email])."),
        filter_blocked: z.boolean().optional().describe("Filter by blocked flag (filter[blocked])."),
        search_number: z.string().optional().describe("Search by phone number (search[number])."),
        response_format: responseFormatSchema,
      },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (args) => {
      try {
        const query: Record<string, unknown> = {
          page: args.page,
          per_page: args.per_page,
          "filter[first_name]": args.filter_first_name,
          "filter[last_name]": args.filter_last_name,
          "filter[company]": args.filter_company,
          "filter[email]": args.filter_email,
          "filter[blocked]": args.filter_blocked,
          "search[number]": args.search_number,
        };
        const data = await placetelRequest<unknown[]>("GET", "/contacts", { query });
        const meta = paginationMeta(data, args.per_page, args.page);
        return formatList(data, meta, args.response_format as ResponseFormat);
      } catch (error) {
        return toolError(handleApiError(error));
      }
    },
  );

  server.registerTool(
    "placetel_create_contact",
    {
      title: "Create contact",
      description:
        "Create a new contact. Provide any subset of contact fields (all optional). Returns the created contact object.",
      inputSchema: { ...contactWritableShape, response_format: responseFormatSchema },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    },
    async (args) => {
      try {
        const body = pickBody(args as Record<string, unknown>, contactWritableShape);
        const data = await placetelRequest("POST", "/contacts", { body });
        return formatOne(data, args.response_format as ResponseFormat);
      } catch (error) {
        return toolError(handleApiError(error));
      }
    },
  );

  server.registerTool(
    "placetel_get_contact",
    {
      title: "Get contact",
      description: "Retrieve a single contact by its numeric id. Read-only.",
      inputSchema: {
        id: z.number().int().describe("The contact id."),
        response_format: responseFormatSchema,
      },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (args) => {
      try {
        const data = await placetelRequest("GET", "/contacts/{id}", { pathParams: { id: args.id } });
        return formatOne(data, args.response_format as ResponseFormat);
      } catch (error) {
        return toolError(handleApiError(error));
      }
    },
  );

  server.registerTool(
    "placetel_update_contact",
    {
      title: "Update contact",
      description: "Update an existing contact by id. Provide the fields to change. Returns the updated contact.",
      inputSchema: {
        id: z.number().int().describe("The contact id."),
        ...contactWritableShape,
        response_format: responseFormatSchema,
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (args) => {
      try {
        const body = pickBody(args as Record<string, unknown>, contactWritableShape);
        const data = await placetelRequest("PUT", "/contacts/{id}", { pathParams: { id: args.id }, body });
        return formatOne(data, args.response_format as ResponseFormat);
      } catch (error) {
        return toolError(handleApiError(error));
      }
    },
  );

  server.registerTool(
    "placetel_delete_contact",
    {
      title: "Delete contact",
      description: "Delete a contact by id. Destructive and irreversible.",
      inputSchema: { id: z.number().int().describe("The contact id.") },
      annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: true },
    },
    async (args) => {
      try {
        await placetelRequest("DELETE", "/contacts/{id}", { pathParams: { id: args.id } });
        return toolText(`Contact ${args.id} deleted.`);
      } catch (error) {
        return toolError(handleApiError(error));
      }
    },
  );
}

// Silence unused-type warning while serving as documentation of the writable shape.
export type { ContactWritable };
