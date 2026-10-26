#!/usr/bin/env node
/**
 * Entry point of `npm test`, the same on every platform, Node version (18/20/22) and reporter.
 * Lists test/*.test.mjs itself, runs them with the built-in runner (`node --test <files>`) and then prints
 * the coverage counters reported by the contract test exactly once:
 *   TOOL_COVERAGE=<checked>/<registered>   tools whose request passed the contract check / tools from listTools
 *   SPEC_UNCOVERED=<n>                     contract operations without a tool
 * Exits non-zero if a test fails or if either counter does not appear exactly once in the collected output.
 * Needs the node:test hooks (Node 18.8 or newer).
 */
import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const [major, minor] = process.versions.node.split(".").map(Number);
if (major < 18 || (major === 18 && minor < 8)) {
  console.error(`The test suite needs Node 18.8 or newer (node:test hooks), found ${process.versions.node}.`);
  process.exit(1);
}

// Relative paths from the project root, so `node --test` (which treats arguments as globs from Node 21)
// never sees special characters of the checkout path.
const projectRoot = fileURLToPath(new URL("..", import.meta.url));
const files = readdirSync(join(projectRoot, "test"))
  .filter((f) => f.endsWith(".test.mjs"))
  .sort()
  .map((f) => `test/${f}`);

const summaryDir = mkdtempSync(join(tmpdir(), "placetel-tests-"));
const summaryFile = join(summaryDir, "summary.json");
let collected = "";

const exitCode = await new Promise((resolve) => {
  const child = spawn(process.execPath, ["--test", ...files], {
    cwd: projectRoot,
    env: { ...process.env, PLACETEL_TEST_SUMMARY: summaryFile },
    stdio: ["ignore", "pipe", "pipe"],
  });
  child.stdout.on("data", (chunk) => {
    collected += chunk;
    process.stdout.write(chunk);
  });
  child.stderr.on("data", (chunk) => {
    collected += chunk;
    process.stderr.write(chunk);
  });
  child.on("error", (error) => {
    console.error(`Could not start the test runner: ${error.message}`);
    resolve(1);
  });
  child.on("close", (code, signal) => resolve(code ?? (signal ? 1 : 0)));
});

let lines = [];
if (existsSync(summaryFile)) {
  const summary = JSON.parse(readFileSync(summaryFile, "utf8"));
  lines = [`TOOL_COVERAGE=${summary.checked}/${summary.registered}`, `SPEC_UNCOVERED=${summary.uncovered}`];
}
rmSync(summaryDir, { recursive: true, force: true });
for (const line of lines) console.log(line);
collected += lines.map((l) => `${l}\n`).join("");

let failed = exitCode !== 0;
for (const [label, pattern] of [
  ["TOOL_COVERAGE=<n>/<m>", /TOOL_COVERAGE=\d+\/\d+/g],
  ["SPEC_UNCOVERED=<n>", /SPEC_UNCOVERED=\d+/g],
]) {
  const count = (collected.match(pattern) ?? []).length;
  if (count !== 1) {
    console.error(`${label} appears ${count} times in the test output, expected exactly once.`);
    failed = true;
  }
}
// exitCode instead of process.exit(), so output still buffered for a pipe is flushed.
process.exitCode = failed ? 1 : 0;
