import {chromium} from '@playwright/test';
import {spawn} from 'node:child_process';
import fs from 'node:fs';
import {createRouteDriver} from '../../../../scripts/browser-route.mjs';
const dir='docs/proof/phase-2/remediation';
const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','preview','--config',`${dir}/vite.qa.config.mjs`,'--port','4182','--strictPort'],{stdio:'ignore',windowsHide:true});
let browser;const report={timestamp:new Date().toISOString(),method:'Actual Chromium inputs; read-only observations; before production edits'};
try{
 for(let i=0;i<80;i++){try{if((await fetch('http://localhost:4182')).ok)break;}catch{}await new Promise(r=>setTimeout(r,200));}
 browser=await chromium.launch({headless:true,args:['--enable-unsafe-swiftshader']});const page=await browser.newPage({viewport:{width:1280,height:720}});await page.goto('http://localhost:4182');await page.clock.install();await page.locator('#start-campaign').click();await page.locator('#enter-night').click();await page.clock.pauseAt(await page.evaluate(()=>Date.now()+100));
 await page.keyboard.press('Shift');await page.clock.fastForward(1000);
 report.F06=await page.locator('#fx').evaluate(e=>({classes:e.className,animation:getComputedStyle(e).animationName,opacity:getComputedStyle(e).opacity}));
 const drive=createRouteDriver();let held=new Set(),s;
 for(let i=0;i<1000;i++){s=await page.evaluate(()=>window.__DAO_LANTERN_SNAPSHOT__());if(s.lanterns.some(l=>!l.lit&&l.progress>0))break;const a=drive(s),next=new Set();if(a.moveX>0)next.add('KeyD');if(a.moveX<0)next.add('KeyA');if(a.moveZ>0)next.add('KeyW');if(a.moveZ<0)next.add('KeyS');if(a.jump)next.add('Space');for(const k of held)if(!next.has(k))await page.keyboard.up(k);for(const k of next)if(!held.has(k))await page.keyboard.down(k);held=next;for(const[k,v]of [['Shift',a.dash],['KeyE',a.interact],['KeyQ',a.pulse]])if(v)await page.keyboard.press(k);await page.clock.fastForward(100);}
 const partial=s.lanterns.find(l=>!l.lit&&l.progress>0);report.F07={partial,material:partial?await page.evaluate(id=>window.__QA_RENDER_OBSERVE__().lamps.find(l=>l.id===id),partial.id):null};
 fs.mkdirSync(`${dir}/screenshots`,{recursive:true});await page.screenshot({path:`${dir}/screenshots/before-partial.png`});
}catch(e){report.error=e.stack;process.exitCode=1;}finally{fs.writeFileSync(`${dir}/before-browser.json`,JSON.stringify(report,null,2));await browser?.close();server.kill();console.log(JSON.stringify(report));}
