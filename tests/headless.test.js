import { test,expect } from 'vitest';
import { runScenario,validateOutput } from '../src/headless/adapter.js';
import { spawnSync } from 'node:child_process';
test('TC-15 internal validation rejects invalid inputs',()=>{for(const input of [null,{}, {version:'internal-draft-1',actions:[{ticks:-1}]},{version:'internal-draft-1',actions:[{ticks:1,moveX:2}]},{version:'internal-draft-1',actions:[{ticks:1,glow:1}]},{version:'internal-draft-1',actions:[{ticks:1,teleport:true}]}])expect(()=>runScenario(input)).toThrow();expect(()=>validateOutput({})).toThrow();});
test('TC-14/15 headless determinism and output',()=>{const input={version:'internal-draft-1',actions:[{ticks:120,moveX:1},{ticks:40,jump:true}]};expect(validateOutput(runScenario(input))).toEqual(runScenario(input));});
test('CLI rejects bad input with stderr and no stdout',()=>{const r=spawnSync(process.execPath,['scripts/headless.mjs','package.json'],{encoding:'utf8'});expect(r.status).toBe(1);expect(r.stdout).toBe('');expect(JSON.parse(r.stderr).error).toBeTruthy();});
test('CLI positive input emits valid JSON matching shared adapter',()=>{const r=spawnSync(process.execPath,['scripts/headless.mjs','docs/proof/phase-1/loss.input.json'],{encoding:'utf8'});expect(r.status).toBe(0);expect(r.stderr).toBe('');expect(validateOutput(JSON.parse(r.stdout)).state.status).toBe('lost');});
