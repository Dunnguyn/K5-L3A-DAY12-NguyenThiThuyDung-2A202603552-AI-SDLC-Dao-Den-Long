import {test,expect} from 'vitest';
import {createGame,step,gameSnapshot} from '../src/core/game.js';
import {runScenario,validateOutput} from '../src/headless/adapter.js';
import {createRouteDriver} from '../scripts/browser-route.mjs';
const run=(s,n,a={})=>{for(let i=0;i<n;i++)step(s,a);return s;};
function fixture(n=1,pos){const s=createGame({night:n,seed:741});s.motes=[];s.shades=[];s.random_drifters=false;s.wind_enabled=false;if(pos)Object.assign(s.player,pos);return s;}
const speed=s=>Math.hypot(s.player.vel.x,s.player.vel.z);
test('acceptance driver abandons a lamp destination if theft/pulse empties its bag',()=>{
 const s=fixture();s.motes=createGame().motes;s.player.light=3;s.lanterns.forEach(l=>l.progress=7);let aim;const drive=createRouteDriver(a=>aim=a);drive(gameSnapshot(s));expect(aim.target.kind).toBe('lamp');s.player.light=0;drive(gameSnapshot(s));expect(aim.target.kind).toBe('mote');
});
test.each([[1,0],[1,1],[.3,.4],[.001,0]])('F01 dash unit direction (%s,%s), running magnitude unchanged',(x,z)=>{
 const s=fixture();step(s,{moveX:x,moveZ:z,dash:true});run(s,11,{moveX:-x,moveZ:-z});expect(Math.hypot(s.player.x,s.player.z)).toBeCloseTo(2.8,9);
 const q=fixture();run(q,6,{moveX:x,moveZ:z});expect(speed(q)).toBeCloseTo(6*Math.min(1,Math.hypot(x,z)),9);
});
test('F01 fractional facing remains unit when standing and air dash holds Y',()=>{
 const s=fixture();step(s,{moveX:.3,moveZ:.4});run(s,6);const p={...s.player};s.player.y=2;s.player.vel.y=-2;step(s,{dash:true});run(s,11);expect(s.player.x-p.x).toBeCloseTo(1.68);expect(s.player.z-p.z).toBeCloseTo(2.24);expect(s.player.y).toBe(2);expect(s.player.invuln_ticks).toBe(0);
});
test.each([['release',{},0],['forward',{moveX:1},6],['opposite',{moveX:-1},0]])('F02 dash boundary returns to controlled %s movement',(name,a,want)=>{
 const s=fixture();run(s,6,{moveX:1});step(s,{dash:true,moveX:1});run(s,10);expect(s.player.dash_ticks).toBe(1);expect(speed(s)).toBeCloseTo(14);step(s);expect(s.player.dash_ticks).toBe(0);expect(speed(s)).toBeCloseTo(14);run(s,6,a);expect(speed(s)).toBeCloseTo(want);if(name==='opposite'){run(s,6,a);expect(s.player.vel.x).toBeCloseTo(-6);}
});
test('F02 dash ends into jump and wind without importing external velocity into control',()=>{
 const s=fixture();s.wind={active:true,dir_deg:0,active_ticks:300,warning_ticks:0};step(s,{dash:true,moveX:1});run(s,11);expect(speed(s)).toBeCloseTo(16);step(s,{jump:true,moveZ:1});expect(s.player.vel.x).toBeCloseTo(2);expect(s.player.vel.z).toBeCloseTo(1);expect(s.player.vel.y).toBeCloseTo(7-20/60);run(s,6);expect(s.player.vel.x).toBeCloseTo(2);expect(s.player.vel.z).toBeCloseTo(0);
});
test.each([[2,20,0,18],[3,0,3,13]])('F01/F02 pad flight in Night%s preserves launch through charm/dash/wind',(n,x,y,z)=>{
 const s=fixture(n,{x,y,z,charm_ticks:600});s.wind={active:true,dir_deg:0,active_ticks:300,warning_ticks:0};run(s,8);const v={...s.player.padVelocity},h=s.player.y;step(s,{dash:true,moveX:.5});run(s,11);expect(s.player.y).toBe(h);expect(s.player.padVelocity).toEqual(v);expect(s.player.dash_cd_ticks).toBe(0);const p={...s.player,vel:{...s.player.vel}};step(s,{moveX:-1});expect(s.player.x-p.x).toBeCloseTo((v.x+2)/60);expect(s.player.z-p.z).toBeCloseTo(v.z/60);expect(s.player.vel.y).toBeLessThan(p.vel.y);
});
test('F02 landing clears launch without a 24m/s controlled tail',()=>{
 const s=fixture(2,{x:20,y:0,z:18});run(s,84);expect(s.player.grounded).toBe(true);expect(s.player.padVelocity).toBeNull();run(s,6);expect(speed(s)).toBeCloseTo(0);
});
test('F03 default edge re-entry continues falling then respawns once',()=>{
 const s=fixture();run(s,408,{moveX:1});for(let i=0;i<30;i++){const y=s.player.y;step(s,{moveX:-1});expect(s.player.y).toBeLessThanOrEqual(y+1e-8);}while(!s.player.respawn_ticks)step(s);run(s,60);expect(s.player.flames).toBe(2);expect(s.player.y).toBe(0);expect(s.events.some(e=>e.source==='fall')).toBe(false);expect(s.eventLog.filter(e=>e.source==='fall')).toHaveLength(1);
});
test.each([[1,39.95,-1,0],[2,35,-1,1.95],[3,0,2,18],[3,5,5,0]])('F03 no upward snap below support Night%s (%s,%s,%s)',(n,x,y,z)=>{
 const s=fixture(n,{x,y,z,grounded:false});step(s);expect(s.player.y).toBeLessThan(y);expect(s.player.grounded).toBe(false);
});
test.each([[1,10,0,0],[2,35,0,0],[3,18,3,10],[3,5,6,0]])('F03 valid descending crossing lands on Night%s support',(n,x,y,z)=>{
 const s=fixture(n,{x,y:y+.02,z,grounded:false,vel:{x:0,y:-2,z:0}});step(s);expect(s.player.y).toBe(y);expect(s.player.grounded).toBe(true);
 step(s,{jump:true});expect(s.player.y).toBeGreaterThan(y);run(s,60);expect(s.player.y).toBe(y);expect(s.player.grounded).toBe(true);
});
test('F03 bridge edge re-entry below bridge cannot snap to deck',()=>{
 const s=fixture(2,{x:35,y:0,z:1.9});run(s,14,{moveZ:1});expect(s.player.y).toBeLessThan(0);let y=s.player.y;for(let i=0;i<30;i++){step(s,{moveZ:-1});expect(s.player.y).toBeLessThanOrEqual(y+1e-8);y=s.player.y;}
});
test.each([0,1e-14,-1e-14])('F04 coincident/near-coincident pulse flee remains7m/s, deterministic (%s)',x=>{
 const input={seed:47,scenario:{player:{light:5},shades:[],drifters:[{id:'D1',pos:{x,y:0,z:0},state:'chase'}],random_drifters:false,wind_enabled:false},actions:[{ticks:1,pulse:true},{ticks:59}]};
 const a=runScenario(input,2),b=runScenario(input,2);expect(a).toEqual(b);expect(Math.abs(a.state.drifters[0].pos.x-x)).toBeCloseTo(7,9);
});
const known=[{type:'dash'},{type:'paused'},{type:'resumed'},{type:'charm_picked',charm_id:'C1',charm_ticks:600},{type:'drifter_steal',drifter_id:'D1',amount:3,carried:7},{type:'drifter_drop',drifter_id:'D1',amount:3},{type:'night_start',night:3},{type:'player_hit',source:'fall',lost:10}];
test.each(known.map(e=>[e.type,e]))('F05 valid published event %s and malformed required fields',(name,event)=>{
 const envelope=()=>({version:'internal-draft-1',state:{...gameSnapshot(createGame()),events:[structuredClone(event)]}});
 expect(()=>validateOutput(envelope())).not.toThrow();
 for(const key of Object.keys(event).filter(k=>k!=='type'&&k!=='source')){
  for(const value of [undefined,null,{},[],true]){const o=envelope();if(value===undefined)delete o.state.events[0][key];else o.state.events[0][key]=value;expect(()=>validateOutput(o),`${name}.${key}`).toThrow(`invalid event ${name}.${key}`);}
  if(typeof event[key]==='number')for(const value of [-1,.5,NaN,Infinity,'3']){const o=envelope();o.state.events[0][key]=value;expect(()=>validateOutput(o)).toThrow();}
 }
});
test('F05 enforces known theft/bag/night ranges and leaves unknown v1.0 payloads unconstrained',()=>{
 for(const e of [{type:'drifter_steal',drifter_id:'D1',amount:4,carried:1},{type:'drifter_steal',drifter_id:'D1',amount:1,carried:11},{type:'drifter_drop',drifter_id:'D1',amount:4},{type:'night_start',night:4},{type:'player_hit',source:'fall',lost:11}]){const o=runScenario({actions:[]});o.state.events=[e];expect(()=>validateOutput(o)).toThrow();}
 const o=runScenario({actions:[]});o.state.events=[{type:'legacy_unknown',payload:{notSpecified:true}}];expect(()=>validateOutput(o)).not.toThrow();
});
