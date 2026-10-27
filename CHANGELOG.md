# Changelog

All notable changes to this project are documented here.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Offline test suite (`npm test`, Node's built-in test runner, no new dependencies):
  every one of the 124 tools is called through a real MCP client over the in-memory
  transport and its HTTP request is checked against the Placetel API contract —
  method, path with path parameters, query and body field names and location,
  reachability of required fields, `response_format` `json` and `markdown`, and
  annotations per HTTP method. Requests are intercepted on the axios level; no
  network access and no API key are needed.
- Tests for the shared client (Bearer header, HTTP 429 retry with `Retry-After`,
  path parameters, empty query values), error texts, pagination and truncation
  at `CHARACTER_LIMIT`.
- API contract `test/fixtures/placetel-contract.json` and its generator
  `scripts/build-contract.mjs`, built from the public spec
  `https://api.placetel.de/v2/swagger_doc.json`.
- CI runs `npm test` after the build on Node 18, 20 and 22.

## [1.0.1] - 2026-07-23

### Changed
- Re-publish to npm via OIDC Trusted Publishing so the release carries build
  provenance and is attributed to the GitHub Actions publisher. No functional
  or API changes.

## [1.0.0] - 2026-07-17

### Added
- Initial release: full coverage of the Placetel Web API v2 as **124 MCP tools**
  across 24 domains (AI, Call Center, Calls, Contacts, CTI, Devices, Faxes, Groups,
  Microsoft Teams, Numbers, Prompts, Provisionings, Recordings, Routing plans,
  Routings, SIP Users, SIM Cards, Sites, SMS, Subscriptions, Users, Webex, ...).
- Shared axios client with Bearer auth and automatic HTTP 429 / `Retry-After` retry.
- Zod input validation on every tool; per-tool annotations
  (`readOnlyHint` / `destructiveHint` / `idempotentHint` / `openWorldHint`).
- `response_format` (`markdown` | `json`) and pagination helpers.
- stdio transport for local use with Claude Desktop / Claude Code.
- Smoke script (`scripts/smoke.mjs`) and example evaluation set (`evaluation.xml`).
