#!/usr/bin/env node
/**
 * Builds test/fixtures/placetel-contract.json from the public Placetel Swagger 2.0 spec.
 *
 * The contract keeps only the interface facts the offline tests need: every operation
 * (method + path) with its path, query and body parameters (name, in, required, type).
 * No descriptions, no full spec. Output is sorted and formatted so that the same spec
 * always yields the same file; only `source.retrieved` changes between runs.
 *
 * Usage:
 *   node scripts/build-contract.mjs                      fetch the spec and write the contract
 *   node scripts/build-contract.mjs --spec-file <file>   use a previously downloaded copy instead
 *   node scripts/build-contract.mjs --save-spec <file>   additionally save the raw spec bytes
 *   node scripts/build-contract.mjs --out <file>         write the contract elsewhere
 *
 * Not part of `npm test` or CI: the tests only read the committed contract.
 * Requires Node >= 18 (global fetch), no dependencies.
 */
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const SPEC_URL = "https://api.placetel.de/v2/swagger_doc.json";
const METHODS = ["get", "post", "put", "patch", "delete"];
const IN_ORDER = ["path", "query", "body", "header"];

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function parseArgs(argv) {
  const opts = { out: resolve(root, "test/fixtures/placetel-contract.json") };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = () => {
      const value = argv[i + 1];
      if (!value) throw new Error(`${arg} needs a value`);
      i += 1;
      return value;
    };
    if (arg === "--spec-file") opts.specFile = resolve(next());
    else if (arg === "--save-spec") opts.saveSpec = resolve(next());
    else if (arg === "--out") opts.out = resolve(next());
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return opts;
}

async function loadSpecBytes(opts) {
  if (opts.specFile) return readFileSync(opts.specFile);
  const response = await fetch(SPEC_URL, { headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error(`GET ${SPEC_URL} -> HTTP ${response.status}`);
  return Buffer.from(await response.arrayBuffer());
}

function resolveRef(spec, schema, seen = new Set()) {
  if (!schema || typeof schema !== "object") return schema;
  if (schema.$ref) {
    if (seen.has(schema.$ref)) return {};
    seen.add(schema.$ref);
    const match = /^#\/definitions\/(.+)$/.exec(schema.$ref);
    if (!match || !spec.definitions?.[match[1]]) throw new Error(`Unresolvable $ref ${schema.$ref}`);
    return resolveRef(spec, spec.definitions[match[1]], seen);
  }
  if (Array.isArray(schema.allOf)) {
    const merged = { type: "object", properties: {}, required: [] };
    for (const part of schema.allOf) {
      const resolved = resolveRef(spec, part, seen);
      Object.assign(merged.properties, resolved.properties ?? {});
      merged.required.push(...(resolved.required ?? []));
    }
    return merged;
  }
  return schema;
}

function typeOf(spec, item) {
  if (item.type) return item.type;
  const schema = item.schema ? resolveRef(spec, item.schema) : undefined;
  if (schema?.type) return schema.type;
  if (schema?.properties || item.$ref || item.schema?.$ref) return "object";
  return "string";
}

function param(name, location, required, type) {
  return { name, in: location, required: Boolean(required), type };
}

function operationParameters(spec, pathItem, operation) {
  const merged = new Map();
  for (const raw of [...(pathItem.parameters ?? []), ...(operation.parameters ?? [])]) {
    const p = raw.$ref ? resolveRef(spec, raw) : raw;
    merged.set(`${p.in}:${p.name}`, p);
  }
  const out = [];
  for (const p of merged.values()) {
    if (p.in === "body") {
      const schema = resolveRef(spec, p.schema ?? {});
      if (schema && schema.properties) {
        const required = new Set(schema.required ?? []);
        for (const [name, prop] of Object.entries(schema.properties)) {
          out.push(param(name, "body", required.has(name), typeOf(spec, prop)));
        }
      } else {
        out.push(param(p.name, "body", p.required, typeOf(spec, p)));
      }
    } else if (p.in === "formData") {
      // Placetel accepts form fields as JSON body fields; the client always sends JSON.
      out.push(param(p.name, "body", p.required, typeOf(spec, p)));
    } else {
      out.push(param(p.name, p.in, p.in === "path" ? true : p.required, typeOf(spec, p)));
    }
  }
  const order = (location) => {
    const index = IN_ORDER.indexOf(location);
    return index === -1 ? IN_ORDER.length : index;
  };
  return out.sort((a, b) => order(a.in) - order(b.in) || (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
}

function buildContract(spec, bytes) {
  if (spec.swagger !== "2.0") throw new Error(`Expected a Swagger 2.0 document, got swagger=${spec.swagger}`);
  const operations = [];
  for (const [path, pathItem] of Object.entries(spec.paths ?? {})) {
    for (const method of METHODS) {
      const operation = pathItem[method];
      if (!operation) continue;
      operations.push({
        method: method.toUpperCase(),
        path,
        parameters: operationParameters(spec, pathItem, operation),
      });
    }
  }
  operations.sort(
    (a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0) || METHODS.indexOf(a.method.toLowerCase()) - METHODS.indexOf(b.method.toLowerCase()),
  );
  return {
    source: {
      url: SPEC_URL,
      sha256: createHash("sha256").update(bytes).digest("hex"),
      retrieved: new Date().toISOString().slice(0, 10),
    },
    basePath: spec.basePath ?? "",
    operations,
  };
}

const opts = parseArgs(process.argv.slice(2));
const bytes = await loadSpecBytes(opts);
if (opts.saveSpec) {
  mkdirSync(dirname(opts.saveSpec), { recursive: true });
  writeFileSync(opts.saveSpec, bytes);
}
const contract = buildContract(JSON.parse(bytes.toString("utf8")), bytes);
mkdirSync(dirname(opts.out), { recursive: true });
writeFileSync(opts.out, `${JSON.stringify(contract, null, 2)}\n`);
console.log(`CONTRACT_OPERATIONS=${contract.operations.length}`);
console.log(`CONTRACT_SHA256=${contract.source.sha256}`);
