/**
 * Contract tests for every registered tool.
 *
 * Each tool is called through a real MCP client (in-memory transport). The HTTP request it
 * produces is intercepted on the axios level and checked against the contract generated from
 * the public Placetel spec (test/fixtures/placetel-contract.json): method, path with the
 * substituted path parameters, names and location of every query and body field sent, and
 * every required spec field must be reachable through the tool's arguments. Responses must
 * come back without error for response_format "json" and "markdown", and the annotations
 * must match the HTTP method (matrix in docs/BUILD-PLAN.md, section 4).
 */
import "./helpers/env.mjs";
import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { after, describe, it } from "node:test";
import { API_BASE_URL } from "../dist/constants.js";
import { recordedRequests, resetMock, respondWith } from "./helpers/axios-mock.mjs";
import { connectClient, resultText } from "./helpers/mcp.mjs";

const readJson = (relative) => JSON.parse(readFileSync(new URL(relative, import.meta.url), "utf8"));

const contract = readJson("./fixtures/placetel-contract.json");
/** Expected operation per tool, taken from the tool inventory in docs/BUILD-PLAN.md. */
const expectedEndpoints = readJson("./fixtures/tool-endpoints.json");
const exceptions = readJson("./fixtures/uncovered-operations.json").operations.map((entry) => entry.operation);

const operations = new Map(contract.operations.map((op) => [`${op.method} ${op.path}`, op]));

/** Annotation matrix per HTTP method (docs/BUILD-PLAN.md, section 4). */
const ANNOTATIONS = {
  GET: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
  POST: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
  PUT: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true },
  PATCH: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
  DELETE: { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: true },
};

/** Distinct sample value for a JSON Schema property, so every value can be traced in the request. */
function sampleValue(schema, name, counter) {
  if (!schema || typeof schema !== "object") return `v-${name}`;
  if (schema.const !== undefined) return schema.const;
  if (Array.isArray(schema.enum) && schema.enum.length) return schema.enum[0];
  const variants = schema.anyOf ?? schema.oneOf;
  if (Array.isArray(variants)) return sampleValue(variants.find((s) => s.type !== "null") ?? variants[0], name, counter);
  const type = Array.isArray(schema.type) ? schema.type.find((t) => t !== "null") : schema.type;
  switch (type) {
    case "integer":
    case "number": {
      counter.n += 1;
      let value = 10 + counter.n;
      if (typeof schema.maximum === "number" && value > schema.maximum) value = schema.maximum;
      if (typeof schema.minimum === "number" && value < schema.minimum) value = schema.minimum;
      return value;
    }
    case "boolean":
      return true;
    case "array":
      return [sampleValue(schema.items, `${name}-item`, counter)];
    case "object": {
      const out = {};
      for (const [key, sub] of Object.entries(schema.properties ?? {})) out[key] = sampleValue(sub, `${name}-${key}`, counter);
      if (!Object.keys(out).length) {
        const valueSchema = typeof schema.additionalProperties === "object" ? schema.additionalProperties : { type: "string" };
        out.key = sampleValue(valueSchema, `${name}-key`, counter);
      }
      return out;
    }
    default:
      return `v-${name}`;
  }
}

/** Arguments for a call: every input property, or only the required ones. */
function buildArgs(tool, { requiredOnly, format }) {
  const properties = tool.inputSchema?.properties ?? {};
  const required = new Set(tool.inputSchema?.required ?? []);
  const counter = { n: 0 };
  const args = {};
  for (const [name, schema] of Object.entries(properties)) {
    if (name === "response_format") continue;
    const value = sampleValue(schema, name, counter);
    if (requiredOnly && !required.has(name)) continue;
    args[name] = value;
  }
  if (format && properties.response_format) args.response_format = format;
  return args;
}

function templateRegex(template) {
  const source = template
    .split(/(\{[^}]+\})/)
    .map((part) => (/^\{[^}]+\}$/.test(part) ? "([^/]+)" : part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")))
    .join("");
  return new RegExp(`^${source}$`);
}

const placeholders = (template) => [...template.matchAll(/\{([^}]+)\}/g)].map((m) => m[1]);
const sameValue = (a, b) => JSON.stringify(a) === JSON.stringify(b);

/** All deviations of one intercepted request from the contract operation. */
function checkRequest(request, op, args, { full }) {
  const problems = [];
  const label = `${op.method} ${op.path}`;
  if (request.method !== op.method) problems.push(`method ${request.method}, spec says ${op.method}`);
  if (typeof request.url !== "string" || !request.url.startsWith(API_BASE_URL)) {
    problems.push(`URL ${request.url} does not start with ${API_BASE_URL}`);
    return problems;
  }
  const used = new Set();
  const path = request.url.slice(API_BASE_URL.length);
  const match = templateRegex(op.path).exec(path);
  if (!match) {
    problems.push(`path ${path} does not match ${op.path}`);
  } else {
    placeholders(op.path).forEach((placeholder, index) => {
      const value = decodeURIComponent(match[index + 1]);
      const source = Object.entries(args).find(
        ([key, v]) => key !== "response_format" && (typeof v === "string" || typeof v === "number") && String(v) === value,
      );
      if (source) used.add(source[0]);
      else problems.push(`path parameter {${placeholder}} was filled with "${value}", which is no tool argument`);
    });
  }

  const specQuery = new Map(op.parameters.filter((p) => p.in === "query").map((p) => [p.name, p]));
  const specBody = new Map(op.parameters.filter((p) => p.in === "body").map((p) => [p.name, p]));
  const query = request.params ?? {};
  for (const key of Object.keys(query)) {
    if (!specQuery.has(key)) {
      problems.push(`query field "${key}" is not a query parameter of ${label}${specBody.has(key) ? " (the spec expects it in the body)" : ""}`);
    }
  }
  const body = request.body;
  if (body !== undefined && (body === null || typeof body !== "object" || Array.isArray(body))) {
    problems.push(`request body is not a JSON object: ${JSON.stringify(body)}`);
  } else if (body !== undefined) {
    for (const key of Object.keys(body)) {
      if (!specBody.has(key)) {
        problems.push(`body field "${key}" is not a body parameter of ${label}${specQuery.has(key) ? " (the spec expects it in the query)" : ""}`);
      }
    }
  }

  if (full) {
    for (const p of op.parameters) {
      if (!p.required) continue;
      if (p.in === "query" && !(p.name in query)) problems.push(`required query parameter "${p.name}" cannot be sent through the tool`);
      if (p.in === "body" && !(body && p.name in body)) problems.push(`required body field "${p.name}" cannot be sent through the tool`);
    }
    const sent = [...Object.values(query), ...Object.values(body ?? {})];
    for (const [key, value] of Object.entries(args)) {
      if (key === "response_format" || used.has(key)) continue;
      if (!sent.some((s) => sameValue(s, value))) problems.push(`argument "${key}" does not reach the request`);
    }
  }
  return problems;
}

function sampleResponse(request) {
  return request.method === "GET" ? [{ id: 1, name: "Example entry" }] : { id: 1, status: "ok" };
}

const { client, close } = await connectClient();
const { tools } = await client.listTools();
const passed = new Set();
const covered = new Set();

after(async () => {
  await close();
  const reportDir = process.env.PLACETEL_TEST_REPORT_DIR;
  if (reportDir) {
    const report = { registered: tools.length, passed: passed.size, uncovered: contract.operations.length - covered.size };
    writeFileSync(join(reportDir, "coverage.json"), JSON.stringify(report));
  }
});

describe("tool inventory", () => {
  it("registers exactly the tools of the inventory", () => {
    assert.deepEqual(
      tools.map((t) => t.name).sort(),
      Object.keys(expectedEndpoints).sort(),
    );
  });

  it("maps every tool to an operation of the contract", () => {
    const missing = Object.entries(expectedEndpoints).filter(([, endpoint]) => !operations.has(endpoint));
    assert.deepEqual(missing, []);
  });

  it("leaves only the documented exceptions without a tool", () => {
    const withTool = new Set(Object.values(expectedEndpoints));
    const uncovered = [...operations.keys()].filter((key) => !withTool.has(key)).sort();
    assert.deepEqual(uncovered, [...exceptions].sort());
    for (const exception of exceptions) assert.ok(operations.has(exception), `${exception} is not in the contract`);
  });
});

describe("tool requests match the Placetel contract", () => {
  for (const tool of [...tools].sort((a, b) => a.name.localeCompare(b.name))) {
    it(tool.name, async () => {
      const endpoint = expectedEndpoints[tool.name];
      assert.ok(endpoint, `${tool.name} has no expected endpoint`);
      const op = operations.get(endpoint);
      assert.ok(op, `${endpoint} is not in the contract`);

      const expectedHints = ANNOTATIONS[op.method];
      for (const [hint, value] of Object.entries(expectedHints)) {
        assert.equal(tool.annotations?.[hint], value, `${tool.name}: ${hint} must be ${value} for ${op.method}`);
      }

      const hasFormat = Boolean(tool.inputSchema?.properties?.response_format);
      const calls = hasFormat
        ? [
            { full: true, format: "json" },
            { full: true, format: "markdown" },
            { full: false },
          ]
        : [{ full: true }, { full: false }];

      for (const call of calls) {
        const label = `${tool.name} (${call.full ? "all arguments" : "required arguments only"}${call.format ? `, response_format ${call.format}` : ""})`;
        resetMock();
        respondWith((request) => ({ status: 200, data: sampleResponse(request) }));
        const args = buildArgs(tool, { requiredOnly: !call.full, format: call.format });
        const result = await client.callTool({ name: tool.name, arguments: args });
        const text = resultText(result);
        const requests = recordedRequests();
        resetMock();

        assert.ok(!result.isError, `${label}: tool returned an error: ${text}`);
        assert.equal(requests.length, 1, `${label}: expected exactly one HTTP request, got ${requests.length}`);
        assert.deepEqual(checkRequest(requests[0], op, args, call), [], `${label}: request does not match ${endpoint}`);
        assert.ok(text.trim().length > 0, `${label}: empty response text`);
        if (call.format === "json") {
          assert.doesNotThrow(() => JSON.parse(text), `${label}: response is not valid JSON`);
        }
        if (call.format === "markdown") {
          assert.match(text, /\*\*/, `${label}: response is not markdown`);
        }
      }

      passed.add(tool.name);
      covered.add(endpoint);
    });
  }
});
