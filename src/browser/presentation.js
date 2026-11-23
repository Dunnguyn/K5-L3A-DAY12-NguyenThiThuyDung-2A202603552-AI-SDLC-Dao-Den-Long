import {gameSnapshot} from '../core/game.js';
import {activeSafeZone,interactionTarget,lanternCost,refuelUse,MAX_FUEL_UNITS} from '../core/fuel.js';
import {tuning} from '../config/game.js';

export const defaults=Object.freeze({volume:.55,sensitivity:1,distinguishable:false});
export function normalizeSettings(x){
 return {volume:Number.isFinite(x?.volume)&&x.volume>=0&&x.volume<=1?x.volume:defaults.volume,
  sensitivity:Number.isFinite(x?.sensitivity)&&x.sensitivity>=.2&&x.sensitivity<=3?x.sensitivity:defaults.sensitivity,
  distinguishable:typeof x?.distinguishable==='boolean'?x.distinguishable:false};
}
// Projection only: gameplay flags/interaction selection come from shared Core selectors.
export function browserView(s){
 const snap=gameSnapshot(s,{history:false}),target=interactionTarget(s),raw=new Map(s.lanterns.map(l=>[l.id,l]));
 const lanterns=snap.lanterns.map(l=>{const r=raw.get(l.id);return {...l,...l.pos,safe:activeSafeZone(r),low:l.lit&&!activeSafeZone(r),full:l.lit&&r.fuel_units===MAX_FUEL_UNITS,cost:lanternCost(r)};});
 const actor=new Map(s.shades.map(e=>[e.id,e]));
 const interaction=target?{id:target.id,kind:target.lit?'refuel':target.ever_lit?'relight':'first',
  fuel:snap.lanterns.find(l=>l.id===target.id).fuel,progress:target.progress,cost:lanternCost(target),
  used:target.lit?refuelUse(target,s.player.light):Math.min(s.player.light,lanternCost(target)-target.progress)}:null;
 return {...snap,name:s.name,status:s.status,lanterns,player:{...snap.player,dashActive:s.player.dash_ticks>0,respawning:s.player.respawn_ticks>0},
  wind:{...snap.wind,warning:s.wind.warning_ticks>0},
  shades:snap.shades.map(e=>({...e,...e.pos,target_lantern_id:actor.get(e.id)?.target_lantern_id??null,eviction_ticks:actor.get(e.id)?.eviction_ticks??0})),
  motes:snap.motes.map(m=>({...m,...m.pos,available:true})),
  drifters:snap.drifters.map(d=>({...d,...d.pos})),
  charms:s.charms.map(c=>({id:c.id,x:c.x,y:c.y,z:c.z,available:c.available})),
  ui:{interaction,requiredLit:Math.ceil(tuning.win_ratio*s.lanterns.length),dawnBonus:s.dawn_bonus??0}};
}
export function interactionText(x,key='E'){
 if(!x)return '';
 if(x.kind==='refuel')return key+' — Châm dầu · '+x.fuel.toFixed(1)+'/100 · dùng '+x.used+' đom đóm';
 return key+' — '+(x.kind==='relight'?'Thắp lại':'Thắp lần đầu')+' ('+x.progress+'/'+x.cost+') · dùng '+x.used+' đom đóm';
}
