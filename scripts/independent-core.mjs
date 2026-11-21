import {proofDirectory} from './proof-directory.mjs';
﻿import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync,writeFileSync } from 'node:fs';
import { tuning } from '../src/config/game.js';
import { createGame,step,gameSnapshot } from '../src/core/game.js';
import { getWorld } from '../src/data/worlds.js';
import { runScenario,validateOutput } from '../src/headless/adapter.js';
const dir=proofDirectory('core','cross-check');mkdirSync(dir,{recursive:true});const checks=[];function check(id,fn){fn();checks.push({id,status:'PASS'});}
check('standard values and map cardinality',()=>{assert.equal(tuning.tick_rate,60);assert.equal(tuning.dash_speed,14);assert.equal(tuning.night3_duration_s,360);assert.deepEqual([1,2,3].map(n=>getWorld(n).lamps.length),[5,6,7]);});
check('fixed tick and pause separation',()=>{const s=createGame();step(s,{pause:true});assert.equal(s.tick,1);assert.equal(s.sim_tick,0);step(s,{pause:false});assert.equal(s.sim_tick,0);step(s,{pause:true});assert.equal(s.sim_tick,1);});
check('dash rising edge and stable replay',()=>{const input={version:'internal-draft-1',seed:88,actions:[{ticks:1,dash:true},{ticks:1,dash:true}]};const a=runScenario(input,2),b=runScenario(input,2);assert.deepEqual(a,b);assert.equal(a.state.events.filter(e=>e.type==='dash').length,1);});
check('firefly only scores when deposited',()=>{const s=createGame();s.shades=[];const m=s.motes[0];s.motes=[m];Object.assign(s.player,{x:m.x,y:m.y,z:m.z});step(s);assert.equal(s.player.light,1);assert.equal(s.score,0);});
check('shade contact and safe zone update order',()=>{const s=createGame();s.motes=[];s.player.flames=3;s.shades=[{id:'S1',x:.2,y:0,z:0,state:'wander',state_ticks_left:0,wander_deg:0,eviction_ticks:0}];step(s);assert.equal(s.player.flames,2);});
check('required output rejects null records and keeps required arrays',()=>{const o=runScenario({actions:[]});assert.ok(validateOutput(o));const bad=structuredClone(o);bad.state.drifters=[null];assert.throws(()=>validateOutput(bad));for(const key of ['motes','drifters','charms'])assert.ok(Array.isArray(o.state[key]));});
check('CLI pure JSON for selected night',()=>{const r=spawnSync(process.execPath,['scripts/headless.mjs','--night','2','docs/proof/phase-2/core/night-2.input.json'],{encoding:'utf8'});assert.equal(r.status,0,r.stderr);assert.equal(r.stderr,'');assert.equal(JSON.parse(r.stdout).state.night,2);});
const report={kind:'separate acceptance cross-check (agent-authored; not external independent QA)',node:process.version,platform:process.platform,checks,passed:checks.length,failed:0};writeFileSync(`${dir}/independent-core.json`,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
