import { describe,it,expect } from 'vitest';
import { spawnSync } from 'node:child_process';
import { parseBenchArgs,parseSoakArgs } from '../src/benchmark/cli.js';
import { benchmarkCameraPose,computeBenchmarkMetrics,makeSeededRandom,soakDirections,sampleFrameInterval,validateBenchmarkResult } from '../src/benchmark/metrics.js';
import { createBenchmarkGame,stepBenchmarkWander } from '../src/core/game.js';
import { nextSoakInput,runSoak,soakAccepted } from '../src/benchmark/soak.js';
import { tuning,physics } from '../src/config/game.js';
import { terrainHeight,worlds } from '../src/data/worlds.js';

it('keeps terrain support selection identical at sampled island, bridge, and ramp edges',()=>{
 const reference=(n,x,z,previousY)=>{const w=worlds[n],heights=[];for(const s of w.surfaces){if(s.type==='disk'&&Math.hypot(x-s.x,z-s.z)<=s.r+1e-8)heights.push(s.y);if(s.type==='annulus'){const r=Math.hypot(x-s.x,z-s.z);if(r>=s.rmin-1e-8&&r<=s.r+1e-8&&(!s.zPositive||z>0))heights.push(s.y);}if(s.type==='rect'&&x>=s.x1&&x<=s.x2&&z>=s.z1&&z<=s.z2)heights.push(s.y);}if(n===3)for(const q of w.ramps){const ux=Math.cos(q.angle),uz=Math.sin(q.angle),along=x*ux+z*uz,cross=Math.abs(-x*uz+z*ux);if(along>=q.r1&&along<=q.r0&&cross<=q.width/2){const t=(q.r0-along)/(q.r0-q.r1);heights.push(q.y0+t*(q.y1-q.y0));}}const support=heights.filter(y=>y<=previousY+physics.supportTolerance);return support.length?Math.max(...support):null;};
 for(let n=1;n<=3;n++)for(let x=-50;x<=100;x+=2.5)for(let z=-50;z<=50;z+=2.5)for(const y of [-11,-.1,0,2.9,3,5.9,6,20])expect(terrainHeight(n,x,z,y)).toBe(reference(n,x,z,y));
});

describe('Phase 4 CLI parsing',()=>{
 it('accepts valid benchmark and soak flags',()=>{expect(parseBenchArgs(['--seed','42','--duration','30','--out','a.json'])).toEqual({seed:42,duration:30,out:'a.json'});expect(parseSoakArgs(['--seed','7','--nights','10','--out','b.json'])).toEqual({seed:7,nights:10,out:'b.json'});});
 it.each([[],['--seed','-1','--duration','1','--out','x'],['--seed','1','--duration','1.5','--out','x'],['--seed','1','--duration','1','--out','x','--seed','2'],['--seed','1','--duration','1','--out','x','junk']])('rejects malformed benchmark flags %j',a=>expect(()=>parseBenchArgs(a)).toThrow());
 it('rejects invalid soak fields',()=>expect(()=>parseSoakArgs(['--seed','7','--nights','0','--out','x'])).toThrow());
 it('returns a nonzero CLI exit for malformed runner flags',()=>{for(const script of ['scripts/bench-render.mjs','scripts/soak.mjs']){const r=spawnSync(process.execPath,[script,'--seed','-1','--out','unused.json'],{encoding:'utf8'});expect(r.status).toBe(1);expect(r.stderr).toContain('flag');}});
});
describe('Benchmark scene and camera',()=>{
 it('creates exact seeded scene and evenly distributes Shades inside Night 1',()=>{const a=createBenchmarkGame({seed:42}),b=createBenchmarkGame({seed:42}),c=createBenchmarkGame({seed:43});expect(a.shades).toHaveLength(200);expect(a.shades.every(x=>x.state==='wander'&&Math.hypot(x.x,x.z)<=38)).toBe(true);expect(a.motes).toHaveLength(100);expect(a.lanterns.filter(x=>['L1','L2','L3'].includes(x.id)).every(x=>x.lit&&x.fuel_units===6000)).toBe(true);expect(a.player).toMatchObject({x:0,y:0,z:0});expect(a.shades.map(x=>[x.x,x.z])).toEqual(b.shades.map(x=>[x.x,x.z]));expect(a.shades[0].x).not.toBe(c.shades[0].x);});
 it('runs shared Wander movement and keeps benchmark Shades wandering',()=>{const s=createBenchmarkGame({seed:42}),before=s.shades.map(x=>[x.x,x.z]);stepBenchmarkWander(s);expect(s.shades.every(x=>x.state==='wander')).toBe(true);expect(s.shades.some((x,i)=>x.x!==before[i][0]||x.z!==before[i][1])).toBe(true);expect(s.sim_tick).toBe(1);});
 it('uses a 15 second CCW orbit at radius 30 and height 15',()=>{const a=benchmarkCameraPose(0),q=benchmarkCameraPose(3750),b=benchmarkCameraPose(15000);expect(a).toMatchObject({x:30,y:15,z:0});expect(q.z).toBeLessThan(0);expect(Math.hypot(q.x,q.z)).toBeCloseTo(30);expect(b.x).toBeCloseTo(30);expect(b.z).toBeCloseTo(0);});
 it('uses only declared Night 1 standard tuning',()=>expect(tuning.tick_rate).toBe(60));
});
describe('Benchmark measurement formulas',()=>{
 it('handles N=1 and uneven deltas exactly',()=>{expect(computeBenchmarkMetrics([20])).toEqual({avg_fps:50,p1_low_fps:50,frame_ms_p95:20,frames:1});const m=computeBenchmarkMetrics([10,20,30,40]);expect(m.avg_fps).toBeCloseTo(40);expect(m.p1_low_fps).toBe(25);expect(m.frame_ms_p95).toBe(40);});
 it('uses nearest-rank p95',()=>{expect(computeBenchmarkMetrics(Array.from({length:20},(_,i)=>i+1)).frame_ms_p95).toBe(19);});
 it('rejects empty and invalid frame intervals',()=>{expect(()=>computeBenchmarkMetrics([])).toThrow();expect(()=>computeBenchmarkMetrics([0,2])).toThrow();});
 it('excludes warmup and clips samples to the exact requested duration',()=>{expect(sampleFrameInterval(0,15,10,40)).toBe(5);expect(sampleFrameInterval(15,25,10,40)).toBe(10);expect(sampleFrameInterval(35,45,10,40)).toBe(5);expect(sampleFrameInterval(40,50,10,40)).toBeNull();});
 it('validates required benchmark JSON fields and types',()=>{const good={contract_version:'1.3',avg_fps:60,p1_low_fps:30,frame_ms_p95:20,frames:30,load_ms:900,peak_mem_mb:null,vsync_off:false,renderer:'Chromium/WebGL',os:'win32 x64'};expect(validateBenchmarkResult(good)).toBe(true);expect(validateBenchmarkResult({...good,frames:0})).toBe(false);expect(validateBenchmarkResult({...good,vsync_off:'false'})).toBe(false);});
});
describe('Soak seeded input and same-process runner',()=>{
 it('provides eight normalized directions and reproducible draws',()=>{expect(soakDirections).toHaveLength(8);expect(soakDirections.every(([x,z])=>Math.abs(Math.hypot(x,z)-1)<1e-12)).toBe(true);const a=makeSeededRandom(7),b=makeSeededRandom(7);expect(Array.from({length:20},a)).toEqual(Array.from({length:20},b));const rng=makeSeededRandom(9),dir={value:null},one=nextSoakInput(rng,1,dir),two=nextSoakInput(makeSeededRandom(9),1,{value:null});expect(one).toEqual(two);});
 it('changes heading at ticks 1 and 31 and passes button levels without adding edges',()=>{const values=[0,...Array(8).fill(.5),.75,.049,.029,.019,.099],next=()=>values.shift()??.5,dir={value:null};const t1=nextSoakInput(next,1,dir),t2=nextSoakInput(next,2,dir),t31=nextSoakInput(next,31,dir);expect([t1.moveX,t1.moveZ]).toEqual([0,1]);expect([t2.moveX,t2.moveZ]).toEqual([0,1]);expect([t31.moveX,t31.moveZ]).toEqual([-1,0]);expect(t31).toMatchObject({jump:true,dash:true,pulse:true,interact:true});});
 it('completes a one-night run, reports the actual outcome, RSS, and one PID',async()=>{const p=process.pid,{output,trace}=await runSoak({seed:7,nights:1,rss:(()=>{let n=0;return()=>++n===1?100:110;})()});expect(process.pid).toBe(p);expect(output.nights).toBe(1);expect(output.crashes).toBe(0);expect(output.results).toHaveLength(1);expect(['won','lost']).toContain(output.results[0]);expect(output.mem_start_mb).toBe(100);expect(output.mem_end_mb).toBe(110);expect(trace[0].pid).toBe(p);expect(trace[0].seed).toBe(7);expect(trace[0].night).toBe(1);});
 it('rotates nights and increments seeds without changing process',async()=>{const pid=process.pid,{output,trace}=await runSoak({seed:40,nights:3,rss:()=>100});expect(output.results).toHaveLength(3);expect(trace.map(x=>[x.night,x.seed])).toEqual([[1,40],[2,41],[3,42]]);expect(trace.every(x=>x.pid===pid)).toBe(true);});
 it('applies the exact 1.2 RSS threshold and full-result/no-crash checks',()=>{const base={nights:10,crashes:0,results:Array(10).fill('lost'),mem_start_mb:100,mem_end_mb:120};expect(soakAccepted(base)).toBe(true);expect(soakAccepted({...base,mem_end_mb:120.01})).toBe(false);expect(soakAccepted({...base,crashes:1})).toBe(false);expect(soakAccepted({...base,results:base.results.slice(1)})).toBe(false);});
});
