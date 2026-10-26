#!/usr/bin/env node
/**
 * Test entry point for `npm test` (after the build).
 *
 * Lists the test files itself (no shell glob, no directory argument, so it behaves the
 * same on every OS and on Node 18, 20 and 22), runs them with `node --test`, and then
 * prints the coverage summary written by the contract tests:
 *
 *   TOOL_COVERAGE=<tools whose requests matched the contract>/<tools registered>
 *   SPEC_UNCOVERED=<contract operations without a tool>
 *
 * The summary is printed here, not by the test reporter, so it appears regardless of
 * which reporter node --test picks.
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const testDir = dirname(fileURLToPath(import.meta.url));
const files = readdirSync(testDir)
  .filter((name) => name.endsWith(".test.mjs"))
  .sort()
  .map((name) => join(testDir, name));

if (!files.length) {
  console.error("No test files found in test/.");
  process.exit(1);
}

const reportDir = mkdtempSync(join(tmpdir(), "placetel-tests-"));
const result = spawnSync(process.execPath, ["--test", ...files], {
  stdio: "inherit",
  env: { ...process.env, PLACETEL_API_KEY: "offline-test-key", PLACETEL_TEST_REPORT_DIR: reportDir },
});

let exitCode = result.status ?? 1;
if (result.error) {
  console.error(`Could not start node --test: ${result.error.message}`);
  exitCode = 1;
}

const reportFile = join(reportDir, "coverage.json");
if (existsSync(reportFile)) {
  const report = JSON.parse(readFileSync(reportFile, "utf8"));
  console.log(`TOOL_COVERAGE=${report.passed}/${report.registered}`);
  console.log(`SPEC_UNCOVERED=${report.uncovered}`);
} else {
  console.error("The contract tests wrote no coverage report.");
  if (exitCode === 0) exitCode = 1;
}
rmSync(reportDir, { recursive: true, force: true });
process.exit(exitCode);
