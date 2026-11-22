import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {writeFileSync} from 'node:fs';
import {proofDirectory} from './proof-directory.mjs';
import {getWorld} from '../src/data/worlds.js';
const dir=proofDirectory('core','scenarios'),checks=[];
function cli(name,night,input,check){
 const inputPath=dir+'/'+name+'.input.json';writeFileSync(inputPath,JSON.stringify(input,null,2)+'\n');
 const results=[];
 for(let i=0;i<2;i++){
  const r=spawnSync(process.execPath,['scripts/headless.mjs','--night',String(night),inputPath],{encoding:'utf8',timeout:30000,maxBuffer:16e6});
  writeFileSync(dir+'/'+name+'.run-'+(i+1)+'.log',r.stdout+r.stderr);
  assert.equal(r.status,0,r.stderr);assert.equal(r.stderr,'');const o=JSON.parse(r.stdout);check(o.state);results.push(o);
 }
 assert.deepEqual(results[0],results[1]);
 writeFileSync(dir+'/'+name+'.actual.json',JSON.stringify(results[0],null,2)+'\n');
 checks.push({name,night,status:'PASS',deterministic:true,input:inputPath,actual:dir+'/'+name+'.actual.json',layer:'actual CLI scenario fixture; not default browser campaign'});
}
for(const night of [1,2,3]){
 const ticks=[0,14400,16200,18000][night];
 cli('night-'+night+'-full-dawn',night,{seed:7341,scenario:{player:{invuln_ticks:21600}},actions:[{ticks}]},s=>{
  assert.equal(s.night,night);assert.equal(s.sim_tick,ticks);assert.equal(s.time_s,0);assert.equal(s.state,'lost');assert.equal(s.end_reason,'dawn');
  assert.equal(s.events.filter(e=>e.type==='game_over').length,1);
 });
 cli('night-'+night+'-no-early-win',night,{scenario:{lanterns:getWorld(night).lamps.map(l=>({id:l.id,lit:true}))},actions:[{ticks:60}]},s=>{
  assert.equal(s.state,'playing');assert.equal(s.score,0);assert.ok(s.lanterns.every(l=>l.lit&&l.fuel===99));
  assert.equal(s.player.capacity,10);
 });
}
cli('first-light',1,{scenario:{player:{pos:{x:0,y:0,z:25},light:10}},actions:[{ticks:1,interact:true}]},s=>{
 assert.equal(s.score,150);assert.equal(s.player.capacity,12);assert.equal(s.lanterns[0].fuel,100);
 assert.deepEqual(s.events.find(e=>e.type==='lantern_lit'),{type:'lantern_lit',lantern_id:'L1',relight:false});
});
cli('partial-relight',1,{scenario:{player:{pos:{x:0,y:0,z:25},light:5},lanterns:[{id:'L1',ever_lit:true}]},actions:[{ticks:1,interact:true}]},s=>{
 assert.equal(s.score,65);assert.equal(s.player.capacity,12);assert.equal(s.lanterns[0].relit_count,1);
});
cli('refuel-and-full-decay',1,{scenario:{player:{pos:{x:0,y:0,z:25},light:1},lanterns:[{id:'L1',lit:true}]},actions:[{ticks:1,interact:true}]},s=>{
 assert.equal(s.score,5);assert.deepEqual(s.events.find(e=>e.type==='refuel'),{type:'refuel',lantern_id:'L1',amount:1,fuel:100});
});
const draining={lanterns:[{id:'L1',lit:true,fuel:29}],shades:['S2','S1'].map(id=>({id,pos:{x:0,y:0,z:25},state:'drain',target_lantern_id:'L1'}))};
cli('multi-shade-drain',1,{scenario:draining,actions:[{ticks:61}]},s=>{
 assert.equal(s.lanterns[0].fuel,17.8);
 assert.deepEqual(s.events.filter(e=>e.type==='fuel_drain').map(e=>[e.shade_id,e.fuel]),[['S1',18],['S2',18]]);
});
cli('pause-drain-resume',1,{scenario:draining,actions:[{ticks:59},{ticks:1,pause:true},{ticks:60},{ticks:1,pause:true}]},s=>{
 assert.equal(s.tick,121);assert.equal(s.sim_tick,60);assert.equal(s.lanterns[0].fuel,18);
 assert.equal(s.events.filter(e=>e.type==='fuel_drain').length,2);
});
cli('out-59-60-61',1,{scenario:{lanterns:[{id:'L1',lit:true,fuel:1}]},actions:[{ticks:61}]},s=>{
 assert.equal(s.lanterns[0].fuel,0);assert.equal(s.lanterns[0].ever_lit,true);assert.equal(s.lanterns[0].progress,0);
 assert.equal(s.events.filter(e=>e.type==='lantern_out').length,1);
});
cli('drain-pulse',1,{scenario:{player:{pos:{x:4,y:0,z:25},light:3},lanterns:[{id:'L1',lit:true,fuel:20}],shades:[draining.shades[0]]},actions:[{ticks:1,pulse:true}]},s=>{
 assert.equal(s.score,15);assert.equal(s.shades[0].state,'stunned');assert.equal(s.lanterns[0].fuel,19.9);
});
cli('capacity-theft',2,{scenario:{player:{successful_lights:5,light:20},drifters:[{id:'D1',pos:{x:0,y:0,z:0},state:'chase'}]},actions:[{ticks:1}]},s=>{
 assert.equal(s.player.capacity,20);assert.equal(s.player.light,17);
 assert.deepEqual(s.events.find(e=>e.type==='drifter_steal'),{type:'drifter_steal',drifter_id:'D1',amount:3,carried:17});
});
cli('fatal-fall',1,{scenario:{player:{flames:1,light:10,pos:{x:50,y:-11,z:0}}},actions:[{ticks:1}]},s=>{
 assert.equal(s.end_reason,'no_flames');assert.deepEqual(s.events.at(-1),{type:'game_over',reason:'no_flames'});
});
const bad=spawnSync(process.execPath,['scripts/headless.mjs','--night','4','package.json'],{encoding:'utf8'});
assert.equal(bad.status,1);assert.equal(bad.stdout,'');assert.equal(typeof JSON.parse(bad.stderr).error,'string');
writeFileSync(dir+'/invalid-cli.actual.json',JSON.stringify({exitCode:bad.status,stdout:bad.stdout,stderr:bad.stderr},null,2)+'\n');
checks.push({name:'invalid CLI night',status:'PASS',exitCode:1,stdoutEmpty:true});
const report={scope:'Phase 3 actual CLI scenarios; seeded fixtures, not manual browser/default campaign acceptance; official v1.0 base NOT VERIFIED',timestamp:new Date().toISOString(),node:process.version,platform:process.platform,checks,passed:checks.length,failed:0};
writeFileSync(dir+'/headless-results.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
