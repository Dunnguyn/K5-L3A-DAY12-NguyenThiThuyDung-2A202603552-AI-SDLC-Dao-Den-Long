import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {writeFileSync} from 'node:fs';
import {proofDirectory} from './proof-directory.mjs';
const dir=proofDirectory('core','edge-scenarios'),checks=[];
function check(name,input,assertion){
 const p=dir+'/'+name+'.input.json';writeFileSync(p,JSON.stringify(input,null,2)+'\n');let first;
 for(let i=0;i<2;i++){
  const r=spawnSync(process.execPath,['scripts/headless.mjs','--night','1',p],{encoding:'utf8',timeout:30000,maxBuffer:16e6});
  writeFileSync(dir+'/'+name+'.run-'+i+'.log',r.stdout+r.stderr);assert.equal(r.status,0,r.stderr);assert.equal(r.stderr,'');
  const out=JSON.parse(r.stdout);assertion(out.state);if(first)assert.deepEqual(out,first);else first=out;
 }
 writeFileSync(dir+'/'+name+'.actual.json',JSON.stringify(first,null,2)+'\n');checks.push({name,status:'PASS',deterministic:true,layer:'actual CLI fixture'});
}
check('wander-weak-tie-ID',{scenario:{player:{pos:{x:-30,y:0,z:0}},lanterns:[{id:'L1',lit:true,fuel:20},{id:'L2',lit:true,fuel:20}],shades:[{id:'S1',pos:{x:11.9,y:0,z:16.35},state:'wander'}]},actions:[{ticks:1}]},s=>{
 assert.equal(s.shades[0].state,'wander');assert.ok(s.shades[0].pos.x<11.9);assert.ok(s.shades[0].pos.z>16.35);
});
check('safe-refill-plus-pulse',{scenario:{player:{pos:{x:1.5,y:0,z:25},successful_lights:5,light:20},lanterns:[{id:'L1',lit:true,fuel:20}],shades:[{id:'S1',pos:{x:0,y:0,z:25},state:'drain',target_lantern_id:'L1'}]},actions:[{ticks:1,interact:true,pulse:true}]},s=>{
 assert.equal(s.score,60);assert.equal(s.player.flames,3);assert.equal(s.shades[0].state,'stunned');assert.ok(s.shades[0].pos.x>=6);
});
for(const units of [1205,1206,1207])check('safe-raw-threshold-'+units,{scenario:{player:{pos:{x:.5,y:0,z:25},light:1},lanterns:[{id:'L1',lit:true,fuel:units/60}],shades:[{id:'S1',pos:{x:0,y:0,z:25},state:'drain',target_lantern_id:'L1'}]},actions:[{ticks:1,interact:true}]},s=>{
 assert.equal(s.lanterns[0].fuel,30);assert.equal(s.player.flames,units>=1206?3:2);
 if(units>=1206)assert.ok(s.shades[0].pos.x>=6);
});
check('two-part-relight-with-real-pickups',{seed:1,scenario:{player:{pos:{x:0,y:0,z:25},light:2,invuln_ticks:21600},lanterns:[{id:'L1',ever_lit:true}]},actions:[{ticks:1,interact:true},{ticks:80,moveZ:1},{ticks:1920},{ticks:80,moveZ:-1},{ticks:1,interact:true}]},s=>{
 assert.equal(s.lanterns[0].lit,true);assert.equal(s.lanterns[0].relit_count,1);assert.equal(s.lanterns[0].fuel,100);
 assert.equal(s.score,65);assert.equal(s.player.capacity,12);assert.equal(s.events.filter(e=>e.type==='lantern_lit').length,1);
});
const report={scope:'Phase 3 additional actual CLI edge fixtures; not browser/default campaign',checks,passed:checks.length,failed:0};
writeFileSync(dir+'/additional-cli-results.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({directory:dir,...report}));
