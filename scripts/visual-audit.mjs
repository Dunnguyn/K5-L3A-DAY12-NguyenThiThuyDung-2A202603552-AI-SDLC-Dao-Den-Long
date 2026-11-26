import {mkdir,writeFile,mkdtemp,rm} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {tmpdir} from 'node:os';
import os from 'node:os';
import {createServer} from 'vite';
import {chromium} from '@playwright/test';
import {makeServer} from './start.mjs';
import {createLeaderboardStore} from '../src/server/leaderboard.js';

const phase=process.argv[2];if(!['before','after'].includes(phase))throw Error('usage: node scripts/visual-audit.mjs before|after');
const out=resolve(`docs/proof/visual-remaster/${phase}`);await mkdir(out,{recursive:true});
const profile=await mkdtemp(join(tmpdir(),'dao-visual-audit-'));
let vite,appServer,browser,context;
const report={kind:'actual Chromium screenshots; static Night 1–3 views use initial Core state as visual-only fixtures',phase,os:`${os.type()} ${os.release()} ${process.arch}`,viewport:{width:1280,height:720},screenshots:[],scenes:[],errors:[]};
try{
 vite=await createServer({configFile:false,root:resolve('.'),server:{host:'127.0.0.1',port:0},logLevel:'error',appType:'spa'});await vite.listen();
 const previewBase=`http://127.0.0.1:${vite.httpServer.address().port}`;
 const store=createLeaderboardStore({file:join(profile,'leaderboard.json')});appServer=makeServer({rootDir:resolve('dist'),leaderboard:store});await new Promise(done=>appServer.listen(0,'127.0.0.1',done));const appBase=`http://127.0.0.1:${appServer.address().port}`;
 browser=await chromium.launch({headless:true,args:['--force-device-scale-factor=1']});report.browser=browser.version();context=await browser.newContext({viewport:report.viewport,deviceScaleFactor:1});
 const app=await context.newPage();app.on('pageerror',e=>report.errors.push(String(e)));await app.goto(appBase);await app.locator('#start-campaign').waitFor();
 async function shot(name){await app.screenshot({path:join(out,`${name}.png`)});report.screenshots.push(`${name}.png`);}
 await shot('menu');await app.locator('#open-settings').click();await shot('settings');await app.locator('#settings-back').click();await app.locator('#open-leaderboard').click();await app.locator('#leaderboard-load').waitFor();await shot('leaderboard');await app.locator('#leaderboard-back').click();await app.locator('#start-campaign').click();await shot('night-1-intro');await app.locator('#enter-night').click();await app.waitForTimeout(500);await shot('night-1-hud');report.appMetrics=await app.evaluate(()=>({screen:window.__DAO_LANTERN_SCREEN__(),snapshot:window.__DAO_LANTERN_SNAPSHOT__(false),render:window.__DAO_LANTERN_RENDER_METRICS__()}));await app.keyboard.press('p');await app.locator('#resume').waitFor();await shot('pause');
 for(const n of [1,2,3]){
  const page=await context.newPage();page.on('pageerror',e=>report.errors.push(String(e)));await page.goto(`${previewBase}/scripts/visual-preview.html?night=${n}`);await page.waitForFunction(()=>window.__VISUAL_PREVIEW__?.metrics().frames>10);await page.screenshot({path:join(out,`night-${n}-static.png`)});report.screenshots.push(`night-${n}-static.png`);
  await page.waitForTimeout(5000);const data=await page.evaluate(()=>window.__VISUAL_PREVIEW__.metrics());const glInfo=await page.evaluate(()=>{const gl=document.querySelector('canvas')?.getContext('webgl2');const ext=gl?.getExtension('WEBGL_debug_renderer_info');return ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):gl?.getParameter(gl.RENDERER)??null;});const deltas=data.intervals.slice(2),sorted=[...deltas].sort((a,b)=>b-a),k=Math.max(1,Math.ceil(sorted.length*.01));report.scenes.push({night:n,kind:'render-only static initial Core state, no gameplay FPS claim',renderer:glInfo,frames:data.frames,sample_seconds:deltas.reduce((a,b)=>a+b,0)/1000,avg_fps:deltas.length*1000/deltas.reduce((a,b)=>a+b,0),p1_low_fps:1000/(sorted.slice(0,k).reduce((a,b)=>a+b,0)/k),drawCalls:data.drawCalls,triangles:data.triangles,geometries:data.geometries,textures:data.textures,canvas:data.canvas,visuals:data.visuals});await page.close();
 }
 if(phase==='after')for(const angle of ['front','back','side']){const page=await context.newPage();page.on('pageerror',e=>report.errors.push(String(e)));await page.goto(`${previewBase}/scripts/visual-preview.html?night=1&portrait=${angle}`);await page.waitForFunction(()=>window.__VISUAL_PREVIEW__?.metrics().frames>10);await page.screenshot({path:join(out,`may-${angle}.png`)});report.screenshots.push(`may-${angle}.png`);await page.close();}
 report.passed=report.errors.length===0;
}catch(e){report.passed=false;report.failure=String(e?.stack??e);console.error(report.failure);process.exitCode=1;}
finally{await writeFile(join(out,'audit.json'),JSON.stringify(report,null,2)+'\n');await context?.close().catch(()=>{});await browser?.close().catch(()=>{});if(appServer)await new Promise(done=>appServer.close(done));await vite?.close().catch(()=>{});if(!profile.startsWith(tmpdir()))throw Error('unsafe profile path');await rm(profile,{recursive:true,force:true});console.log(JSON.stringify({phase,passed:report.passed,screenshots:report.screenshots.length,scenes:report.scenes.map(({night,avg_fps,drawCalls})=>({night,avg_fps,drawCalls}))}));}
