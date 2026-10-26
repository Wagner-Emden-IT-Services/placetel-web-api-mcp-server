#!/usr/bin/env node
/**
 * Builds the offline API contract used by the test suite.
 * Fetches the public Placetel Swagger spec (no API key needed) and writes the interface facts the
 * tests check against to test/fixtures/placetel-contract.json: base URL, every operation (method,
 * path, response shape) and its path/query/body parameters (name, location, required, type).
 * Descriptions are left out; the full spec is not checked in.
 *
 * Not part of `npm test` or CI — run manually to refresh the contract: node scripts/build-contract.mjs
 */
import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const SPEC_URL = "https://api.placetel.de/v2/swagger_doc.json";
const OUT_FILE = fileURLToPath(new URL("../test/fixtures/placetel-contract.json", import.meta.url));
const HTTP_METHODS = ["get", "post", "put", "patch", "delete"];
const LOCATION_ORDER = ["path", "query", "header", "formData", "body"];

/** Plain code-unit order, independent of locale/ICU, so the output is stable everywhere. */
const byString = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

function definitionOf(spec, schema) {
  if (!schema) return {};
  if (!schema.$ref) return schema;
  return spec.definitions?.[schema.$ref.replace("#/definitions/", "")] ?? {};
}

function typeOf(schema) {
  return schema.type ?? (schema.$ref || schema.properties ? "object" : "unknown");
}

/** Flattens Swagger parameters; a body parameter becomes one entry per top-level property of its schema. */
function parametersOf(spec, rawParams) {
  const out = [];
  for (const p of rawParams) {
    if (p.in === "body") {
      const def = definitionOf(spec, p.schema);
      const required = new Set(def.required ?? []);
      for (const [name, prop] of Object.entries(def.properties ?? {})) {
        out.push({ name, in: "body", required: required.has(name), type: typeOf(prop) });
      }
    } else {
      out.push({ name: p.name, in: p.in, required: p.required === true, type: typeOf(p) });
    }
  }
  return out.sort(
    (a, b) => LOCATION_ORDER.indexOf(a.in) - LOCATION_ORDER.indexOf(b.in) || byString(a.name, b.name),
  );
}

/** Shape of the first 2xx response: "array", "object" or "none" (no response body documented). */
function responseOf(op) {
  const code = Object.keys(op.responses ?? {})
    .filter((c) => /^2\d\d$/.test(c))
    .sort()[0];
  const schema = code ? op.responses[code].schema : undefined;
  if (!schema) return "none";
  return schema.type === "array" ? "array" : "object";
}

const res = await fetch(SPEC_URL);
if (!res.ok) throw new Error(`Fetching ${SPEC_URL} failed: HTTP ${res.status}`);
const bytes = Buffer.from(await res.arrayBuffer());
const spec = JSON.parse(bytes.toString("utf8"));

const operations = [];
for (const [path, item] of Object.entries(spec.paths ?? {})) {
  for (const method of HTTP_METHODS) {
    const op = item[method];
    if (!op) continue;
    operations.push({
      method: method.toUpperCase(),
      path,
      response: responseOf(op),
      parameters: parametersOf(spec, [...(item.parameters ?? []), ...(op.parameters ?? [])]),
    });
  }
}
operations.sort((a, b) => byString(a.path, b.path) || byString(a.method, b.method));

const contract = {
  source: {
    url: SPEC_URL,
    sha256: createHash("sha256").update(bytes).digest("hex"),
    fetched_at: new Date().toISOString(),
  },
  base_url: `${(spec.schemes ?? ["https"])[0]}://${spec.host}${spec.basePath ?? ""}`,
  operations,
};

mkdirSync(fileURLToPath(new URL("../test/fixtures/", import.meta.url)), { recursive: true });
writeFileSync(OUT_FILE, JSON.stringify(contract, null, 2) + "\n");
console.log(`Wrote ${operations.length} operations (sha256 ${contract.source.sha256}) to test/fixtures/placetel-contract.json`);
