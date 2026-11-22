import {test,expect} from 'vitest';
import {createGame,step} from '../src/core/game.js';
function boundaryState(x){const s=createGame({seed:20261202});s.motes=[];s.shades=[{id:'S1',x,y:0,z:24.18756290342025,state:'chase',state_ticks_left:0,eviction_ticks:29,wander_deg:0}];Object.assign(s.lanterns[0],{lit:true,ever_lit:true,fuel_units:6000,progress:10});s.player.z=25;return s;}
test.each([5.944741034233624,5.944741034233625])('safe boundary %s cannot re-arm an eviction timer from projection roundoff',x=>{
 const s=boundaryState(x);for(let i=0;i<29;i++){step(s);expect(s.shades[0].eviction_ticks).toBe(28-i);expect(s.player.flames).toBe(3);}expect(s.shades[0].eviction_ticks).toBe(0);
});
test('a genuinely interior Shade still gets evicted, while the exact boundary does not re-arm',()=>{
 const s=boundaryState(5);s.shades[0].z=25;s.shades[0].eviction_ticks=0;step(s);expect(s.shades[0].eviction_ticks).toBe(29);expect(Math.hypot(s.shades[0].x,s.shades[0].z-25)).toBeCloseTo(6,12);step(s);expect(s.shades[0].eviction_ticks).toBe(28);
});
