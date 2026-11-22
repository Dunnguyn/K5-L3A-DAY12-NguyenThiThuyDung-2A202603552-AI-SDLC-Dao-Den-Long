import assert from 'node:assert/strict';
import os from 'node:os';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {getWorld} from '../src/data/worlds.js';
import {createCampaignDriver} from './phase3-campaign-route.mjs';
import {ensureServer,launch,evidenceDirectory,newPage,enter,snap,visuals,inputController,save} from './phase3-browser-support.mjs';
const dir=evidenceDirectory('performance'),server=await ensureServer(),browser=await launch();
const report={scope:'Native-clock 60s gameplay RAF sampling; real inputs, no Playwright clock installed. Night selection fixtures and stress fixture explicitly recorded.',startedAt:new Date().toISOString(),os:{platform:os.platform(),release:os.release(),arch:os.arch()},browser:browser.version(),viewport:{width:1280,height:720},samples:[],
 sourceHashes:Object.fromEntries(['src/browser/app.js','src/browser/renderer.js','src/browser/app.css','src/core/game.js','src/core/safe-boundary.js','src/core/fuel.js'].map(p=>[p,createHash('sha256').update(readFileSync(p)).digest('hex')]))};
try{
 for(const config of [{night:1,label:'night1-default-entry'},{night:2,label:'night2-fresh-entry'},{night:3,label:'night3-fresh-entry'},{night:3,label:'night3-lit-stress',stress:true}]){
  if(process.env.PERF_NIGHTS&&!process.env.PERF_NIGHTS.split(',').includes(config.label))continue;
  let fixture=config.night===1?null:{night:config.night};
  if(config.stress)fixture={night:3,fullMotes:true,player:{successful_lights:5,light:20},lanterns:getWorld(3).lamps.map(l=>({id:l.id,lit:true,ever_lit:true,fuel_units:6000})),shades:getWorld(3).shadePoints.slice(0,10).map((p,i)=>({id:'S'+(i+1),...p,state:'chase'}))};
  const x=await newPage(browser,fixture,{clock:false,distinguishable:true}),p=x.page;
  const sample={...config,fixture,errors:x.errors,method:'Native requestAnimationFrame deltas plus external Node wall time; real keyboard decisions every ~95ms; no screenshots/GC/other tests during sampling',durationTargetMs:60000};
  report.samples.push(sample);
  try{
   await p.bringToFront();await enter(p);await p.waitForTimeout(600);
   sample.webgl=await p.locator('canvas').evaluate(c=>{const g=c.getContext('webgl2'),e=g.getExtension('WEBGL_debug_renderer_info');return{renderer:e?g.getParameter(e.UNMASKED_RENDERER_WEBGL):'masked',version:g.getParameter(g.VERSION)};});
   sample.initial=await snap(p);sample.initialVisuals=await visuals(p);
   await p.evaluate(()=>{const o={start:performance.now(),last:performance.now(),deltas:[],done:false};window.__PHASE3_FPS__=o;function tick(t){o.deltas.push(t-o.last);o.last=t;if(t-o.start<60000)requestAnimationFrame(tick);else o.done=true;}requestAnimationFrame(tick);});
   const started=Date.now(),drive=createCampaignDriver(),send=inputController(p);let state=await snap(p);
   while(Date.now()-started<62000){
    if(state.state!=='playing')break;
    const pos=state.player,cx=config.night===2?(pos.x<35?0:70):0,radius=config.night===1?33:config.night===2?18:34,angle=Math.atan2(pos.z,pos.x-cx)+.22,dx=cx+radius*Math.cos(angle)-pos.x,dz=radius*Math.sin(angle)-pos.z;
    await send({moveX:Math.abs(dx)>.2?Math.sign(dx):0,moveZ:Math.abs(dz)>.2?Math.sign(dz):0,dash:pos.dash_cd_s===0,jump:state.sim_tick%42<6,pulse:state.shades.some(e=>!['stunned','recoil','spawning'].includes(e.state)&&Math.hypot(e.pos.x-pos.x,e.pos.z-pos.z)<1.8)&&pos.light>=3&&pos.pulse_cd_s===0});await p.waitForTimeout(95);state=await snap(p);
    if(await p.evaluate(()=>window.__PHASE3_FPS__.done))break;
   }
   await send({});
   sample.nodeWallMs=Date.now()-started;sample.measurement=await p.evaluate(()=>{const o=window.__PHASE3_FPS__,ms=o.last-o.start,a=o.deltas.slice().sort((a,b)=>a-b);return{durationMs:ms,frames:o.deltas.length,averageFps:o.deltas.length*1000/ms,averageFrameMs:ms/o.deltas.length,p95FrameMs:a[Math.floor(a.length*.95)],done:o.done};});
   sample.final=state;sample.visuals=await visuals(p);sample.metrics=await p.evaluate(()=>window.__DAO_LANTERN_RENDER_METRICS__());
   sample.playingAtEnd=state.state==='playing';sample.passed=sample.measurement.durationMs>=60000&&sample.measurement.averageFps>=30&&sample.playingAtEnd&&x.errors.length===0;
   await p.screenshot({path:dir+'/'+config.label+'.png'});
   if(config.stress){
    sample.restartTrend=[];
    for(let i=0;i<6;i++){
     await p.keyboard.press('Escape');await p.locator('#retry').waitFor();await p.locator('#retry').click();await p.waitForTimeout(300);
     sample.restartTrend.push(await p.evaluate(()=>({metrics:window.__DAO_LANTERN_RENDER_METRICS__(),heap:performance.memory?.usedJSHeapSize??null})));
    }
    const counts=sample.restartTrend.map(s=>s.metrics.geometries);sample.geometryTrendBounded=Math.max(...counts)-Math.min(...counts)<=2;
   }
  }catch(e){sample.passed=false;sample.failure=e.stack;}
  finally{await x.context.close();save(dir+'/performance.json',report);console.log(JSON.stringify({label:sample.label,passed:sample.passed,measurement:sample.measurement,failure:sample.failure}));}
 }
 report.passed=report.samples.every(s=>s.passed);report.realGPUVerified=false;report.audioListening='NOT VERIFIED';
}finally{report.finishedAt=new Date().toISOString();save(dir+'/performance.json',report);await browser.close();server?.kill();console.log(JSON.stringify({directory:dir,passed:report.passed}));}
