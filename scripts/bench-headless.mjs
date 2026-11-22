import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {writeFileSync} from 'node:fs';
import {performance} from 'node:perf_hooks';
import os from 'node:os';
import {getWorld} from '../src/data/worlds.js';
import {createGame,step,gameSnapshot} from '../src/core/game.js';
import {proofDirectory} from './proof-directory.mjs';
const dir=proofDirectory('core','benchmark'),points=getWorld(3).shadePoints;
const scenario={player:{pos:{x:0,y:0,z:-30},invuln_ticks:21600},
 shades:points.slice(0,10).map((pos,i)=>({id:'S'+(i+1),pos,state:'chase'})),
 drifters:points.slice(10,12).map((pos,i)=>({id:'D'+(i+1),pos,state:'idle',stolen:0})),
 random_drifters:true,wind_enabled:true};
const input={version:'internal-draft-1',seed:7341,scenario,actions:[{ticks:21600}]};
const inputPath=dir+'/benchmark-night3.input.json';writeFileSync(inputPath,JSON.stringify(input,null,2)+'\n');
const report={node:process.version,os:{platform:os.platform(),release:os.release(),arch:os.arch()},resolution:'headless/no DOM',startedAt:new Date().toISOString(),
 scope:'Phase 3 Night 3: 18000 active ticks plus 3600 terminal input ticks; separate throughput fixture runs 21600 active updates across two legal Night-3 sessions. No time/tuning override.',
 cliReplays:[],activeThroughputReplays:[]};
let first;
for(let i=0;i<2;i++){
 const start=performance.now(),r=spawnSync(process.execPath,['scripts/headless.mjs','--night','3',inputPath],{encoding:'utf8',timeout:30000,maxBuffer:16e6}),elapsedMs=performance.now()-start;
 assert.equal(r.status,0,r.stderr);assert.equal(r.stderr,'');const o=JSON.parse(r.stdout);
 assert.equal(o.state.tick,21600);assert.equal(o.state.sim_tick,18000);assert.equal(o.state.end_reason,'dawn');
 assert.ok(elapsedMs<=30000);
 if(first)assert.deepEqual(o,first);else{first=o;writeFileSync(dir+'/benchmark-night3.actual.json',JSON.stringify(o,null,2)+'\n');}
 report.cliReplays.push({elapsedMs,inputTicks:21600,activeSimTicks:18000,terminalTailTicks:3600,exitCode:0,stdoutPureJson:true});
}
function denseFixture(){
 const s=createGame({night:3,seed:7341});s.player.invuln_ticks=21600;
 s.motes=getWorld(3).motePoints.map((p,i)=>({...p,id:'M'+(i+1),kind:'random',available:true,ttl:Infinity,spawnIndex:i}));
 s.shades=scenario.shades.map(e=>({id:e.id,...e.pos,state:e.state,state_ticks_left:0,wander_deg:0,eviction_ticks:0}));
 s.drifters=scenario.drifters.map(e=>({id:e.id,...e.pos,state:'idle',stolen:0,state_ticks_left:0,wander_deg:0}));
 return s;
}
let firstActive;
for(let i=0;i<2;i++){
 const start=performance.now(),sessions=[];
 for(const ticks of [18000,3600]){
  const s=denseFixture();for(let j=0;j<ticks;j++)step(s);assert.equal(s.sim_tick,ticks);
  sessions.push(gameSnapshot(s));
 }
 const elapsedMs=performance.now()-start;assert.ok(elapsedMs<=30000);
 if(firstActive)assert.deepEqual(sessions,firstActive);else firstActive=sessions;
 report.activeThroughputReplays.push({elapsedMs,activeSimTicks:21600,sessions:sessions.map(s=>({night:s.night,sim_tick:s.sim_tick,state:s.state,randomMotes:s.motes.filter(m=>m.kind==='random').length,shades:s.shades.length,drifters:s.drifters.filter(d=>d.state!=='removed').length})),fixture:'30 random motes, 10 Shades, 2 Drifters initially; wind/random systems enabled; invulnerability prevents early death'});
}
report.deterministic=true;report.within30s=true;
writeFileSync(dir+'/benchmark-night3.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
