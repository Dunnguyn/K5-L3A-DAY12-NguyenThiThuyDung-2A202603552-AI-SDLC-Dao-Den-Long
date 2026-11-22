import {createGame,step,gameSnapshot} from '../src/core/game.js';
const hash=x=>{const t=JSON.stringify(x);let h=2166136261,g=5381;for(let i=0;i<t.length;i++){h=Math.imul(h^t.charCodeAt(i),16777619);g=Math.imul(g,33)^t.charCodeAt(i);}return[(h>>>0),(g>>>0)];};
function observe(s){return{snapshot:gameSnapshot(s,{history:false}),player:s.player,lanterns:s.lanterns,shades:s.shades,drifters:s.drifters,wind:s.wind,previous:s.previous};}
function semantics(s){return{tick:s.tick,sim_tick:s.sim_tick,status:s.status,reason:s.end_reason,score:s.score,dawn_bonus:s.dawn_bonus,player:{x:s.player.x,y:s.player.y,z:s.player.z,vel:s.player.vel,grounded:s.player.grounded,capacity:s.player.capacity,bag:s.player.light,flames:s.player.flames,invuln:s.player.invuln_ticks,respawn:s.player.respawn_ticks,dash:s.player.dash_ticks,pulse:s.player.pulse_cd_ticks,charm:s.player.charm_ticks},events:s.events,lanterns:s.lanterns.map(l=>({id:l.id,lit:l.lit,fuel:l.fuel_units,progress:l.progress,ever:l.ever_lit,relit:l.relit_count})),shades:s.shades.map(e=>({id:e.id,x:e.x,y:e.y,z:e.z,state:e.state,target:e.target_lantern_id,drain:e.drain_ticks,eviction:e.eviction_ticks,left:e.state_ticks_left,push:e.push_ticks})),drifters:s.drifters.map(d=>({id:d.id,x:d.x,y:d.y,z:d.z,state:d.state,stolen:d.stolen,ticks:d.state_ticks_left})),motes:s.motes.map(m=>({id:m.id,available:m.available,ttl:m.ttl})),charms:s.charms.map(c=>({id:c.id,available:c.available,respawn:c.respawn_ticks})),wind:s.wind,terminal:s.terminal_emitted};}
export function runtimeTrace(input,night,at=null,initialOverride=null){
 if(input.scenario!==undefined)throw Error('This diagnostic requires the same default scenario on both runtimes');
 const s=createGame({night,seed:input.seed});
 // Diagnostic fixture only: replay captured initial mote coordinates to make
 // the initial state bit-identical when runtime sin/cos differs by one ULP.
 if(initialOverride)for(const m of s.motes){const q=initialOverride.snapshot.motes.find(q=>q.id===m.id);if(q)Object.assign(m,q.pos);}
 const initial=JSON.parse(JSON.stringify(observe(s))),exact=[],semantic=[];let detail;
 for(const action of input.actions)for(let i=0;i<action.ticks;i++){
  const a={...action,pulse:action.pulse??action.glow};if(i>0)for(const k of ['jump','interact','pulse','glow','restart'])a[k]=false;if(i>0&&action.pause)a.pause=false;
  const before=s.tick===at-1?JSON.parse(JSON.stringify(observe(s))):null;
  step(s,a);
  if(at===null){exact.push(hash(observe(s)));semantic.push(hash(semantics(s)));}
  else if(s.tick===at){detail={action:a,before,after:JSON.parse(JSON.stringify(observe(s)))};return{initial,detail};}
 }
 return{initial,exact,semantic,final:gameSnapshot(s)};
}
