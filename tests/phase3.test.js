import {test,expect} from 'vitest';
import {createGame,step,gameSnapshot,restartNight,startNight} from '../src/core/game.js';
import {advanceFuel,interactLantern,fuelUnits,fuelValue,activeSafeZone,inventoryCapacity} from '../src/core/fuel.js';
import {runScenario,validateOutput,validateEvent} from '../src/headless/adapter.js';
import {tuning as C,nightDurationTicks} from '../src/config/game.js';

const run=(s,n,a={})=>{for(let i=0;i<n;i++)step(s,a);return s;};
const fixture=(night=1)=>{const s=createGame({night,seed:471});s.motes=[];s.shades=[];s.drifters=[];s.random_drifters=false;s.wind_enabled=false;return s;};
const emit=(s,type,data={})=>{const e={type,...data};s.events.push(e);s.eventLog.push(e);};
function light(l,units=6000){Object.assign(l,{lit:true,fuel_units:units,ever_lit:true,progress:10});return l;}
function shade(l,id='S1',state='drain'){return {id,x:l.x,y:l.y,z:l.z,state,state_ticks_left:0,target_lantern_id:l.id,drain_ticks:0,drain_target_lantern_id:null,wander_deg:0,eviction_ticks:0,push_ticks:0,push_dir:{x:1,z:0},recoil_dir:{x:1,z:0}};}
const atLamp=(s,l,bag)=>Object.assign(s.player,{x:l.x,y:l.y,z:l.z,light:bag});
const types=s=>s.events.map(e=>e.type);

test('F01/F02 exact natural decay at 59/60/61 and 6000 ticks; out only once',()=>{
 const s=fixture(),l=light(s.lanterns[0],60);
 for(let i=0;i<59;i++)advanceFuel(s,emit);
 expect(l.fuel_units).toBe(1);expect(l.lit).toBe(true);
 advanceFuel(s,emit);expect(l).toMatchObject({lit:false,fuel_units:0,progress:0,ever_lit:true,relit_count:0});
 advanceFuel(s,emit);expect(s.eventLog.filter(e=>e.type==='lantern_out')).toHaveLength(1);
 light(l);for(let i=0;i<5999;i++)advanceFuel(s,emit);expect(l.fuel_units).toBe(1);
 advanceFuel(s,emit);expect(l.lit).toBe(false);
});
test('F03 raw thresholds distinguish 1799/1800 despite equal rounded snapshot',()=>{
 const s=fixture(),l=light(s.lanterns[0],1801);
 step(s);expect(l.fuel_units).toBe(1800);expect(activeSafeZone(l)).toBe(true);expect(fuelValue(l)).toBe(30);
 step(s);expect(l.fuel_units).toBe(1799);expect(activeSafeZone(l)).toBe(false);expect(fuelValue(l)).toBe(30);
 step(s);expect(activeSafeZone(l)).toBe(false);
 expect(fuelUnits(99.9)).toBe(5994);expect(()=>fuelUnits(29.99)).toThrow('1/60');
});
test.each([[80,2,100,2],[90,20,100,1],[99.9,1,100,1],[80,1,90,1],[80,0,80,0]])(
 'F04 refuel fuel=%s bag=%s',(fuel,bag,want,used)=>{
 const s=fixture(),l=light(s.lanterns[0],fuelUnits(fuel));atLamp(s,l,bag);
 interactLantern(s,emit);expect(l.fuel_units).toBe(fuelUnits(want));expect(s.player.light).toBe(bag-used);
 expect(s.score).toBe(used*5);expect(s.player.successful_lights).toBe(0);
 expect(s.events.filter(e=>e.type==='refuel')).toEqual(used?[{type:'refuel',lantern_id:l.id,amount:used,fuel:want}]:[]);
});
test('F05 pure interaction excludes full before nearest/ID/3D selection',()=>{
 const s=fixture(),a=light(s.lanterns[0]),b=s.lanterns[1];
 Object.assign(a,{x:0,y:0,z:0});Object.assign(b,{x:1,y:0,z:0});s.player.light=2;
 interactLantern(s,emit);expect(b.progress).toBe(2);expect(a.fuel_units).toBe(6000);
 s.player.light=2;b.x=3;const score=s.score;interactLantern(s,emit);
 expect(s.player.light).toBe(2);expect(s.score).toBe(score);expect(types(s)).not.toContain('refuel');
 b.x=0;b.y=2.01;interactLantern(s,emit);expect(b.progress).toBe(2);
 b.y=0;a.lit=false;a.fuel_units=0;a.ever_lit=false;a.progress=0;a.x=-1;b.x=1;
 interactLantern(s,emit);expect(a.progress).toBe(2);expect(b.progress).toBe(2);
});
test('F06 beginning-of-tick full lamp naturally decays before E and accepts one mote',()=>{
 const s=fixture(),l=light(s.lanterns[0]);atLamp(s,l,1);step(s,{interact:true});
 expect(l.fuel_units).toBe(6000);expect(s.score).toBe(5);expect(s.player.light).toBe(0);
 expect(s.events).toContainEqual({type:'refuel',lantern_id:l.id,amount:1,fuel:100});
});
test('F07/F08 partial first light and relight update history/capacity once, decay starts next tick',()=>{
 const s=fixture(),l=s.lanterns[0];atLamp(s,l,6);step(s,{interact:true});
 expect(l.progress).toBe(6);expect(s.score).toBe(30);expect(s.player.capacity).toBe(10);
 s.player.light=4;step(s,{interact:true});expect(l.fuel_units).toBe(6000);
 expect(l.ever_lit).toBe(true);expect(l.relit_count).toBe(0);expect(s.score).toBe(150);expect(s.player.capacity).toBe(12);
 step(s);expect(l.fuel_units).toBe(5999);
 l.fuel_units=1;step(s);expect(l.progress).toBe(0);
 s.player.light=2;step(s,{interact:true});expect(l.progress).toBe(2);expect(l.lit).toBe(false);
 s.player.light=3;step(s,{interact:true});expect(l.fuel_units).toBe(6000);expect(l.relit_count).toBe(1);
 expect(s.player.successful_lights).toBe(2);expect(s.player.capacity).toBe(14);expect(s.score).toBe(215);
 expect(s.events).toContainEqual({type:'lantern_lit',lantern_id:l.id,relight:true});
});
test('A01 weak-lamp priority and ID tie; off fallback; chase keeps player',()=>{
 const s=fixture();Object.assign(s.player,{x:-30,z:0});
 const [a,b,c]=s.lanterns;Object.assign(a,{x:20,z:0});Object.assign(b,{x:10,z:-1});Object.assign(c,{x:10,z:1});
 light(b,1200);light(c,1200);s.shades=[shade(a,'S1','wander')];s.shades[0].x=10;
 step(s);expect(s.shades[0].target_lantern_id).toBe(b.id);
 b.lit=c.lit=false;b.fuel_units=c.fuel_units=0;step(s);
 expect(s.shades[0].state).toBe('wander'); // drain exit is the only guard transition this tick
 step(s); // now exercise wander's off-lamp targeting
 expect(s.shades[0].target_lantern_id).toBe(b.id);
 s.shades[0].state='chase';Object.assign(s.player,{x:9,z:0});step(s);
 expect(s.shades[0].state).toBe('recoil'); // player contact, not retargeting a lamp
});
test.each([1.999,2,2.1])('A02 drain entry uses XZ radius2 (%s), next-tick fuel only',d=>{
 const s=fixture(),l=light(s.lanterns[0],1200);const e=shade(l,'S1','wander');e.x+=d;e.y=6;s.shades=[e];
 step(s);expect(l.fuel_units).toBe(1199);
 expect(e.state).toBe(d<=2?'drain':'wander');
 if(d<=2){expect(e.x).toBe(l.x+d);step(s);expect(l.fuel_units).toBe(1193);}
});
test.each([0,1,2,3])('A03 additive drain K=%s without duplicate natural decay',k=>{
 const s=fixture(),l=light(s.lanterns[0],1799);s.shades=Array.from({length:k},(_,i)=>shade(l,'S'+(i+1)));
 step(s);expect(l.fuel_units).toBe(1798-5*k);
});
test('A03 multi-Shade aggregate/order deterministic across scenario input permutations',()=>{
 const scenario={lanterns:[{id:'L1',lit:true,fuel:29}],shades:[{id:'S2',pos:{x:0,y:0,z:25},state:'drain',target_lantern_id:'L1'},{id:'S1',pos:{x:0,y:0,z:25},state:'drain',target_lantern_id:'L1'}]};
 const a=runScenario({seed:2,scenario,actions:[{ticks:60}]}),b=runScenario({seed:2,scenario:{...scenario,shades:scenario.shades.slice().reverse()},actions:[{ticks:60}]});
 expect(a).toEqual(b);expect(a.state.events.filter(e=>e.type==='fuel_drain')).toEqual([
  {type:'fuel_drain',lantern_id:'L1',shade_id:'S1',fuel:18},
  {type:'fuel_drain',lantern_id:'L1',shade_id:'S2',fuel:18}]);
});
test('A04/S02 reactivation precedes movement/contact; pulse state remains stunned and scores15',()=>{
 const s=fixture(),l=light(s.lanterns[0],1200);atLamp(s,l,20);s.player.successful_lights=5;s.player.x+=1.5;
 const e=shade(l);s.shades=[e];step(s,{interact:true,pulse:true});
 expect(l.fuel_units).toBe(6000);expect(activeSafeZone(l)).toBe(true);expect(e.state).toBe('stunned');
 expect(Math.hypot(e.x-l.x,e.z-l.z)).toBeGreaterThanOrEqual(6);expect(s.player.flames).toBe(3);expect(s.score).toBe(60);
 expect(e.drain_ticks).toBe(0);step(s);expect(l.fuel_units).toBe(5999);expect(e.state).toBe('stunned');
});
test('A05 pulse draining Shade total15; repeated stunned target gives ordinary5',()=>{
 const s=fixture(),l=light(s.lanterns[0],1200);const e=shade(l);s.shades=[e];atLamp(s,l,6);s.player.x=4;
 step(s,{pulse:true});expect(s.score).toBe(15);expect(e.state).toBe('stunned');expect(l.fuel_units).toBe(1194);
 e.x=3;e.z=25;s.player.pulse_cd_ticks=0;step(s);step(s,{pulse:true});expect(s.score).toBe(20);
});
test.each([5.999,6,6.001])('A06 drain exit uses player XZ6 (%s)',d=>{
 const s=fixture(),l=light(s.lanterns[0],1200),e=shade(l);s.shades=[e];atLamp(s,l,0);s.player.x+=d;s.player.y=6;
 step(s);expect(e.state).toBe(d<=6?'chase':'drain');expect(l.fuel_units).toBe(1194);
});
test('A06 target out/healthy/distant exits drain; stun expiry returns wander before reentry',()=>{
 for(const kind of ['out','healthy','distant']){
  const s=fixture(),l=light(s.lanterns[0],1200),e=shade(l);s.shades=[e];
  if(kind==='out'){l.lit=false;l.fuel_units=0;}if(kind==='healthy')l.fuel_units=6000;if(kind==='distant')e.x+=3;
  step(s);expect(e.state).toBe('wander');expect(e.drain_ticks).toBe(0);
 }
 const s=fixture(),l=light(s.lanterns[0],1200),e=shade(l,'S1','stunned');e.state_ticks_left=1;s.shades=[e];
 step(s);expect(e.state).toBe('wander');expect(l.fuel_units).toBe(1199);
});
test('A07 cadence 59/60/61, target reset, interruption and pause freeze',()=>{
 const s=fixture(),l=light(s.lanterns[0],1740),e=shade(l);s.shades=[e];s.sim_tick=17;
 run(s,59);expect(s.eventLog.filter(e=>e.type==='fuel_drain')).toHaveLength(0);expect(e.drain_ticks).toBe(59);
 step(s,{pause:true});run(s,65);expect(e.drain_ticks).toBe(59);expect(l.fuel_units).toBe(1386);
 step(s,{pause:true});expect(e.drain_ticks).toBe(60);expect(s.events.filter(e=>e.type==='fuel_drain')).toHaveLength(1);
 step(s);expect(e.drain_ticks).toBe(61);
 const other=light(s.lanterns[1],1200);Object.assign(e,{x:other.x,y:other.y,z:other.z,target_lantern_id:other.id});
 step(s);expect(e.drain_ticks).toBe(1);e.state='chase';step(s);expect(e.drain_ticks).toBe(0);
 e.state='drain';e.target_lantern_id=other.id;step(s);expect(e.drain_ticks).toBe(1);
});
test('A07 due multi-drain event precedes one out and reports shared final zero',()=>{
 const s=fixture(),l=light(s.lanterns[0],1);s.shades=[shade(l,'S2'),shade(l,'S1')];
 for(const e of s.shades){e.drain_ticks=59;e.drain_target_lantern_id=l.id;}
 step(s);expect(types(s)).toEqual(['fuel_drain','fuel_drain','lantern_out']);
 expect(s.events.slice(0,2).map(e=>[e.shade_id,e.fuel])).toEqual([['S1',0],['S2',0]]);
 step(s);expect(types(s)).not.toContain('lantern_out');
});
test.each([1,2,3])('W01/W03 full duration and dawn count thresholds Night%s',night=>{
 const needed=[0,3,4,5][night];
 for(const count of [needed-1,needed,needed+1]){
  const s=fixture(night);s.player.invuln_ticks=21600;s.lanterns.slice(0,count).forEach(l=>light(l));s.time_ticks=2;
  step(s);expect(s.status).toBe('playing');step(s);expect(s.status).toBe(count>=needed?'won':'lost');
  expect(s.end_reason).toBe(count>=needed?'dawn_survived':'dawn');
  const tick=s.sim_tick,score=s.score,fuel=s.lanterns[0].fuel_units;step(s);
  expect(s.sim_tick).toBe(tick);expect(s.score).toBe(score);expect(s.lanterns[0].fuel_units).toBe(fuel);
 }
 expect(nightDurationTicks(night)).toBe([0,14400,16200,18000][night]);
});
test('W02 all-lit before dawn continues and decays with no early/time bonus',()=>{
 const s=fixture();s.lanterns.forEach(l=>light(l));run(s,100);
 expect(s.status).toBe('playing');expect(s.score).toBe(0);expect(s.lanterns[0].fuel_units).toBe(5900);
});
test.each([false,true])('W04 last-tick out and optional relight (%s) determine final ratio',relight=>{
 const s=fixture();s.time_ticks=1;s.lanterns.slice(0,3).forEach(l=>light(l));
 const l=s.lanterns[0];l.fuel_units=1;atLamp(s,l,relight?5:0);step(s,{interact:relight});
 expect(s.end_reason).toBe(relight?'dawn_survived':'dawn');
 expect(types(s)).toEqual(relight?['lantern_out','lantern_lit','game_over']:['lantern_out','game_over']);
});
test.each(['contact','fall'])('W05 no_flames priority at dawn, game_over exactly once (%s)',kind=>{
 const s=fixture();s.time_ticks=1;s.player.flames=1;s.lanterns.forEach(l=>light(l));
 if(kind==='fall')Object.assign(s.player,{x:50,y:-10.1,z:0,light:10});
 else{s.shades=[{...shade({x:0,y:0,z:0,id:'L1'}),state:'chase',x:.2}];}
 step(s);expect(s.status).toBe('lost');expect(s.end_reason).toBe('no_flames');expect(s.score).toBe(0);
 expect(s.events.at(-1)).toEqual({type:'game_over',reason:'no_flames'});
 run(s,2);expect(s.eventLog.filter(e=>e.type==='game_over')).toHaveLength(1);
});
test.each([[0,10],[1,12],[4,18],[5,20],[6,20]])('I01 capacity for %s successes is %s',(n,cap)=>{
 const s=fixture();s.player.successful_lights=n;expect(s.player.capacity).toBe(cap);expect(gameSnapshot(s).player.capacity).toBe(cap);
 s.player.light=cap-1;s.motes=[1,2].map(i=>({id:'M'+i,x:0,y:0,z:0,kind:'random',available:true,ttl:Infinity}));
 step(s);expect(s.player.light).toBe(cap);expect(s.motes.filter(m=>m.available)).toHaveLength(1);
});
test('I01 repeated relights, not distinct lamps, grow capacity to20; refuel does not',()=>{
 const s=fixture(),l=s.lanterns[0];atLamp(s,l,10);
 for(let i=0;i<6;i++){
  s.player.light=i?5:10;interactLantern(s,emit);expect(s.player.successful_lights).toBe(i+1);
  l.fuel_units=1;advanceFuel(s,emit);
 }
 expect(s.player.capacity).toBe(20);expect(l.relit_count).toBe(5);
});
test('I02/C03 canonical merge/defaults: pre-lit excluded, ever_lit derived, count before bag',()=>{
 const o=runScenario({actions:[],scenario:{lanterns:[{id:'L1',lit:true}],player:{successful_lights:3,light:16}}});
 expect(o.state.lanterns).toHaveLength(5);expect(o.state.lanterns[0]).toMatchObject({lit:true,fuel:100,ever_lit:true,relit_count:0});
 expect(o.state.player.capacity).toBe(16);expect(o.state.events).toEqual([{type:'night_start',night:1}]);
 expect(runScenario({actions:[],scenario:{lanterns:[{id:'L1',lit:true}]}}).state.player.capacity).toBe(10);
 expect(runScenario({actions:[],scenario:{lanterns:[]}}).state.lanterns).toHaveLength(5);
});
test('I03 retry/start reset fuel/counters/reason; retain settings and won-night total',()=>{
 const s=fixture();s.campaign.won_scores[1]=895;s.campaign.settings.volume=.3;s.player.successful_lights=5;s.player.light=20;s.terminal_emitted=true;s.end_reason='dawn';
 restartNight(s);expect(s.player.capacity).toBe(10);expect(s.player.successful_lights).toBe(0);expect(s.player.light).toBe(0);
 expect(s.terminal_emitted).toBe(false);expect(s.end_reason).toBe(null);expect(s.campaign.won_scores[1]).toBe(895);
 expect(s.campaign.settings.volume).toBe(.3);expect(s.lanterns.every(l=>l.fuel_units===0&&!l.ever_lit)).toBe(true);
 startNight(s,2);expect(s.time_ticks).toBe(16200);expect(s.player.capacity).toBe(10);
});
test('I03 dynamic inventory carried17 and fall lost20 are valid; theft amount remains3',()=>{
 const steal=runScenario({scenario:{player:{successful_lights:5,light:20},drifters:[{id:'D1',pos:{x:0,y:0,z:0},state:'chase'}]},actions:[{ticks:1}]},2);
 expect(steal.state.events).toContainEqual({type:'drifter_steal',drifter_id:'D1',amount:3,carried:17});
 const fall=runScenario({scenario:{player:{successful_lights:5,light:20,pos:{x:50,y:-11,z:0}}},actions:[{ticks:1}]});
 expect(fall.state.events).toContainEqual({type:'player_hit',source:'fall',lost:20});
});
test('S03 dawn bonus floors raw5999/60, paid once; loss never gets bonus',()=>{
 const s=fixture();s.lanterns.forEach(l=>light(l));s.time_ticks=1;step(s);
 expect(s.score).toBe(895);expect(s.campaign.won_scores[1]).toBe(895);step(s);expect(s.score).toBe(895);
 const lost=fixture();light(lost.lanterns[0]);lost.time_ticks=1;step(lost);expect(lost.score).toBe(0);
 expect(C).not.toHaveProperty('win_time_score_multiplier');
});
test('C01 v1.2 fields and exact tuning delta, off fuel0; rounded lit fuel0 is valid',()=>{
 expect(Object.fromEntries(['fuel_max','fuel_decay_per_s','fuel_per_mote','relight_cost','win_ratio','drain_per_s','low_fuel_threshold','capacity_max'].map(k=>[k,C[k]])))
 .toEqual({fuel_max:100,fuel_decay_per_s:1,fuel_per_mote:10,relight_cost:5,win_ratio:.6,drain_per_s:5,low_fuel_threshold:30,capacity_max:20});
 const s=fixture();light(s.lanterns[0],1);const o={version:'internal-draft-1',state:gameSnapshot(s)};
 expect(o.state.lanterns[0].fuel).toBe(0);expect(()=>validateOutput(o)).not.toThrow();
});
test('C02 snapshot new fields reject missing/null/type/range; inventory uses actual cap',()=>{
 const paths=[['player','capacity'],['lanterns',0,'fuel'],['lanterns',0,'ever_lit'],['lanterns',0,'relit_count']];
 for(const path of paths)for(const value of [undefined,null,{},[], '1']){
  const o=runScenario({actions:[]});let x=o.state;for(const k of path.slice(0,-1))x=x[k];const k=path.at(-1);
  if(value===undefined)delete x[k];else x[k]=value;expect(()=>validateOutput(o)).toThrow();
 }
 for(const [cap,bag,ok]of [[10,11,false],[12,11,true],[20,20,true],[20,21,false]]){
  const o=runScenario({actions:[]});Object.assign(o.state.player,{capacity:cap,light:bag});
  if(ok)expect(()=>validateOutput(o)).not.toThrow();else expect(()=>validateOutput(o)).toThrow();
 }
});
test.each([
 {lanterns:[null]},{lanterns:[{id:'L9',lit:true}]},{lanterns:[{id:'L1'},{id:'L1'}]},
 {lanterns:[{id:'L1',lit:true,fuel:0}]},{lanterns:[{id:'L1',fuel:1}]},
 {lanterns:[{id:'L1',lit:true,ever_lit:false}]},{lanterns:[{id:'L1',lit:true,fuel:29.99}]},
 {lanterns:[{id:'L1',lit:null}]},{lanterns:[{id:'L1',lit:true,fuel:101}]},
 {player:{successful_lights:-1}},{player:{successful_lights:.5}},{player:{successful_lights:0,light:11}},
 {shades:[{pos:{x:0,y:0,z:25},state:'drain'}]},
 {shades:[{pos:{x:0,y:0,z:25},state:'drain',target_lantern_id:'L9'}]}
])('C03 malformed scenario rejected %#',scenario=>expect(()=>runScenario({actions:[],scenario})).toThrow());
const eventFixtures=[
 {type:'refuel',lantern_id:'L1',amount:1,fuel:100},
 {type:'lantern_out',lantern_id:'L1'},
 {type:'fuel_drain',lantern_id:'L1',shade_id:'S1',fuel:20.5},
 {type:'lantern_lit',lantern_id:'L1',relight:false},
 {type:'game_over',reason:'dawn_survived'}
];
test.each(eventFixtures.map(e=>[e.type,e]))('C04/C05 valid/missing/wrong-type payload %s',(name,event)=>{
 expect(()=>validateEvent(event)).not.toThrow();
 for(const k of Object.keys(event).filter(k=>k!=='type'))for(const v of [undefined,null,{},[],typeof event[k]==='boolean'?'false':false]){
  const bad={...event};if(v===undefined)delete bad[k];else bad[k]=v;
  expect(()=>validateEvent(bad)).toThrow('invalid event '+name+'.'+k);
 }
});
test('C04 event numeric bounds/rounding/reasons; unspecified v1.0 payload remains unconstrained',()=>{
 for(const amount of [0,-1,.5,21,NaN,Infinity])expect(()=>validateEvent({type:'refuel',lantern_id:'L1',amount,fuel:100})).toThrow();
 for(const fuel of [-1,101,NaN,Infinity,.01])expect(()=>validateEvent({type:'fuel_drain',lantern_id:'L1',shade_id:'S1',fuel})).toThrow();
 for(const reason of ['all_lit','victory','',1])expect(()=>validateEvent({type:'game_over',reason})).toThrow();
 expect(()=>validateEvent({type:'legacy_unknown',arbitrary:true})).not.toThrow();
});
test('C03 position vectors cannot override inventory or successful_lights through nested keys',()=>{
 const o=runScenario({actions:[],scenario:{player:{pos:{x:1,y:0,z:2,light:20,successful_lights:5,invuln_ticks:90}}}});
 expect(o.state.player).toMatchObject({x:1,y:0,z:2,light:0,capacity:10,invuln:false});
});
test('R01 pause freezes fuel/drain, respawn advances world fuel and blocks interaction',()=>{
 const s=fixture(),l=light(s.lanterns[0],1200);atLamp(s,l,10);s.player.respawn_ticks=60;s.player.fallHandled=true;
 const e=shade(l);s.shades=[e];step(s,{pause:true,interact:true,pulse:true});run(s,61);
 expect(s.sim_tick).toBe(0);expect(l.fuel_units).toBe(1200);expect(e.drain_ticks).toBe(0);
 step(s,{pause:true,interact:true});expect(l.fuel_units).toBe(1194);expect(s.player.light).toBe(10);expect(s.player.respawn_ticks).toBe(59);
});
test('R01 same seed/actions replay is deterministic for fuel events in all three nights',()=>{
 for(const night of [1,2,3]){
  const input={seed:71,scenario:{lanterns:[{id:'L1',lit:true,fuel:29}],wind_enabled:false},actions:[{ticks:240}]};
  expect(runScenario(input,night)).toEqual(runScenario(input,night));
 }
});

test.each([[1205,false],[1206,true],[1207,true]])('A04 exact refuel threshold after natural+drain units=%s', (units,safe)=>{
 const s=fixture(),l=light(s.lanterns[0],units),e=shade(l);s.shades=[e];atLamp(s,l,1);s.player.x+=.5;
 step(s,{interact:true});expect(l.fuel_units).toBe(units-6+600);expect(activeSafeZone(l)).toBe(safe);
 expect(s.player.flames).toBe(safe?3:2);
 if(safe){expect(e.eviction_ticks).toBeLessThanOrEqual(30);expect(Math.hypot(e.x-l.x,e.z-l.z)).toBeGreaterThanOrEqual(6);}
});
test('I01 pickup uses old capacity before lighting, then next tick picks extra mote',()=>{
 const s=fixture(),l=s.lanterns[0];atLamp(s,l,9);
 s.motes=[1,2].map(i=>({id:'M'+i,x:l.x,y:l.y,z:l.z,kind:'random',available:true,ttl:Infinity}));
 step(s,{interact:true});expect(s.player.capacity).toBe(12);expect(s.player.light).toBe(0);
 expect(s.motes.filter(m=>m.available)).toHaveLength(1);step(s);expect(s.player.light).toBe(1);
});
test('S02 mixed drain/stunned/wander pulse sums15+5+5, capture before stun',()=>{
 const s=fixture(),l=light(s.lanterns[0],1200);atLamp(s,l,3);s.player.x=4;
 s.shades=[shade(l,'S1'),{...shade(l,'S2','stunned'),state_ticks_left:50},{...shade(l,'S3','wander')}];
 step(s,{pulse:true});expect(s.score).toBe(25);expect(s.shades.every(e=>e.state==='stunned')).toBe(true);
});
test('S03 low-fuel raw floor and off lamps excluded at dawn',()=>{
 const s=fixture();s.time_ticks=1;light(s.lanterns[0],55);light(s.lanterns[1]);light(s.lanterns[2]);
 s.lanterns[3].ever_lit=true;step(s);expect(s.status).toBe('won');
 expect(s.score).toBe(50+149+149+150); // .9 fuel floors0, two healthy raw fuels floor99
});
test('A06 drain-to-chase resets counter on exact exit tick; no subsequent fuel drain',()=>{
 const s=fixture(),l=light(s.lanterns[0],1200),e=shade(l);s.shades=[e];e.drain_ticks=17;e.drain_target_lantern_id=l.id;
 atLamp(s,l,0);s.player.x+=6;step(s);expect(e.state).toBe('chase');expect(e.drain_ticks).toBe(0);
 expect(l.fuel_units).toBe(1194);step(s);expect(l.fuel_units).toBe(1193);
});
test('C02/C04 malformed snapshot fuel/count/capacity and event references rejected',()=>{
 for(const mutate of [
  o=>o.state.lanterns[0].fuel=1,
  o=>o.state.lanterns[0].fuel=.01,
  o=>o.state.lanterns[0].fuel=NaN,
  o=>o.state.lanterns[0].relit_count=-1,
  o=>o.state.lanterns[0].relit_count=.5,
  o=>o.state.player.capacity=11,
  o=>o.state.events=[{type:'lantern_out',lantern_id:'L404'}],
  o=>o.state.events=[{type:'fuel_drain',lantern_id:'L1',shade_id:'S404',fuel:20}]
 ]){const o=runScenario({actions:[]});mutate(o);expect(()=>validateOutput(o)).toThrow();}
 expect(()=>validateEvent({type:'refuel',lantern_id:'L1',amount:11,fuel:100})).toThrow();
});
test('R01 respawn world fuel advances through 59/60/61 while player controls stay blocked',()=>{
 const s=fixture(),l=light(s.lanterns[0]);Object.assign(s.player,{x:50,y:-11,z:0,light:8,invuln_ticks:90});
 step(s);expect(s.player.respawn_ticks).toBe(60);const before=l.fuel_units;
 run(s,59,{interact:true,pulse:true});expect(s.player.respawn_ticks).toBe(1);expect(l.fuel_units).toBe(before-59);
 step(s);expect(s.player.respawn_ticks).toBe(0);expect(s.player.invuln_ticks).toBe(90);expect(l.fuel_units).toBe(before-60);
 step(s);expect(s.player.invuln_ticks).toBe(89);expect(l.fuel_units).toBe(before-61);
});

test.each([
 [10,11,false],[12,11,true],[20,20,true],[20,21,false]
])('C04 preserve original carried/lost boundary at cap%s value%s', (capacity,value,valid)=>{
 for(const event of [{type:'drifter_steal',drifter_id:'D1',amount:1,carried:value},{type:'player_hit',source:'fall',lost:value}]){
  const o=runScenario({actions:[]});o.state.player.capacity=capacity;o.state.events=[event];
  if(valid)expect(()=>validateOutput(o)).not.toThrow();else expect(()=>validateOutput(o)).toThrow();
 }
});
