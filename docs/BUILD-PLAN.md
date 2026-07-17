# BUILD-PLAN — placetel-mcp-server

> Phase-1-Deliverable (mcp-builder). Vollstaendiger MCP-Server fuer die Placetel Web API v2.
> Stand: 2026-07-17. Autoritative Quelle: `swagger_doc.json` (Placetel OpenAPI/Swagger 2.0, 124 Operationen, 78 Pfade, 87 Definitions).

## 1. Entscheidungen (fixiert)

| Punkt | Entscheidung | Begruendung |
|---|---|---|
| Sprache/SDK | TypeScript + `@modelcontextprotocol/sdk` (`McpServer` + `registerTool`) | mcp-builder-Default; beste SDK-Qualitaet |
| Transport | stdio | lokaler Server fuer Claude Desktop/Code |
| Validierung | Zod (`.strict()`), aus Swagger abgeleitet | Laufzeit-Typsicherheit |
| HTTP-Client | axios, ein zentraler Client | DRY, einheitliches Auth/Error/Rate-Limit |
| Tool-Zahl | **124** (ein Tool pro Endpunkt, KEINE Konsolidierung) | 124 < ~128 Client-Limit; volle Abdeckung |
| Response-Format | `response_format: json | markdown` pro Tool (Default markdown) | mcp-builder-Standard |
| Auth | `PLACETEL_API_KEY` aus `.env` (Bearer-Header) | nie hardcoden, `.env` gitignored |

**Ziel-Toolzahl fuer die /goal-Bedingung: 124.**

## 2. API-Integrationsfakten (aus Swagger verifiziert — nicht geraten)

- **Base URL:** `https://api.placetel.de/v2` (host `api.placetel.de`, basePath `/v2`, nur https)
- **Auth:** `Authorization: Bearer <PLACETEL_API_KEY>` (securityDefinitions.Bearer, apiKey im Header). Global fuer alle Endpunkte.
- **Pagination:** query-Parameter `page` und `per_page` (i. d. R. bis 100). **NICHT alle** Endpunkte honorieren sie.
- **Listen-Responses sind BLANKE JSON-Arrays** (z. B. `GET /contacts` -> `Contact[]`, `GET /sip_users` -> `SipUser[]`). **Kein** umschliessendes `{total, items}`-Objekt, **keine** Pagination-Metadaten im Body.
  - Konsequenz fuer den Pagination-Helfer: `has_more` wird **heuristisch** aus `returned_count === per_page` abgeleitet (kein `total`/`next_offset` verfuegbar); `next_page = page + 1` nur wenn `has_more`.
- **Rate-Limiting:** Token-Bucket. Response-Header `RateLimit-Remaining`, `RateLimit-Reset`. Bei HTTP **429**: Header `Retry-After` (Sekunden) respektieren.
- **Fehler-Schemas:** Swagger dokumentiert nur `200`-Responses, **keine** 4xx-Body-Schemas -> generisches Error-Handling nach HTTP-Statuscode.
- **87 Definitions** stehen fuer Read-/Write-Schema-Ableitung bereit (z. B. `Contact`, `SipUser`, `Number`, `Me`, `postContacts`, `putContactsId`, ...).

## 3. Projektstruktur

```
placetel-mcp-server/
├── package.json            # type:module, scripts build/start/dev, deps sdk+axios+zod
├── tsconfig.json           # strict, Node16, outDir dist
├── .gitignore              # .env, dist, node_modules
├── .env.example            # PLACETEL_API_KEY=
├── README.md               # Setup + vollstaendiger Tool-Katalog
├── evaluation.xml          # 10 QA-Paare (mcp-builder Phase 4)
├── scripts/
│   └── smoke.mjs           # startet Server, ruft tools/list, druckt Anzahl (kein GUI)
├── src/
│   ├── index.ts            # McpServer init, registriert alle Tool-Module, stdio connect, ENV-Check
│   ├── constants.ts        # API_BASE_URL, CHARACTER_LIMIT
│   ├── types.ts            # gemeinsame Typen / ResponseFormat-Enum
│   ├── services/
│   │   ├── client.ts       # axios-Client: Auth-Header, Timeout, 429/Retry-After-Retry
│   │   ├── errors.ts       # handleApiError -> actionable messages
│   │   ├── pagination.ts   # page/per_page Schema-Fragment + has_more-Heuristik
│   │   └── format.ts       # json|markdown Formatter + CHARACTER_LIMIT-Truncation
│   ├── schemas/            # Zod-Schemas pro Domaene (aus Swagger abgeleitet)
│   └── tools/              # ein Modul pro Tag, exportiert register<Domain>Tools(server)
│       ├── ai.ts, callCenter.ts, calls.ts, contacts.ts, cti.ts, devices.ts,
│       ├── faxes.ts, groups.ts, microsoftTeams.ts, numbers.ts, prompts.ts,
│       ├── provisionings.ts, recordings.ts, routingPlans.ts, routings.ts,
│       ├── sipUsers.ts, simCards.ts, sites.ts, sms.ts, subscriptions.ts,
│       ├── webex.ts, users.ts
└── dist/                   # Build-Output (dist/index.js)
```

## 4. Shared-Infrastruktur (DRY-Kern)

- **`client.ts`** — `placetelRequest<T>(method, path, { query, body })`:
  - Base `https://api.placetel.de/v2`, Header `Authorization: Bearer ${PLACETEL_API_KEY}`, `Accept: application/json`.
  - Timeout 30 s. Bei **429**: bis zu 3 Retries, Wartezeit = `Retry-After`-Header (Fallback exponentiell). Path-Parameter werden typsicher substituiert (`/contacts/{id}` -> `/contacts/123`).
- **`errors.ts`** — `handleApiError(error)` -> actionable Strings (401 „API-Key pruefen", 404 „ID pruefen", 422 „Validierung: <details>", 429 „Rate-Limit, Retry-After beachten", generisch mit Statuscode). Kein Leak interner Details.
- **`pagination.ts`** — wiederverwendbares Zod-Fragment `{ page?, per_page? }` (nur fuer paginierte Tools, siehe Spalte „Paginated"); Ergebnis-Wrapper `{ items, count, page, per_page, has_more }` (has_more-Heuristik s. o.).
- **`format.ts`** — `formatResponse(data, response_format, mdRenderer?)`: JSON (pretty) oder Markdown; `CHARACTER_LIMIT` (25000) mit klarer Truncation-Message.
- **Annotation-Matrix** (pro Methode, s. Inventar): GET=readOnly; POST=Aktion/anlegen (nicht idempotent); PUT=idempotent; PATCH=partiell (nicht idempotent); DELETE=destruktiv+idempotent; openWorldHint=true fuer ALLE.

## 5. Tool-Inventar (124 — vollstaendig, 1:1 zu den Endpunkten)

Legende Annotations: **R**=readOnlyHint, **D**=destructiveHint, **I**=idempotentHint, **O**=openWorldHint (`1`=true,`0`=false). Body-Schema = Swagger-`definitions`-Name (Quelle fuer Zod-Ableitung in Phase 2).


### AI (1)

| Tool | Method | Path | Annotations (R/D/I/O) | Destructive | Body-Schema | Paginated |
|---|---|---|---|:--:|---|:--:|
| `placetel_get_ai_status` | GET | `/ai/status` | R1 D0 I1 O1 |  |  |  |

### Call Center (8)

| Tool | Method | Path | Annotations (R/D/I/O) | Destructive | Body-Schema | Paginated |
|---|---|---|---|:--:|---|:--:|
| `placetel_list_call_center_agents` | GET | `/call_center_agents` | R1 D0 I1 O1 |  |  | yes |
| `placetel_create_call_center_agent` | POST | `/call_center_agents` | R0 D0 I0 O1 |  | `postCallCenterAgents` |  |
| `placetel_update_call_center_agent` | PUT | `/call_center_agents/{id}` | R0 D0 I1 O1 |  | `putCallCenterAgentsId` |  |
| `placetel_list_call_center_calls` | GET | `/call_center_calls` | R1 D0 I1 O1 |  |  | yes |
| `placetel_pick_call_center_call` | POST | `/call_center_calls/{id}/{pick}` | R0 D0 I0 O1 |  | `postCallCenterCallsIdPick` |  |
| `placetel_list_call_center_queues` | GET | `/call_center_queues` | R1 D0 I1 O1 |  |  | yes |
| `placetel_create_call_center_queue` | POST | `/call_center_queues` | R0 D0 I0 O1 |  | `postCallCenterQueues` |  |
| `placetel_update_call_center_queue` | PUT | `/call_center_queues/{id}` | R0 D0 I1 O1 |  | `putCallCenterQueuesId` |  |

### Call detail records (1)

| Tool | Method | Path | Annotations (R/D/I/O) | Destructive | Body-Schema | Paginated |
|---|---|---|---|:--:|---|:--:|
| `placetel_list_call_detail_records` | GET | `/call_detail_records` | R1 D0 I1 O1 |  |  | yes |

### Calls (4)

| Tool | Method | Path | Annotations (R/D/I/O) | Destructive | Body-Schema | Paginated |
|---|---|---|---|:--:|---|:--:|
| `placetel_list_calls` | GET | `/calls` | R1 D0 I1 O1 |  |  | yes |
| `placetel_initiate_call` | POST | `/calls` | R0 D0 I0 O1 |  | `postCalls` |  |
| `placetel_get_call` | GET | `/calls/{id}` | R1 D0 I1 O1 |  |  |  |
| `placetel_delete_call` | DELETE | `/calls/{id}` | R0 D1 I1 O1 | YES |  |  |

### Contacts (5)

| Tool | Method | Path | Annotations (R/D/I/O) | Destructive | Body-Schema | Paginated |
|---|---|---|---|:--:|---|:--:|
| `placetel_list_contacts` | GET | `/contacts` | R1 D0 I1 O1 |  |  | yes |
| `placetel_create_contact` | POST | `/contacts` | R0 D0 I0 O1 |  | `postContacts` |  |
| `placetel_get_contact` | GET | `/contacts/{id}` | R1 D0 I1 O1 |  |  |  |
| `placetel_update_contact` | PUT | `/contacts/{id}` | R0 D0 I1 O1 |  | `putContactsId` |  |
| `placetel_delete_contact` | DELETE | `/contacts/{id}` | R0 D1 I1 O1 | YES |  |  |

### CTI (15)

| Tool | Method | Path | Annotations (R/D/I/O) | Destructive | Body-Schema | Paginated |
|---|---|---|---|:--:|---|:--:|
| `placetel_cti_answer` | POST | `/cti/{mac}/answer` | R0 D0 I0 O1 |  | `postCtiMacAnswer` |  |
| `placetel_cti_blind_transfer` | POST | `/cti/{mac}/blind_transfer` | R0 D0 I0 O1 |  | `postCtiMacBlindTransfer` |  |
| `placetel_cti_complete_conference` | POST | `/cti/{mac}/complete_conference` | R0 D0 I0 O1 |  | `postCtiMacCompleteConference` |  |
| `placetel_cti_complete_transfer` | POST | `/cti/{mac}/complete_transfer` | R0 D0 I0 O1 |  | `postCtiMacCompleteTransfer` |  |
| `placetel_cti_decline` | POST | `/cti/{mac}/decline` | R0 D0 I0 O1 |  | `postCtiMacDecline` |  |
| `placetel_cti_dial` | POST | `/cti/{mac}/dial` | R0 D0 I0 O1 |  | `postCtiMacDial` |  |
| `placetel_cti_dial_digit` | POST | `/cti/{mac}/dial_digit` | R0 D0 I0 O1 |  | `postCtiMacDialDigit` |  |
| `placetel_cti_hangup` | POST | `/cti/{mac}/hangup` | R0 D0 I0 O1 |  | `postCtiMacHangup` |  |
| `placetel_cti_hold` | POST | `/cti/{mac}/hold` | R0 D0 I0 O1 |  | `postCtiMacHold` |  |
| `placetel_cti_resume` | POST | `/cti/{mac}/resume` | R0 D0 I0 O1 |  | `postCtiMacResume` |  |
| `placetel_cti_start_conference` | POST | `/cti/{mac}/start_conference` | R0 D0 I0 O1 |  | `postCtiMacStartConference` |  |
| `placetel_cti_start_transfer` | POST | `/cti/{mac}/start_transfer` | R0 D0 I0 O1 |  | `postCtiMacStartTransfer` |  |
| `placetel_cti_send_dtmf_digits` | POST | `/cti/{mac}/send_dtmf_digits` | R0 D0 I0 O1 |  | `postCtiMacSendDtmfDigits` |  |
| `placetel_get_cti_config` | GET | `/cti/{mac}` | R1 D0 I1 O1 |  |  |  |
| `placetel_set_cti_config` | PUT | `/cti/{mac}` | R0 D0 I1 O1 |  | `putCtiMac` |  |

### Devices (1)

| Tool | Method | Path | Annotations (R/D/I/O) | Destructive | Body-Schema | Paginated |
|---|---|---|---|:--:|---|:--:|
| `placetel_list_devices` | GET | `/devices` | R1 D0 I1 O1 |  |  | yes |

### Faxes (4)

| Tool | Method | Path | Annotations (R/D/I/O) | Destructive | Body-Schema | Paginated |
|---|---|---|---|:--:|---|:--:|
| `placetel_list_faxes` | GET | `/faxes` | R1 D0 I1 O1 |  |  | yes |
| `placetel_create_fax` | POST | `/faxes` | R0 D0 I0 O1 |  | `postFaxes` |  |
| `placetel_get_fax` | GET | `/faxes/{id}` | R1 D0 I1 O1 |  |  |  |
| `placetel_delete_fax` | DELETE | `/faxes/{id}` | R0 D1 I1 O1 | YES |  |  |

### Groups (5)

| Tool | Method | Path | Annotations (R/D/I/O) | Destructive | Body-Schema | Paginated |
|---|---|---|---|:--:|---|:--:|
| `placetel_list_groups` | GET | `/groups` | R1 D0 I1 O1 |  |  | yes |
| `placetel_create_group` | POST | `/groups` | R0 D0 I0 O1 |  | `postGroups` |  |
| `placetel_get_group` | GET | `/groups/{id}` | R1 D0 I1 O1 |  |  |  |
| `placetel_update_group` | PUT | `/groups/{id}` | R0 D0 I1 O1 |  | `putGroupsId` |  |
| `placetel_delete_group` | DELETE | `/groups/{id}` | R0 D1 I1 O1 | YES |  |  |

### Microsoft Teams (5)

| Tool | Method | Path | Annotations (R/D/I/O) | Destructive | Body-Schema | Paginated |
|---|---|---|---|:--:|---|:--:|
| `placetel_get_microsoft_teams_integration` | GET | `/microsoft_teams/integration` | R1 D0 I1 O1 |  |  |  |
| `placetel_import_microsoft_teams_user` | POST | `/microsoft_teams/users` | R0 D0 I0 O1 |  | `postMicrosoftTeamsUsers` |  |
| `placetel_list_microsoft_teams_users` | GET | `/microsoft_teams/users` | R1 D0 I1 O1 |  |  | yes |
| `placetel_sync_microsoft_teams_user` | PATCH | `/microsoft_teams/sync/{sip_user_id}` | R0 D0 I0 O1 |  |  |  |
| `placetel_disconnect_microsoft_teams_user` | DELETE | `/microsoft_teams/users/{sip_user_id}` | R0 D1 I1 O1 | YES |  |  |

### Numbers (8)

| Tool | Method | Path | Annotations (R/D/I/O) | Destructive | Body-Schema | Paginated |
|---|---|---|---|:--:|---|:--:|
| `placetel_list_number_profiles` | GET | `/numbers/{number_id}/profiles` | R1 D0 I1 O1 |  |  |  |
| `placetel_create_number_profile` | POST | `/numbers/{number_id}/profiles` | R0 D0 I0 O1 |  | `postNumbersNumberIdProfiles` |  |
| `placetel_activate_number_profile` | PUT | `/numbers/{number_id}/profiles` | R0 D0 I1 O1 |  | `putNumbersNumberIdProfiles` |  |
| `placetel_delete_number_profile` | DELETE | `/numbers/{number_id}/profiles/{id}` | R0 D1 I1 O1 | YES |  |  |
| `placetel_activate_number` | POST | `/numbers/{id}/activation` | R0 D0 I0 O1 |  |  |  |
| `placetel_deactivate_number` | DELETE | `/numbers/{id}/activation` | R0 D1 I1 O1 | YES |  |  |
| `placetel_list_numbers` | GET | `/numbers` | R1 D0 I1 O1 |  |  | yes |
| `placetel_get_number` | GET | `/numbers/{id}` | R1 D0 I1 O1 |  |  |  |

### Prompts (5)

| Tool | Method | Path | Annotations (R/D/I/O) | Destructive | Body-Schema | Paginated |
|---|---|---|---|:--:|---|:--:|
| `placetel_list_prompts` | GET | `/prompts` | R1 D0 I1 O1 |  |  | yes |
| `placetel_create_prompt` | POST | `/prompts` | R0 D0 I0 O1 |  | `postPrompts` |  |
| `placetel_get_prompt` | GET | `/prompts/{id}` | R1 D0 I1 O1 |  |  |  |
| `placetel_update_prompt` | PUT | `/prompts/{id}` | R0 D0 I1 O1 |  | `putPromptsId` |  |
| `placetel_delete_prompt` | DELETE | `/prompts/{id}` | R0 D1 I1 O1 | YES |  |  |

### Provisionings (9)

| Tool | Method | Path | Annotations (R/D/I/O) | Destructive | Body-Schema | Paginated |
|---|---|---|---|:--:|---|:--:|
| `placetel_list_provisionings` | GET | `/provisionings` | R1 D0 I1 O1 |  |  | yes |
| `placetel_create_provisioning` | POST | `/provisionings` | R0 D0 I0 O1 |  | `postProvisionings` |  |
| `placetel_get_provisioning` | GET | `/provisionings/{id}` | R1 D0 I1 O1 |  |  |  |
| `placetel_update_provisioning` | PUT | `/provisionings/{id}` | R0 D0 I1 O1 |  | `putProvisioningsId` |  |
| `placetel_delete_provisioning` | DELETE | `/provisionings/{id}` | R0 D1 I1 O1 | YES |  |  |
| `placetel_get_provisioning_custom_configurations` | GET | `/provisionings/{id}/custom_configurations` | R1 D0 I1 O1 |  |  |  |
| `placetel_upsert_provisioning_custom_configuration` | PUT | `/provisionings/{id}/custom_configurations` | R0 D0 I1 O1 |  | `putProvisioningsIdCustomConfigurations` |  |
| `placetel_delete_provisioning_custom_configuration` | DELETE | `/provisionings/{id}/custom_configurations/{custom_configuration_id}` | R0 D1 I1 O1 | YES |  |  |
| `placetel_reconfigure_provisioning` | POST | `/provisionings/{id}/reconfigure` | R0 D0 I0 O1 |  |  |  |

### Recordings (3)

| Tool | Method | Path | Annotations (R/D/I/O) | Destructive | Body-Schema | Paginated |
|---|---|---|---|:--:|---|:--:|
| `placetel_list_recordings` | GET | `/recordings` | R1 D0 I1 O1 |  |  | yes |
| `placetel_get_recording` | GET | `/recordings/{id}` | R1 D0 I1 O1 |  |  |  |
| `placetel_delete_recording` | DELETE | `/recordings/{id}` | R0 D1 I1 O1 | YES |  |  |

### Routing plans (6)

| Tool | Method | Path | Annotations (R/D/I/O) | Destructive | Body-Schema | Paginated |
|---|---|---|---|:--:|---|:--:|
| `placetel_list_routing_plans` | GET | `/routing_plans` | R1 D0 I1 O1 |  |  | yes |
| `placetel_create_routing_plan` | POST | `/routing_plans` | R0 D0 I0 O1 |  | `postRoutingPlans` |  |
| `placetel_get_routing_plan` | GET | `/routing_plans/{id}` | R1 D0 I1 O1 |  |  |  |
| `placetel_update_routing_plan` | PUT | `/routing_plans/{id}` | R0 D0 I1 O1 |  | `putRoutingPlansId` |  |
| `placetel_delete_routing_plan` | DELETE | `/routing_plans/{id}` | R0 D1 I1 O1 | YES |  |  |
| `placetel_simulate_routing_plan` | GET | `/routing_plans/{id}/simulate` | R1 D0 I1 O1 |  |  |  |

### Routing plan objects (1)

| Tool | Method | Path | Annotations (R/D/I/O) | Destructive | Body-Schema | Paginated |
|---|---|---|---|:--:|---|:--:|
| `placetel_list_routing_plan_routings` | GET | `/routing_plans/{id}/routings` | R1 D0 I1 O1 |  |  |  |

### Routings (5)

| Tool | Method | Path | Annotations (R/D/I/O) | Destructive | Body-Schema | Paginated |
|---|---|---|---|:--:|---|:--:|
| `placetel_list_routings` | GET | `/routings` | R1 D0 I1 O1 |  |  | yes |
| `placetel_create_routing` | POST | `/routings` | R0 D0 I0 O1 |  | `postRoutings` |  |
| `placetel_get_routing` | GET | `/routings/{number_or_id}` | R1 D0 I1 O1 |  |  |  |
| `placetel_update_routing` | PUT | `/routings/{number_or_id}` | R0 D0 I1 O1 |  | `putRoutingsNumberOrId` |  |
| `placetel_delete_routing` | DELETE | `/routings/{number_or_id}` | R0 D1 I1 O1 | YES |  |  |

### Sip Users (8)

| Tool | Method | Path | Annotations (R/D/I/O) | Destructive | Body-Schema | Paginated |
|---|---|---|---|:--:|---|:--:|
| `placetel_list_sip_user_short_codes` | GET | `/sip_users/{id}/short_codes` | R1 D0 I1 O1 |  |  |  |
| `placetel_create_sip_user_short_code` | POST | `/sip_users/{id}/short_codes` | R0 D0 I0 O1 |  | `postSipUsersIdShortCodes` |  |
| `placetel_delete_sip_user_short_code` | DELETE | `/sip_users/{id}/short_codes/{code_id}` | R0 D1 I1 O1 | YES |  |  |
| `placetel_list_sip_users` | GET | `/sip_users` | R1 D0 I1 O1 |  |  | yes |
| `placetel_create_sip_user` | POST | `/sip_users` | R0 D0 I0 O1 |  | `postSipUsers` |  |
| `placetel_get_sip_user` | GET | `/sip_users/{id}` | R1 D0 I1 O1 |  |  |  |
| `placetel_update_sip_user` | PUT | `/sip_users/{id}` | R0 D0 I1 O1 |  | `putSipUsersId` |  |
| `placetel_delete_sip_user` | DELETE | `/sip_users/{id}` | R0 D1 I1 O1 | YES |  |  |

### SIM Cards (2)

| Tool | Method | Path | Annotations (R/D/I/O) | Destructive | Body-Schema | Paginated |
|---|---|---|---|:--:|---|:--:|
| `placetel_list_sim_cards` | GET | `/sim_cards` | R1 D0 I1 O1 |  |  | yes |
| `placetel_get_sim_card` | GET | `/sim_cards/{id}` | R1 D0 I1 O1 |  |  |  |

### Sites (2)

| Tool | Method | Path | Annotations (R/D/I/O) | Destructive | Body-Schema | Paginated |
|---|---|---|---|:--:|---|:--:|
| `placetel_list_sites` | GET | `/sites` | R1 D0 I1 O1 |  |  | yes |
| `placetel_get_site` | GET | `/sites/{id}` | R1 D0 I1 O1 |  |  |  |

### SMS (1)

| Tool | Method | Path | Annotations (R/D/I/O) | Destructive | Body-Schema | Paginated |
|---|---|---|---|:--:|---|:--:|
| `placetel_send_sms` | POST | `/sms` | R0 D0 I0 O1 |  | `postSms` |  |

### Subscriptions (3)

| Tool | Method | Path | Annotations (R/D/I/O) | Destructive | Body-Schema | Paginated |
|---|---|---|---|:--:|---|:--:|
| `placetel_list_subscriptions` | GET | `/subscriptions` | R1 D0 I1 O1 |  |  |  |
| `placetel_add_subscription` | PUT | `/subscriptions` | R0 D0 I1 O1 |  | `putSubscriptions` |  |
| `placetel_delete_subscription` | DELETE | `/subscriptions/{id}` | R0 D1 I1 O1 | YES |  |  |

### Webex (14)

| Tool | Method | Path | Annotations (R/D/I/O) | Destructive | Body-Schema | Paginated |
|---|---|---|---|:--:|---|:--:|
| `placetel_list_webex_users` | GET | `/webex/users` | R1 D0 I1 O1 |  |  | yes |
| `placetel_create_webex_user` | POST | `/webex/users` | R0 D0 I0 O1 |  | `postWebexUsers` |  |
| `placetel_get_webex_user_license` | GET | `/webex/users/{id}/license` | R1 D0 I1 O1 |  |  |  |
| `placetel_assign_webex_user_license` | POST | `/webex/users/{id}/license` | R0 D0 I0 O1 |  | `postWebexUsersIdLicense` |  |
| `placetel_update_webex_user_license` | PATCH | `/webex/users/{id}/license` | R0 D0 I0 O1 |  | `patchWebexUsersIdLicense` |  |
| `placetel_get_webex_user_numbers` | GET | `/webex/users/{id}/numbers` | R1 D0 I1 O1 |  |  | yes |
| `placetel_update_webex_user_numbers` | PATCH | `/webex/users/{id}/numbers` | R0 D0 I0 O1 |  | `patchWebexUsersIdNumbers` |  |
| `placetel_delete_webex_user` | DELETE | `/webex/users/{id}` | R0 D1 I1 O1 | YES |  |  |
| `placetel_list_webex_workspaces` | GET | `/webex/workspaces` | R1 D0 I1 O1 |  |  |  |
| `placetel_create_webex_workspace` | POST | `/webex/workspaces` | R0 D0 I0 O1 |  | `postWebexWorkspaces` |  |
| `placetel_get_webex_workspace` | GET | `/webex/workspaces/{id}` | R1 D0 I1 O1 |  |  |  |
| `placetel_get_webex_number_fax_settings` | GET | `/webex/numbers/{number_or_id}/fax_settings` | R1 D0 I1 O1 |  |  |  |
| `placetel_configure_webex_number_fax_settings` | PUT | `/webex/numbers/{number_or_id}/fax_settings` | R0 D0 I1 O1 |  | `putWebexNumbersNumberOrIdFaxSettings` |  |
| `placetel_remove_webex_number_fax_settings` | DELETE | `/webex/numbers/{number_or_id}/fax_settings` | R0 D1 I1 O1 | YES |  |  |

### Users (8)

| Tool | Method | Path | Annotations (R/D/I/O) | Destructive | Body-Schema | Paginated |
|---|---|---|---|:--:|---|:--:|
| `placetel_list_users` | GET | `/users` | R1 D0 I1 O1 |  |  | yes |
| `placetel_create_user` | POST | `/users` | R0 D0 I0 O1 |  | `postUsers` |  |
| `placetel_get_user` | GET | `/users/{id}` | R1 D0 I1 O1 |  |  |  |
| `placetel_update_user` | PUT | `/users/{id}` | R0 D0 I1 O1 |  | `putUsersId` |  |
| `placetel_delete_user` | DELETE | `/users/{id}` | R0 D1 I1 O1 | YES |  |  |
| `placetel_reset_user_password` | POST | `/users/{id}/password_reset` | R0 D0 I0 O1 |  |  |  |
| `placetel_reset_user_two_factor_authentication` | DELETE | `/users/{id}/two_factor_authentication` | R0 D1 I1 O1 | YES |  |  |
| `placetel_get_me` | GET | `/me` | R1 D0 I1 O1 |  |  |  |

## 6. Test-Strategie (im Testaccount, sicher)

1. **Testaccount-Guard zuerst:** vor JEDEM Write/Delete `placetel_get_me` aufrufen und Account-Identitaet (id, name, company, email) in den Chat schreiben.
2. **Read-only Smoke:** `placetel_get_me`, `placetel_list_contacts`, `placetel_list_numbers`, `placetel_list_sip_users` -> HTTP 200 + gekuerzte Antworten zeigen.
3. **Sicherer Write-Roundtrip:** `placetel_create_contact` (Wegwerf-Kontakt „MCP Test <ts>") -> `placetel_get_contact` -> `placetel_delete_contact`. Nur selbst angelegte Objekte werden geloescht.
4. **Destruktive Tools** (20 DELETE + Deaktivierungen) werden implementiert, aber **NICHT** gegen Fremd-/Bestandsdaten getestet — nur der Contact-Roundtrip als Nachweis, dass der DELETE-Pfad funktioniert.
5. **Build-Gate:** `npm run build` (Exit 0) + `scripts/smoke.mjs` (druckt Tool-Anzahl == 124).

## 7. Eval-Plan (mcp-builder Phase 4)

`evaluation.xml` mit **10 QA-Paaren**, jede Frage: **unabhaengig**, **read-only** (nur GET-Tools), **complex** (mehrere Tool-Calls/Exploration), **realistisch**, **verifizierbar** (eindeutige String-Antwort), **stabil** (aendert sich nicht ueber Zeit). Beispiele: „Wie viele SIP-User hat der Account?", „Welche Plattform nutzt der Account laut /me?", „Wie viele Rufnummern sind aktiv?". Antworten werden vor dem Festschreiben real gegen den Testaccount verifiziert.

## 8. Build- & Verifikations-Reihenfolge

1. Scaffold (config + `.gitignore` + `.env` aus Test-Key) → 2. Shared-Infra → 3. 22 Tool-Module (alle 124 Tools) → 4. `index.ts`-Registrierung → 5. `npm install` + `npm run build` (Exit 0) → 6. `smoke.mjs` (124 Tools) → 7. Live-Tests (Guard, Smoke, Roundtrip) → 8. `evaluation.xml` + `README.md` → 9. Sicherheits-Checks (`git grep`/`git status`) → 10. Abschluss-Summary.

## 9. Risiken / offene Punkte

- **Bare-Array-Responses** ohne `total`: `has_more` ist heuristisch (kein exaktes Total). Dokumentiert im Tool-Description.
- **CTI-Tools** erfordern reale Endgeraete (MAC) — im Testaccount ggf. nicht smoke-testbar; werden implementiert, aber nur strukturell (Build) verifiziert.
- **Webex/Teams/SIM** erfordern ggf. gebuchte Zusatzprodukte — Tools vorhanden, Live-Test abhaengig von Account-Ausstattung.
- **`per_page` nicht ueberall** honoriert — Pagination-Helfer toleriert fehlende Wirkung.
- 124 Tools nahe am ~128-Client-Softlimit — falls ein Client ablehnt, ist CTI-Konsolidierung (13 Aktionen → 1 Tool `placetel_cti_control`) der dokumentierte Fallback.
