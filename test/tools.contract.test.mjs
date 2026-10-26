/**
 * Contract test for every registered tool: each tool is called through a real MCP client and the
 * intercepted HTTP request is checked against the operation in test/fixtures/placetel-contract.json
 * (generated from the public Placetel spec by scripts/build-contract.mjs).
 *
 * Per tool:
 *  - one call with every argument set and one with only the required arguments: method, path with the
 *    path parameters filled in, name and location of every query and body field sent;
 *  - every required parameter of the spec is reachable through the tool (sent in the full call);
 *  - every tool argument lands in its own field: changing it changes exactly the path placeholder, query
 *    or body field of the same name (`filter_x` for `filter[x]`), and the new value arrives there;
 *  - the result comes back without error for response_format json and markdown;
 *  - the annotations match the HTTP method (matrix in docs/BUILD-PLAN.md, section 4).
 */
import "./helpers/env.mjs";
import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import { after, test } from "node:test";
import { installAxiosMock } from "./helpers/axios-mock.mjs";
import { connectClient, resultText } from "./helpers/mcp.mjs";
import { EXPECTED_DEVIATIONS, TOOL_OPERATIONS, UNCOVERED_OPERATIONS } from "./tool-operations.mjs";

const contract = JSON.parse(readFileSync(new URL("./fixtures/placetel-contract.json", import.meta.url), "utf8"));

/** Expected annotations per HTTP method; openWorldHint is true for every tool. */
const ANNOTATIONS = {
  GET: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
  POST: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
  PUT: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true },
  PATCH: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
  DELETE: { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: true },
};

const opKey = (op) => `${op.method} ${op.path}`;
const operations = new Map(contract.operations.map((op) => [opKey(op), op]));

const mock = installAxiosMock();
const { client, close } = await connectClient();
const { tools } = await client.listTools();
const coveredKeys = new Set(tools.map((t) => TOOL_OPERATIONS[t.name]).filter(Boolean).map(opKey));
const uncovered = contract.operations.filter((op) => !coveredKeys.has(opKey(op)));
const checked = new Set();

after(async () => {
  if (process.env.PLACETEL_TEST_SUMMARY) {
    const summary = { checked: checked.size, registered: tools.length, uncovered: uncovered.length };
    writeFileSync(process.env.PLACETEL_TEST_SUMMARY, JSON.stringify(summary));
  }
  await close();
  mock.restore();
});

test("every registered tool has its expected operation in the contract", () => {
  assert.deepEqual(tools.map((t) => t.name).sort(), Object.keys(TOOL_OPERATIONS).sort());
  const missing = Object.values(TOOL_OPERATIONS).map(opKey).filter((key) => !operations.has(key));
  assert.deepEqual(missing, [], "operations not in the contract");
  assert.equal(new Set(Object.values(TOOL_OPERATIONS).map(opKey)).size, Object.keys(TOOL_OPERATIONS).length);
});

test("contract operations without a tool are exactly the listed exceptions", () => {
  assert.deepEqual(uncovered.map(opKey).sort(), UNCOVERED_OPERATIONS.map(opKey).sort());
});

for (const tool of tools) {
  test(`${tool.name} matches the contract`, async () => {
    const expected = TOOL_OPERATIONS[tool.name];
    const op = expected && operations.get(opKey(expected));
    assert.ok(op, `no contract operation for ${tool.name}`);
    const problems = [...checkAnnotations(tool, op), ...(await checkRequests(tool, op)), ...(await checkResults(tool, op))];

    if (EXPECTED_DEVIATIONS[tool.name]) {
      // Known deviation: must still occur as listed, and the tool does not count as checked.
      assert.deepEqual(problems, EXPECTED_DEVIATIONS[tool.name]);
      return;
    }
    assert.deepEqual(problems, [], `${tool.name} deviates from ${opKey(op)}`);
    checked.add(tool.name);
  });
}

function checkAnnotations(tool, op) {
  return Object.entries(ANNOTATIONS[op.method])
    .filter(([hint, value]) => tool.annotations?.[hint] !== value)
    .map(([hint, value]) => `annotation ${hint} is ${tool.annotations?.[hint]}, expected ${value} for ${op.method}`);
}

/** Tool arguments other than response_format, each with a seed for distinct sample values. */
function argumentSpecs(tool) {
  const required = new Set(tool.inputSchema.required ?? []);
  return Object.entries(tool.inputSchema.properties ?? {})
    .filter(([name]) => name !== "response_format")
    .map(([name, schema], i) => ({ name, schema, required: required.has(name), seed: 1000 + 10 * i }));
}

/** A valid value for a JSON-schema property; variant 0 and 1 differ wherever the schema allows it. */
function sampleValue(schema, name, seed, variant) {
  if (schema.enum) return schema.enum[Math.min(variant, schema.enum.length - 1)];
  switch (schema.type) {
    case "integer":
    case "number": {
      // Variant 1 is the smallest allowed value (0 if unbounded), so a dropped 0 shows up too.
      const lowest = schema.minimum ?? 0;
      const highest = schema.maximum ?? Infinity;
      const value = variant === 0 ? Math.min(seed, highest) : lowest;
      return variant === 1 && value === Math.min(seed, highest) ? lowest + 1 : value;
    }
    case "boolean":
      return variant === 0;
    case "array":
      return [sampleValue(schema.items ?? {}, name, seed, variant)];
    case "object":
      return { [`${name}_key`]: `${name}-value-${variant}` };
    default:
      return `${name}-${variant === 0 ? "sample" : "changed"}`;
  }
}

function sampleArgs(specs) {
  return Object.fromEntries(specs.map((s) => [s.name, sampleValue(s.schema, s.name, s.seed, 0)]));
}

/** Arms a response shaped like the operation's documented response, calls the tool, returns result and requests. */
async function call(tool, op, args) {
  mock.reset();
  if (op.response === "array") mock.reply(200, [{ id: 1, name: "Sample A" }, { id: 2, name: "Sample B" }]);
  else if (op.response === "object") mock.reply(200, { id: 1, name: "Sample" });
  else mock.reply(204, "");
  try {
    const result = await client.callTool({ name: tool.name, arguments: args });
    return { result, requests: [...mock.requests] };
  } catch (error) {
    return { result: { isError: true, content: [{ type: "text", text: String(error) }] }, requests: [...mock.requests] };
  }
}

/** The single request of a call, or the problems that prevent checking it. */
function singleRequest(res, label, problems) {
  if (res.result.isError) problems.push(`${label}: tool returned an error: ${resultText(res.result)}`);
  if (res.requests.length !== 1) {
    problems.push(`${label}: expected exactly 1 request, got ${res.requests.length}`);
    return undefined;
  }
  return res.requests[0];
}

async function checkRequests(tool, op) {
  const problems = [];
  const specs = argumentSpecs(tool);
  const fullArgs = sampleArgs(specs);
  const requiredArgs = sampleArgs(specs.filter((s) => s.required));

  const full = singleRequest(await call(tool, op, fullArgs), "all arguments", problems);
  if (full) {
    problems.push(...requestProblems(op, full, fullArgs).map((p) => `all arguments: ${p}`));
    problems.push(...unreachableRequired(op, full));
  }
  const minimal = singleRequest(await call(tool, op, requiredArgs), "required arguments", problems);
  if (minimal) problems.push(...requestProblems(op, minimal, requiredArgs).map((p) => `required arguments: ${p}`));
  if (!full) return problems;

  for (const spec of specs) {
    const args = { ...fullArgs, [spec.name]: sampleValue(spec.schema, spec.name, spec.seed, 1) };
    const leftOut = JSON.stringify(args[spec.name]) === JSON.stringify(fullArgs[spec.name]);
    if (leftOut) {
      if (spec.required) continue; // required single-value enum: nothing to vary
      delete args[spec.name];
    }
    const label = `argument ${spec.name} ${leftOut ? "left out" : "changed"}`;
    const changed = singleRequest(await call(tool, op, args), label, problems);
    if (!changed) continue;
    problems.push(...requestProblems(op, changed, args).map((p) => `${label}: ${p}`));
    problems.push(...fieldProblems(op, spec.name, full, changed, leftOut ? undefined : args[spec.name]));
  }
  return problems;
}

/** Fields of a request: path placeholders, query parameters (spec names) and top-level body keys, as wire strings. */
function requestFields(op, req) {
  const fields = new Map();
  const segments = (req.url.origin + req.url.pathname).slice(contract.base_url.length).split("/");
  op.path.split("/").forEach((segment, i) => {
    if (segment.startsWith("{")) fields.set(`path ${segment.slice(1, -1)}`, decodeURIComponent(segments[i] ?? ""));
  });
  for (const wireName of new Set(req.url.searchParams.keys())) {
    fields.set(`query ${queryParamName(op, wireName)}`, req.url.searchParams.getAll(wireName).join(","));
  }
  if (req.body && typeof req.body === "object") {
    for (const [key, value] of Object.entries(req.body)) fields.set(`body ${key}`, JSON.stringify(value));
  }
  return fields;
}

/** Fields a tool argument may fill: its own name, or `prefix[rest]` for an argument `prefix_rest` (filter_x -> filter[x]). */
function ownFields(name) {
  const prefixed = /^([a-z]+)_(.+)$/.exec(name);
  const names = prefixed ? [name, `${prefixed[1]}[${prefixed[2]}]`] : [name];
  return names.flatMap((n) => [`path ${n}`, `query ${n}`, `body ${n}`]);
}

/** Changing one argument may change only its own field, and the new value must arrive there unchanged. */
function fieldProblems(op, name, fullReq, changedReq, newValue) {
  const before = requestFields(op, fullReq);
  const after = requestFields(op, changedReq);
  const changed = [...new Set([...before.keys(), ...after.keys()])].filter((key) => before.get(key) !== after.get(key));
  if (!changed.length) return [`argument ${name} does not reach the request`];
  const foreign = changed.filter((key) => !ownFields(name).includes(key));
  if (foreign.length) return [`argument ${name} lands in ${foreign.join(", ")}`];
  if (newValue === undefined) return [];
  return changed
    .filter((key) => after.get(key) !== wireValue(key, newValue))
    .map((key) => `argument ${name} sends ${after.get(key) ?? "nothing"} in ${key}, expected ${wireValue(key, newValue)}`);
}

function wireValue(field, value) {
  if (field.startsWith("body ")) return JSON.stringify(value);
  return Array.isArray(value) ? value.map(String).join(",") : String(value);
}

function findParam(op, location, name) {
  return op.parameters.find((p) => p.in === location && p.name === name);
}

function misplaced(op, location, name) {
  const elsewhere = op.parameters.find((p) => p.name === name && p.in !== location);
  return elsewhere ? `belongs in ${elsewhere.in}, not ${location}` : `is not in the spec of ${opKey(op)}`;
}

/** Wire name of a query field without the `[]` suffix axios adds to arrays, if the spec defines it as array. */
function queryParamName(op, wireName) {
  const bare = wireName.endsWith("[]") ? wireName.slice(0, -2) : undefined;
  return bare !== undefined && findParam(op, "query", bare)?.type === "array" ? bare : wireName;
}

function requestProblems(op, req, args) {
  const problems = [];
  if (req.method !== op.method) problems.push(`method ${req.method}, expected ${op.method}`);

  const href = req.url.origin + req.url.pathname;
  if (!href.startsWith(`${contract.base_url}/`)) return [...problems, `URL ${href} is outside ${contract.base_url}`];
  const path = href.slice(contract.base_url.length);
  const actual = path.split("/").map((s) => decodeURIComponent(s));
  const template = op.path.split("/");
  const literalOk = actual.length === template.length && template.every((s, i) => s.startsWith("{") || s === actual[i]);
  if (!literalOk) problems.push(`path ${path} does not match ${op.path}`);
  else {
    template.forEach((segment, i) => {
      if (!segment.startsWith("{")) return;
      const name = segment.slice(1, -1);
      if (!(name in args)) problems.push(`path parameter {${name}} has no tool argument of the same name`);
      else if (String(args[name]) !== actual[i]) problems.push(`path parameter {${name}} is "${actual[i]}", not argument ${name}`);
    });
  }

  for (const wireName of new Set(req.url.searchParams.keys())) {
    const name = queryParamName(op, wireName);
    if (!findParam(op, "query", name)) problems.push(`query parameter "${wireName}" ${misplaced(op, "query", name)}`);
  }

  if (req.body !== undefined) {
    if (req.body === null || typeof req.body !== "object" || Array.isArray(req.body)) problems.push("body is not a JSON object");
    else {
      for (const key of Object.keys(req.body)) {
        if (!findParam(op, "body", key)) problems.push(`body field "${key}" ${misplaced(op, "body", key)}`);
      }
    }
  }
  return problems;
}

/** Required spec parameters missing from the request made with every tool argument set. */
function unreachableRequired(op, req) {
  const sentQuery = new Set([...req.url.searchParams.keys()].map((k) => queryParamName(op, k)));
  const sentBody = req.body && typeof req.body === "object" ? req.body : {};
  return op.parameters
    .filter((p) => p.required)
    .filter((p) => (p.in === "query" && !sentQuery.has(p.name)) || (p.in === "body" && !Object.hasOwn(sentBody, p.name)))
    .map((p) => `required ${p.in} parameter "${p.name}" cannot be sent through the tool`);
}

/** The tool result must come back without error in every response_format and carry the API data. */
async function checkResults(tool, op) {
  const problems = [];
  const args = sampleArgs(argumentSpecs(tool));
  const formats = tool.inputSchema.properties?.response_format ? ["json", "markdown"] : [undefined];
  for (const format of formats) {
    const label = format ? `response_format ${format}` : "result";
    const res = await call(tool, op, format ? { ...args, response_format: format } : args);
    const text = resultText(res.result);
    if (res.result.isError || typeof text !== "string") {
      problems.push(`${label}: no successful text result (${text})`);
      continue;
    }
    if (format === "json") {
      try {
        JSON.parse(text);
      } catch {
        problems.push(`${label}: result is not valid JSON`);
      }
    }
    if (format && op.response !== "none" && !text.includes("Sample")) problems.push(`${label}: result does not contain the API response`);
  }
  return problems;
}
