import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const dir = process.env.PROOF_DIR || 'docs/proof/phase-1';
mkdirSync(dir, { recursive: true });
const prd = 'docs/requirements/PRD-0.md';
const hash = createHash('sha256').update(readFileSync(prd)).digest('hex');
const git = spawnSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' });
const report = {
  scope: 'shared gameplay core + internal draft headless + build; official contract NOT VERIFIED; browser evidence separate',
  timestamp: new Date().toISOString(), platform: process.platform, node: process.version,
  commit: git.stdout?.trim(), workingTree: spawnSync('git', ['status', '--short'], { encoding: 'utf8' }).stdout,
  prdSha256: hash, checks: [],
};
// Execute package CLIs with Node directly: no shell-specific npm invocation.
const checks = [
  ['contract-generation', ['scripts/write-contract.mjs']],
  ['headless-scenarios', ['scripts/scenarios.mjs']],
  ['headless-import', ['scripts/smoke-headless.mjs']],
  ['vitest', ['node_modules/vitest/vitest.mjs', 'run']],
  ['vite-build', ['node_modules/vite/bin/vite.js', 'build']],
];
for (const [name, args] of checks) {
  const result = spawnSync(process.execPath, args, { encoding: 'utf8' });
  const check = { name, command: ['node', ...args], exitCode: result.status,
    stdout: result.stdout, stderr: result.stderr, error: result.error?.message };
  report.checks.push(check);
  process.stdout.write(`${name}: ${result.status === 0 ? 'PASS' : 'FAIL'}\n`);
  if (result.status !== 0) { process.exitCode = 1; break; }
}
report.passed = report.checks.length === checks.length && report.checks.every(c => c.exitCode === 0);
writeFileSync(`${dir}/verification.json`, JSON.stringify(report, null, 2) + '\n');
if (!report.passed) process.exitCode = 1;
