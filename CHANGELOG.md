# Changelog

All notable changes to this project are documented here.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Offline test suite (`npm test`, built-in `node:test` runner, no new dependencies,
  no API key or network access): each of the 124 tools is called through a real
  MCP client (SDK in-memory transport) and its HTTP request is checked against the
  API contract — method, path, name and location of query and body fields,
  reachability of required parameters, `response_format` results and annotations.
  The run prints `TOOL_COVERAGE` and `SPEC_UNCOVERED`.
- Tests for the HTTP client (Bearer auth, HTTP 429 / `Retry-After` retry, path and
  query handling), the error texts, pagination and truncation at `CHARACTER_LIMIT`.
- API contract `test/fixtures/placetel-contract.json`, built from the public spec
  (https://api.placetel.de/v2/swagger_doc.json) by `scripts/build-contract.mjs`.
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
