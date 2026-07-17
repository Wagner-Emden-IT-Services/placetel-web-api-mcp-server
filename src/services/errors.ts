import axios from "axios";
import { z } from "zod";

/**
 * Turns any thrown error into a concise, actionable message string for the agent.
 * Never leaks stack traces or internal details.
 */
export function handleApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const data = error.response?.data;
    const detail =
      typeof data === "string"
        ? data.slice(0, 500)
        : data
          ? JSON.stringify(data).slice(0, 500)
          : "";

    switch (status) {
      case 400:
        return `Error 400 (Bad Request): ${detail || "check the request parameters."}`;
      case 401:
        return "Error 401 (Unauthorized): PLACETEL_API_KEY is missing or invalid. Verify the API key.";
      case 403:
        return "Error 403 (Forbidden): the API key lacks permission for this resource.";
      case 404:
        return "Error 404 (Not Found): the resource does not exist. Check the ID.";
      case 422:
        return `Error 422 (Unprocessable Entity): validation failed. ${detail}`;
      case 429:
        return "Error 429 (Rate Limited): too many requests. The client already retried with Retry-After; try again shortly.";
      default:
        if (status) return `Error ${status}: API request failed. ${detail}`;
        if (error.code === "ECONNABORTED") return "Error: request timed out. Please try again.";
        return `Error: network error (${error.code ?? "unknown"}): ${error.message}`;
    }
  }

  if (error instanceof z.ZodError) {
    return `Error: invalid input: ${error.issues
      .map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`)
      .join("; ")}`;
  }

  return `Error: unexpected error: ${error instanceof Error ? error.message : String(error)}`;
}
