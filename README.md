# placetel-mcp-server

MCP (Model Context Protocol) server exposing the **complete Placetel Web API v2** — all **124 endpoints** as individual, well-annotated tools. Built with the MCP TypeScript SDK (`registerTool`), Zod validation, and a shared axios client with automatic rate-limit (HTTP 429 / `Retry-After`) handling.

- **Base URL:** `https://api.placetel.de/v2`
- **Auth:** Bearer token via `PLACETEL_API_KEY`
- **Transport:** stdio (local server for Claude Desktop / Claude Code)

## Tool catalog (124 tools)

Tools are named `placetel_<verb>_<resource>` (snake_case). Read-only tools carry `readOnlyHint`, deletes carry `destructiveHint`. Full table with methods, paths and annotations: [`docs/BUILD-PLAN.md`](docs/BUILD-PLAN.md).

| Domain | Tools | Domain | Tools |
|---|--:|---|--:|
| AI | 1 | Prompts | 5 |
| Call Center | 8 | Provisionings | 9 |
| Call detail records | 1 | Recordings | 3 |
| Calls | 4 | Routing plans (+objects) | 7 |
| Contacts | 5 | Routings | 5 |
| CTI | 15 | Sip Users | 8 |
| Devices | 1 | SIM Cards | 2 |
| Faxes | 4 | Sites | 2 |
| Groups | 5 | SMS | 1 |
| Microsoft Teams | 5 | Subscriptions | 3 |
| Numbers | 8 | Webex | 14 |
| Users (incl. `/me`) | 8 | **Total** | **124** |

Every data tool accepts `response_format` (`markdown` default, or `json`). List tools accept `page` / `per_page` (note: not every endpoint honors `per_page`; Placetel list endpoints return bare arrays, so `has_more` is a heuristic).

## Setup

```bash
npm install
cp .env.example .env        # then put your Placetel API key into .env
npm run build
```

`.env`:

```
PLACETEL_API_KEY=your_api_key_here
```

Get your key at https://web.placetel.de/integrations/web_api. **Never commit `.env`** — it is gitignored.

## Run

```bash
npm start          # runs dist/index.js over stdio
npm run smoke      # starts the server, lists tools, prints TOOL_COUNT
```

### Register in an MCP client (e.g. Claude Desktop / Claude Code)

```json
{
  "mcpServers": {
    "placetel": {
      "command": "node",
      "args": ["<absolute-path>/dist/index.js"],
      "env": { "PLACETEL_API_KEY": "your_api_key_here" }
    }
  }
}
```

## Development

```bash
npm run dev        # tsx watch on src/index.ts
npm run build      # tsc -> dist/
```

- `src/index.ts` — entry point, registers all tool modules, connects stdio.
- `src/services/` — shared client, error mapping, pagination, formatting.
- `src/tools/` — one module per API domain (`contacts.ts` is the hand-written reference; the rest are generated to the same pattern from the Swagger spec).
- `evaluation.xml` — 10 read-only QA pairs (mcp-builder Phase 4).

## Notes & limits

- CTI, Webex, Microsoft Teams and SIM-card tools require the corresponding Placetel add-on products / real devices; they are implemented and type-checked but may not be exercisable on every account.
- Error messages are actionable (401 → check key, 404 → check id, 422 → validation detail, 429 → rate limited).
