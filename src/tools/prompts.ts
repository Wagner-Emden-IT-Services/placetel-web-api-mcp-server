import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { placetelRequest } from "../services/client.js";
import { handleApiError } from "../services/errors.js";
import { formatList, formatOne, toolError } from "../services/format.js";
import { paginationMeta, paginationShape } from "../services/pagination.js";
import { ResponseFormat, responseFormatSchema } from "../types.js";

/** Auto-generated tool module for Placetel (5 tools). */
export function registerPromptsTools(server: McpServer): void {
  server.registerTool(
    "placetel_list_prompts",
    {
      title: "Fetch all prompts",
      description: "Fetch all prompts. (GET /prompts) Read-only.",
      inputSchema: {
    ...paginationShape,
    filter_name: z.string().optional().describe("Query filter[name]."),
    filter_description: z.string().optional().describe("Query filter[description]."),
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
        query["filter[name]"] = a.filter_name;
        query["filter[description]"] = a.filter_description;
        const data = await placetelRequest("GET", "/prompts", { query });
        const meta = paginationMeta(data as unknown[], a.per_page as number | undefined, a.page as number | undefined);
        return formatList(data as unknown[], meta, args.response_format as ResponseFormat);
      } catch (error) {
        return toolError(handleApiError(error));
      }
    },
  );

  server.registerTool(
    "placetel_create_prompt",
    {
      title: "Create a prompt",
      description: "Create a prompt. (POST /prompts)",
      inputSchema: {
    name: z.string().describe("Body field name (required)."),
    description: z.string().optional().describe("Body field description."),
    text: z.string().optional().describe("Body field text."),
    voice: z.enum(["de-DE-Wavenet-H", "de-DE-Wavenet-G", "de-DE-Chirp3-HD-Erinome", "de-DE-Chirp3-HD-Enceladus", "de-DE-Chirp3-HD-Sadachbia", "de-DE-Chirp3-HD-Sulafat", "en-GB-Neural2-A", "en-GB-Neural2-B", "en-GB-Neural2-C", "en-GB-Neural2-D", "en-GB-Neural2-F", "en-GB-Standard-A", "en-GB-Standard-B", "en-US-Neural2-A", "en-US-Neural2-C", "en-US-Neural2-D", "en-US-Neural2-E", "en-US-Neural2-F", "en-US-Neural2-G", "en-US-Neural2-H", "en-US-Neural2-I", "en-US-Neural2-J", "en-US-Wavenet-A", "en-US-Wavenet-C", "en-US-Wavenet-F", "es-ES-Neural2-A", "es-ES-Neural2-B", "es-ES-Neural2-C", "es-ES-Neural2-D", "es-ES-Neural2-E", "es-ES-Neural2-F", "es-ES-Standard-A", "fr-FR-Neural2-A", "fr-FR-Neural2-B", "fr-FR-Neural2-C", "fr-FR-Neural2-D", "fr-FR-Neural2-E", "fr-FR-Wavenet-A", "fr-FR-Wavenet-B", "it-IT-Neural2-A", "it-IT-Neural2-C", "it-IT-Wavenet-A", "it-IT-Wavenet-C", "ja-JP-Wavenet-A", "ko-KR-Standard-A", "nl-NL-Wavenet-A", "nl-NL-Wavenet-C", "nl-NL-Wavenet-D", "pt-BR-Standard-A", "pt-PT-Wavenet-A", "pt-PT-Wavenet-B", "sv-SE-Standard-A", "sv-SE-Wavenet-A", "sv-SE-Wavenet-C", "tr-TR-Standard-A", "tr-TR-Wavenet-A", "tr-TR-Wavenet-B", "Xb7hH8MSUJpSbSDYk0k2", "9BWtsMINqrJLrRacOk9x", "pqHfZKP75CvOlQylNhV4", "nPczCjzI2devNBz1zQrb", "N2lVS1w4EtoT3dr4eOWO", "IKne3meq5aSn9XLyUdCD", "XB0fDUnXU5powFXDhCwa", "iP95p4xoKVk53GoZ742B", "onwK4e9ZLuTAKqWW03F9", "FF7KdobWPaiR0vkcALHF", "cjVigY5qzO86Huf0OWal", "JBFqnCBsd6RMkjVDRZzb", "cgSgspJ2msm6clMCkdW9", "qNkzaJoHLLdpvgh5tISm", "FGY2WhTYpPnrIDTdsKH5", "TX3LPaxmHKxFdv7VOQHJ", "pFZP5JQG7iQjIQuC4Bku", "XrExE9yKIg1WjnnlVkGX", "SAz9YHcvj6GT2YYXdXww", "CwhRBWXzGAHq8TQ4Fs17", "EXAVITQu4vr4xnSDxMaL", "bIHbv24MWmeRgasZH58o"]).describe("Body field voice (required)."),
    file: z.string().optional().describe("Body field file."),
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
        if (a.text !== undefined) body["text"] = a.text;
        if (a.voice !== undefined) body["voice"] = a.voice;
        if (a.file !== undefined) body["file"] = a.file;
        const data = await placetelRequest("POST", "/prompts", { body });
        return formatOne(data ?? { success: true }, args.response_format as ResponseFormat);
      } catch (error) {
        return toolError(handleApiError(error));
      }
    },
  );

  server.registerTool(
    "placetel_get_prompt",
    {
      title: "Retrieve a prompt",
      description: "Retrieve a prompt. (GET /prompts/{id}) Read-only.",
      inputSchema: {
    id: z.number().int().describe("Path parameter id."),
    response_format: responseFormatSchema,
      },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (args) => {
      try {
        const a = args as Record<string, unknown>;
        const data = await placetelRequest("GET", "/prompts/{id}", { pathParams: { id: a.id as string | number } });
        return formatOne(data ?? { success: true }, args.response_format as ResponseFormat);
      } catch (error) {
        return toolError(handleApiError(error));
      }
    },
  );

  server.registerTool(
    "placetel_update_prompt",
    {
      title: "Update a prompt",
      description: "Update a prompt. (PUT /prompts/{id})",
      inputSchema: {
    id: z.number().int().describe("Path parameter id."),
    name: z.string().describe("Body field name (required)."),
    description: z.string().optional().describe("Body field description."),
    text: z.string().optional().describe("Body field text."),
    voice: z.enum(["de-DE-Wavenet-H", "de-DE-Wavenet-G", "de-DE-Chirp3-HD-Erinome", "de-DE-Chirp3-HD-Enceladus", "de-DE-Chirp3-HD-Sadachbia", "de-DE-Chirp3-HD-Sulafat", "en-GB-Neural2-A", "en-GB-Neural2-B", "en-GB-Neural2-C", "en-GB-Neural2-D", "en-GB-Neural2-F", "en-GB-Standard-A", "en-GB-Standard-B", "en-US-Neural2-A", "en-US-Neural2-C", "en-US-Neural2-D", "en-US-Neural2-E", "en-US-Neural2-F", "en-US-Neural2-G", "en-US-Neural2-H", "en-US-Neural2-I", "en-US-Neural2-J", "en-US-Wavenet-A", "en-US-Wavenet-C", "en-US-Wavenet-F", "es-ES-Neural2-A", "es-ES-Neural2-B", "es-ES-Neural2-C", "es-ES-Neural2-D", "es-ES-Neural2-E", "es-ES-Neural2-F", "es-ES-Standard-A", "fr-FR-Neural2-A", "fr-FR-Neural2-B", "fr-FR-Neural2-C", "fr-FR-Neural2-D", "fr-FR-Neural2-E", "fr-FR-Wavenet-A", "fr-FR-Wavenet-B", "it-IT-Neural2-A", "it-IT-Neural2-C", "it-IT-Wavenet-A", "it-IT-Wavenet-C", "ja-JP-Wavenet-A", "ko-KR-Standard-A", "nl-NL-Wavenet-A", "nl-NL-Wavenet-C", "nl-NL-Wavenet-D", "pt-BR-Standard-A", "pt-PT-Wavenet-A", "pt-PT-Wavenet-B", "sv-SE-Standard-A", "sv-SE-Wavenet-A", "sv-SE-Wavenet-C", "tr-TR-Standard-A", "tr-TR-Wavenet-A", "tr-TR-Wavenet-B", "Xb7hH8MSUJpSbSDYk0k2", "9BWtsMINqrJLrRacOk9x", "pqHfZKP75CvOlQylNhV4", "nPczCjzI2devNBz1zQrb", "N2lVS1w4EtoT3dr4eOWO", "IKne3meq5aSn9XLyUdCD", "XB0fDUnXU5powFXDhCwa", "iP95p4xoKVk53GoZ742B", "onwK4e9ZLuTAKqWW03F9", "FF7KdobWPaiR0vkcALHF", "cjVigY5qzO86Huf0OWal", "JBFqnCBsd6RMkjVDRZzb", "cgSgspJ2msm6clMCkdW9", "qNkzaJoHLLdpvgh5tISm", "FGY2WhTYpPnrIDTdsKH5", "TX3LPaxmHKxFdv7VOQHJ", "pFZP5JQG7iQjIQuC4Bku", "XrExE9yKIg1WjnnlVkGX", "SAz9YHcvj6GT2YYXdXww", "CwhRBWXzGAHq8TQ4Fs17", "EXAVITQu4vr4xnSDxMaL", "bIHbv24MWmeRgasZH58o"]).describe("Body field voice (required)."),
    file: z.string().optional().describe("Body field file."),
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
        if (a.text !== undefined) body["text"] = a.text;
        if (a.voice !== undefined) body["voice"] = a.voice;
        if (a.file !== undefined) body["file"] = a.file;
        const data = await placetelRequest("PUT", "/prompts/{id}", { pathParams: { id: a.id as string | number }, body });
        return formatOne(data ?? { success: true }, args.response_format as ResponseFormat);
      } catch (error) {
        return toolError(handleApiError(error));
      }
    },
  );

  server.registerTool(
    "placetel_delete_prompt",
    {
      title: "Delete a prompt",
      description: "Delete a prompt. (DELETE /prompts/{id}) Destructive.",
      inputSchema: {
    id: z.number().int().describe("Path parameter id."),
    response_format: responseFormatSchema,
      },
      annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: true },
    },
    async (args) => {
      try {
        const a = args as Record<string, unknown>;
        const data = await placetelRequest("DELETE", "/prompts/{id}", { pathParams: { id: a.id as string | number } });
        return formatOne(data ?? { success: true }, args.response_format as ResponseFormat);
      } catch (error) {
        return toolError(handleApiError(error));
      }
    },
  );
}
