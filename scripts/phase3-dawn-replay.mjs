import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {writeFileSync} from 'node:fs';
import {createGame,step,gameSnapshot} from '../src/core/game.js';
import {getWorld} from '../src/data/worlds.js';
import {fuelPilot} from './phase3-headless-driver.mjs';
import {proofDirectory} from './proof-directory.mjs';
const dir=proofDirectory('core','dawn-input-replay'),checks=[];
for(const night of (process.argv[2]?[Number(process.argv[2])]:[1,2,3])){
 const scenario={player:{invuln_ticks:21600,successful_lights:5,light:20},lanterns:getWorld(night).lamps.map(l=>({id:l.id,lit:true})),random_drifters:false,wind_enabled:true};
 // Initial scenario fixture only; the loop below never mutates game state directly.
 const s=createGame({night,seed:41});Object.assign(s.player,scenario.player);
 for(const l of s.lanterns)Object.assign(l,{lit:true,fuel_units:6000,ever_lit:true});
 s.random_drifters=false;
 const pilot=fuelPilot(night),actions=[];
 while(s.status==='playing'){
  const a=pilot(gameSnapshot(s)),key=JSON.stringify(a),prev=actions.at(-1);
  if(prev?.key===key)prev.ticks++;else actions.push({...a,ticks:1,key});
  step(s,a);
 }
 const input={version:'internal-draft-1',seed:41,scenario,actions:actions.map(({key,...a})=>a)};
 const file=dir+'/night-'+night+'.input.json';writeFileSync(file,JSON.stringify(input,null,2)+'\n');
 const actual=gameSnapshot(s);writeFileSync(dir+'/night-'+night+'.pilot.actual.json',JSON.stringify(actual,null,2)+'\n');
 const r=spawnSync(process.execPath,['scripts/headless.mjs','--night',String(night),file],{encoding:'utf8',timeout:30000,maxBuffer:16e6});
 writeFileSync(dir+'/night-'+night+'.cli.log',r.stdout+r.stderr);assert.equal(r.status,0,r.stderr);
 const out=JSON.parse(r.stdout);assert.deepEqual(out.state,actual);
 const item={night,state:out.state.state,reason:out.state.end_reason,score:out.state.score,sim_tick:out.state.sim_tick,lit:out.state.lanterns.filter(l=>l.lit).length,actions:input.actions.length,refuels:out.state.events.filter(e=>e.type==='refuel').length,CLIReplayMatches:true,defaultCampaign:false,fixture:'pre-lit lamps, explicit successful_lights=5/bag20 and invulnerability; random Drifters disabled; no mid-run state mutation'};
 checks.push(item);console.log(JSON.stringify(item));
}
const report={scope:'Actual input CLI dawn replay using documented scenario fixtures, not default campaign or browser E2E',checks,allWon:checks.every(c=>c.reason==='dawn_survived')};
writeFileSync(dir+'/dawn-input-replay.json',JSON.stringify(report,null,2)+'\n');
assert.ok(report.allWon,'retained pilot attempt: did not preserve enough lamps');
