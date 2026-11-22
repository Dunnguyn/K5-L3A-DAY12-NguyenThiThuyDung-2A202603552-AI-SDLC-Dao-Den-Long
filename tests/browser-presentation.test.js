import {test,expect} from 'vitest';
import {createGame,step,gameSnapshot,restartNight} from '../src/core/game.js';
import {interactionTarget,interactLantern} from '../src/core/fuel.js';
import {browserView,interactionText,normalizeSettings} from '../src/browser/presentation.js';
const emit=(s,type,data)=>{s.events.push({type,...data});};
test('browser selection shares Core eligibility and ID tie, excludes raw-full lanterns',()=>{
 const s=createGame();s.motes=[];s.player.light=2;
 Object.assign(s.lanterns[0],{x:0,z:0,lit:true,ever_lit:true,fuel_units:6000});
 Object.assign(s.lanterns[1],{x:1,z:0});
 const before=gameSnapshot(s),v=browserView(s);
 expect(v.ui.interaction.id).toBe(interactionTarget(s).id);expect(v.ui.interaction.id).toBe('L2');
 expect(gameSnapshot(s)).toEqual(before);interactLantern(s,emit);
 expect(s.lanterns[1].progress).toBe(2);
});
test.each([[1799,false,true],[1800,true,false]])('browser safe/low flags use Core raw units%s despite rounded30.0',(units,safe,low)=>{
 const s=createGame();Object.assign(s.lanterns[0],{lit:true,ever_lit:true,fuel_units:units});
 const l=browserView(s).lanterns[0];expect(l.fuel).toBe(30);expect(l.safe).toBe(safe);expect(l.low).toBe(low);
});
test('full has no prompt, fractional decay refuel is displayed without deriving rules in UI',()=>{
 const s=createGame();s.motes=[];const l=s.lanterns[0];Object.assign(l,{lit:true,ever_lit:true,fuel_units:6000});
 Object.assign(s.player,{x:l.x,y:l.y,z:l.z,light:1});
 expect(browserView(s).ui.interaction).toBeNull();step(s);
 const v=browserView(s);expect(v.ui.interaction).toMatchObject({kind:'refuel',used:1,fuel:100});
 expect(interactionText(v.ui.interaction)).toContain('Châm dầu');
});
test('partial relight prompt uses5, first-light uses10; rendering cannot mutate Core',()=>{
 const s=createGame(),l=s.lanterns[0];Object.assign(l,{ever_lit:true,progress:2});Object.assign(s.player,{x:l.x,z:l.z,light:3});
 const v=browserView(s);expect(v.ui.interaction).toMatchObject({kind:'relight',cost:5,used:3});
 expect(interactionText(v.ui.interaction)).toContain('(2/5)');v.lanterns[0].progress=99;
 expect(l.progress).toBe(2);l.ever_lit=false;expect(browserView(s).ui.interaction.cost).toBe(10);
});
test('Core exposes actual dawn bonus once and resets it; snapshot contract remains unchanged',()=>{
 const s=createGame();s.motes=[];s.lanterns.forEach(l=>Object.assign(l,{lit:true,ever_lit:true,fuel_units:6000}));s.time_ticks=1;
 step(s);expect(browserView(s).ui.dawnBonus).toBe(895);expect(s.score).toBe(895);
 expect(gameSnapshot(s)).not.toHaveProperty('dawn_bonus');step(s);expect(s.dawn_bonus).toBe(895);
 restartNight(s);expect(browserView(s).ui.dawnBonus).toBe(0);
});
test('lightweight browser snapshot preserves default full-history contract and current events',()=>{
 const s=createGame();step(s,{pause:true});step(s,{pause:false});step(s,{pause:true});
 expect(gameSnapshot(s).events.map(e=>e.type)).toEqual(['night_start','paused','resumed']);
 expect(gameSnapshot(s,{history:false}).events.map(e=>e.type)).toEqual(['resumed']);
 const full=gameSnapshot(s),light=gameSnapshot(s,{history:false});delete full.events;delete light.events;expect(light).toEqual(full);
});
test('settings migrate existing volume/sensitivity; palette is persisted Boolean only',()=>{
 expect(normalizeSettings({volume:.37,sensitivity:1.7})).toEqual({volume:.37,sensitivity:1.7,distinguishable:false});
 expect(normalizeSettings({volume:0,sensitivity:.2,distinguishable:true})).toEqual({volume:0,sensitivity:.2,distinguishable:true});
 expect(normalizeSettings({volume:NaN,sensitivity:Infinity,distinguishable:'true'})).toEqual({volume:.55,sensitivity:1,distinguishable:false});
});
