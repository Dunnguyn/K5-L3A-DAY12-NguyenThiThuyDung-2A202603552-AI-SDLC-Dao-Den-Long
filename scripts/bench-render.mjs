import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import os from 'node:os';
import { createServer } from 'vite';
import { chromium } from '@playwright/test';
import { parseBenchArgs } from '../src/benchmark/cli.js';
import { computeBenchmarkMetrics, validateBenchmarkResult } from '../src/benchmark/metrics.js';

let browser,server;
try {
  const args=parseBenchArgs(process.argv.slice(2));
  server=await createServer({configFile:false,root:resolve(fileURLToPath(new URL('..',import.meta.url))),server:{host:'127.0.0.1',port:0},logLevel:'error',appType:'spa'});
  await server.listen();const address=server.httpServer.address(),url=`http://127.0.0.1:${address.port}/?benchmark=1&seed=${args.seed}&duration=${args.duration}`;
  browser=await chromium.launch({headless:false,args:['--window-size=1280,720','--force-device-scale-factor=1','--disable-frame-rate-limit','--disable-gpu-vsync']});
  const context=await browser.newContext({viewport:{width:1280,height:720},deviceScaleFactor:1});const page=await context.newPage();let browserError=null;
  page.on('pageerror',e=>{browserError=e;});await page.goto(url,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.__DAO_BENCH__?.firstRendered===true,null,{timeout:60000});
  const load_ms=process.uptime()*1000-(await page.evaluate(()=>performance.now()-window.__DAO_BENCH__.loadMarker));
  const boot=await page.evaluate(()=>window.__DAO_BENCH_BOOT__);
  if(!boot||boot.viewport.width!==1280||boot.viewport.height!==720||boot.canvas.width!==1280||boot.canvas.height!==720||Math.abs(boot.camera.x-30)>.01||Math.abs(boot.camera.y-15)>.01||Math.abs(boot.camera.z)>.01)throw new Error(`benchmark initial viewport/camera mismatch: ${JSON.stringify(boot)}`);
  await page.waitForFunction(()=>window.__DAO_BENCH__?.done===true,null,{timeout:(args.duration+60)*1000});
  if(browserError)throw browserError;
  const scene=await page.evaluate(()=>window.__DAO_BENCH__);
  if(scene.viewport.width!==1280||scene.viewport.height!==720||scene.canvas.width!==1280||scene.canvas.height!==720||scene.fullscreen)throw new Error(`benchmark viewport/canvas/fullscreen mismatch: ${JSON.stringify(scene)}`);
  if(scene.shadeCount!==200||scene.shadeStates.length!==1||scene.shadeStates[0]!=='wander'||scene.moteCount!==100||scene.player.x!==0||scene.player.y!==0||scene.player.z!==0||scene.status!=='playing'||scene.score!==0||scene.flames!==3||scene.time_ticks!==14400)throw new Error(`benchmark scene invariant failed: ${JSON.stringify(scene)}`);
  if(!scene.lanterns.filter(x=>['L1','L2','L3'].includes(x.id)).every(x=>x.lit&&x.fuel===100))throw new Error('benchmark lantern invariant failed');
  if(scene.cameraSamples.length<5)throw new Error(`missing camera orbit checkpoints: ${scene.cameraSamples.length}`);
  const angle=p=>Math.atan2(-p.z,p.x),a0=angle(scene.cameraSamples[0]),a1=angle(scene.cameraSamples[1]),delta=(a1-a0+2*Math.PI)%(2*Math.PI);
  if(Math.abs(delta-Math.PI/2)>.08)throw new Error(`camera did not orbit CCW at the specified period: ${JSON.stringify(scene.cameraSamples.slice(0,2))}`);
  const metrics=computeBenchmarkMetrics(scene.deltas);
  const glInfo=await page.evaluate(()=>{const canvas=document.querySelector('#scene canvas'),gl=canvas?.getContext('webgl2')??canvas?.getContext('webgl');if(!gl)return'WebGL renderer unavailable';const ext=gl.getExtension('WEBGL_debug_renderer_info');return ext?`${gl.getParameter(ext.UNMASKED_VENDOR_WEBGL)} ${gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)}`:gl.getParameter(gl.RENDERER);});
  const result={contract_version:'1.3',...metrics,load_ms,peak_mem_mb:null,vsync_off:false,renderer:`Chromium ${browser.version()} via Playwright; ${glInfo}; browser process RSS unavailable; vsync disable flags requested but not verified`,os:`${os.type()} ${os.release()} ${process.arch}`};
  if(!validateBenchmarkResult(result))throw new Error(`invalid benchmark JSON result: ${JSON.stringify(result)}`);
  await writeFile(resolve(args.out),JSON.stringify(result,null,2)+'\n');
  await writeFile(resolve(args.out+'.scene.json'),JSON.stringify({seed:args.seed,requested_duration_s:args.duration,warmup_s:3,windowed:!scene.fullscreen,viewport:scene.viewport,canvas:scene.canvas,outer_window:scene.outer,boot,camera_samples:scene.cameraSamples,shade_count:scene.shadeCount,shade_states:scene.shadeStates,mote_count:scene.moteCount,lanterns:scene.lanterns,player:scene.player,status:scene.status,score:scene.score,flames:scene.flames,time_ticks:scene.time_ticks,frames:metrics.frames,sampled_delta_sum_ms:scene.deltas.reduce((a,b)=>a+b,0),sampled_deltas_ms:scene.deltas,renderer:result.renderer,os:result.os,load_ms,vsync_off:result.vsync_off,peak_mem_mb:result.peak_mem_mb},null,2)+'\n');
  console.log(JSON.stringify({result,scene:{viewport:scene.viewport,outer:scene.outer,canvas:scene.canvas,shadeCount:scene.shadeCount,moteCount:scene.moteCount,camera:scene.camera}},null,2));
  await context.close();
} catch(error) { console.error(error?.stack??String(error));process.exitCode=1; }
finally { if(browser)await browser.close().catch(()=>{});if(server)await server.close().catch(()=>{}); }
