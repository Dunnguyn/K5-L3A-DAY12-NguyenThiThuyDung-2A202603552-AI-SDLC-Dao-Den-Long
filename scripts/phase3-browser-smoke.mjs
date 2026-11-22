import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
const dir=JSON.parse(readFileSync('docs/notes/phase-3-browser-run.json','utf8')).directory;
const browser=await chromium.launch({headless:true,args:['--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:1280,height:720},deviceScaleFactor:1}),errors=[];
page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
let report={kind:'browser smoke, no fixtures',checks:[],errors};
try{
 await page.clock.install();await page.goto('http://127.0.0.1:4175');await page.locator('#start-campaign').waitFor();
 await page.locator('#open-settings').click();await page.locator('#distinguishable').check();await page.locator('#settings-back').click();
 await page.reload();await page.locator('#open-settings').click();assert.equal(await page.locator('#distinguishable').isChecked(),true);
 await page.screenshot({path:dir+'/settings.png'});await page.locator('#settings-back').click();report.checks.push('palette persistence');
 await page.locator('#start-campaign').click();await page.locator('#enter-night').click();await page.clock.pauseAt(await page.evaluate(()=>Date.now()+100));
 for(let i=0;i<12;i++)await page.clock.fastForward(100);
 await page.keyboard.down('KeyD');await page.keyboard.press('Shift');for(let i=0;i<8;i++)await page.clock.fastForward(100);await page.keyboard.up('KeyD');
 const s=await page.evaluate(()=>window.__DAO_LANTERN_SNAPSHOT__());assert.equal(s.player.capacity,10);
 assert.equal(await page.locator('#mote-bar i').count(),10);
 const v=await page.evaluate(()=>window.__DAO_LANTERN_VISUALS__());assert.equal(v.eyes,'#00b3ff');assert.equal(v.edge,'#00b3ff');
 assert.ok(v.lamps.every(l=>l.cageScaleY===.8&&l.tornVisible));
 await page.screenshot({path:dir+'/night1-hud.png'});report.state=s;report.visuals=v;report.checks.push('Core view, dynamic slots, outline/eyes and off silhouette');
 await page.keyboard.press('KeyP');await page.clock.fastForward(100);const a=await page.evaluate(()=>window.__DAO_LANTERN_SNAPSHOT__());await page.clock.fastForward(300);const b=await page.evaluate(()=>window.__DAO_LANTERN_SNAPSHOT__());assert.equal(a.sim_tick,b.sim_tick);
 report.checks.push('pause freeze');assert.deepEqual(errors,[]);report.passed=true;
}catch(e){report.passed=false;report.failure=e.stack;process.exitCode=1;try{await page.screenshot({path:dir+'/smoke-failure.png'});}catch{}}
finally{writeFileSync(dir+'/smoke.json',JSON.stringify(report,null,2)+'\n');await browser.close();console.log(JSON.stringify({passed:report.passed,failure:report.failure,errors,checks:report.checks}));}
