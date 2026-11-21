import {proofDirectory} from './proof-directory.mjs';
import {chromium} from '@playwright/test';
import {spawn} from 'node:child_process';
import {mkdirSync,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {createRouteDriver} from './browser-route.mjs';
const dir=proofDirectory('browser','boundaries');mkdirSync(dir,{recursive:true});
const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','preview','--host','127.0.0.1','--port','4175','--strictPort'],{stdio:'ignore',windowsHide:true});
const report={startedAt:new Date().toISOString(),scope:'Actual-input default Night 1: HUD at 30 seconds, countdown, natural dawn loss, audio event cardinality',checks:[],errors:[]};let browser,page,held=new Set();
const snap=()=>page.evaluate(()=>window.__DAO_LANTERN_SNAPSHOT__());
async function input(a){const next=new Set();if(a.moveX>0)next.add('KeyD');if(a.moveX<0)next.add('KeyA');if(a.moveZ>0)next.add('KeyW');if(a.moveZ<0)next.add('KeyS');if(a.jump)next.add('Space');for(const k of held)if(!next.has(k))await page.keyboard.up(k);for(const k of next)if(!held.has(k))await page.keyboard.down(k);held=next;for(const [k,v]of [['Shift',a.dash],['KeyE',a.interact],['KeyQ',a.pulse]])if(v)await page.keyboard.press(k);}
const photo=name=>page.screenshot({path:`${dir}/${name}.png`});
try{
 for(let i=0;i<80;i++){try{if((await fetch('http://127.0.0.1:4175')).ok)break;}catch{}await new Promise(r=>setTimeout(r,250));}
 browser=await chromium.launch({headless:true,args:['--enable-unsafe-swiftshader']});report.browserVersion=browser.version();page=await browser.newPage({viewport:{width:1280,height:720},deviceScaleFactor:1});page.on('pageerror',e=>report.errors.push(e.message));await page.clock.install();await page.goto('http://127.0.0.1:4175');await page.locator('#start-campaign').click();await page.locator('#enter-night').click();await page.clock.pauseAt(await page.evaluate(()=>Date.now()+100));
 assert.equal(await page.locator('#mote-bar i').count(),10);assert.equal(await page.locator('#flames .flame').count(),3);
 let arrow=false;await page.mouse.move(200,400);await page.mouse.down();for(let i=0;i<6;i++){await page.mouse.move(200+(i+1)*150,400);await page.clock.fastForward(50);if(await page.locator('#arrow').isVisible()){arrow=true;await photo('offscreen-arrow');break;}}await page.mouse.up();assert.ok(arrow,'nearest unlit lamp arrow never appeared');await page.reload();await page.locator('#start-campaign').click();await page.locator('#enter-night').click();await page.clock.fastForward(50);
 const drive=createRouteDriver();let s=await snap(),pulsed=false;await page.keyboard.press('Space');await page.clock.fastForward(50);
 for(let i=0;i<6000&&!s.lanterns.some(l=>l.lit);i++){const a=drive(s);if(!pulsed&&s.player.light>=3){a.pulse=true;pulsed=true;}await input(a);await page.clock.fastForward(50);s=await snap();assert.equal(s.state,'playing');}
 await input({});assert.ok(s.lanterns.some(l=>l.lit));report.safeZoneEntry=s;await photo('lit-safe-zone');
 while(s.time_s>30&&s.state==='playing'){await page.clock.fastForward(500);s=await snap();}assert.equal(s.state,'playing');assert.equal(await page.locator('#clock').textContent(),'00:30');assert.ok(await page.locator('#clock').evaluate(e=>e.classList.contains('danger')&&e.classList.contains('blink')));assert.equal(await page.locator('#clock').evaluate(e=>getComputedStyle(e).color),'rgb(255, 90, 95)');await photo('clock-30-seconds');report.checks.push({id:'HUD clock 00:30 red/blinking, flames, ten slots, nearest-lamp offscreen arrow',status:'PASS'});
 const leaf=await page.evaluate(()=>[...document.styleSheets].flatMap(s=>[...s.cssRules]).find(r=>r.selectorText==='#fx.warning::after')?.style.content);assert.ok(leaf?.includes('\u2767'),'wind warning CSS must contain leaves, not replacement question marks');report.warningLeafContent=leaf;
 while(s.time_s>10&&s.state==='playing'){await page.clock.fastForward(500);s=await snap();}assert.match(await page.locator('#toast').textContent(),/gi\u00e2y tr\u01b0\u1edbc b\u00ecnh minh/);await photo('countdown-10-seconds');
 while(s.state==='playing'){await page.clock.fastForward(500);s=await snap();}assert.equal(s.state,'lost');assert.equal(s.end_reason,'dawn');await photo('natural-dawn-loss');report.final=s;report.audio=await page.evaluate(()=>window.__DAO_LANTERN_AUDIO__());
 assert.equal(report.audio.contextState,'running');assert.equal(report.audio.unlocked,true);assert.equal(report.audio.playing,false);assert.equal(report.audio.eventCounts.countdown,10);assert.equal(report.audio.eventCounts.lose,1);
 const counts={};for(const e of s.events)counts[e.type]=(counts[e.type]??0)+1;for(const type of ['mote_picked','lantern_lit','pulse','jump','dash','player_hit','shade_spawn']){assert.equal(report.audio.eventCounts[type]??0,counts[type]??0,`audio consumed once per tick: ${type}`);}for(const type of ['mote_picked','lantern_lit','pulse','jump','dash','shade_spawn'])assert.ok(counts[type]>0,type);
 report.checks.push({id:'Natural dawn loss, ten countdown cues and once-only audio event consumption',status:'PASS'});assert.deepEqual(report.errors,[]);report.passed=true;
}catch(e){report.passed=false;report.failure=e.stack;process.exitCode=1;if(page)try{report.failureState=await snap();await photo('failure');}catch{}}
finally{report.finishedAt=new Date().toISOString();writeFileSync(`${dir}/boundaries.json`,JSON.stringify(report,null,2)+'\n');await browser?.close();server.kill();console.log(JSON.stringify({passed:report.passed,checks:report.checks,failure:report.failure,dir}));}
