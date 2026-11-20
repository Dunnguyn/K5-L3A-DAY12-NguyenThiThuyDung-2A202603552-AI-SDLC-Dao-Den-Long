import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import { mkdirSync,writeFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','--host','127.0.0.1','--port','4173','--strictPort'],{stdio:'ignore'});
const dir=process.env.PROOF_DIR || 'docs/proof/phase-1';mkdirSync(dir,{recursive:true});let browser;const errors=[],warnings=[];const report={scope:'real Chromium WebGL + user input smoke; not full browser win route',checks:[],errors,warnings};
try{
 for(let i=0;i<60;i++){try{if((await fetch('http://127.0.0.1:4173')).ok)break;}catch{}await new Promise(r=>setTimeout(r,250));}
 browser=await chromium.launch({headless:true,args:['--enable-unsafe-swiftshader']});const page=await browser.newPage({viewport:{width:1280,height:800}});page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());if(m.type()==='warning')warnings.push(m.text());});
 await page.goto('http://127.0.0.1:4173');await page.getByRole('button',{name:'Bắt đầu hành trình'}).waitFor();await page.screenshot({path:`${dir}/browser-start.png`});
 assert.ok(await page.locator('canvas').evaluate(c=>!!c.getContext('webgl2')));report.checks.push('WebGL2 context available');
 await page.getByRole('button',{name:'Bắt đầu hành trình'}).click();await page.keyboard.down('KeyD');await page.waitForTimeout(1800);await page.keyboard.up('KeyD');await page.keyboard.press('Space');await page.waitForTimeout(200);await page.screenshot({path:`${dir}/browser-jump.png`});await page.keyboard.press('KeyE');await page.keyboard.press('KeyQ');await page.waitForTimeout(100);assert.match(await page.locator('#message').textContent(),/ánh sáng|đèn/);report.checks.push('start, move, jump, interaction and glow key events delivered');
 await page.mouse.move(800,500);await page.mouse.down();await page.mouse.move(1000,500,{steps:10});await page.mouse.up();await page.screenshot({path:`${dir}/browser-game.png`});report.checks.push('camera drag and gameplay screenshot');
 await page.getByRole('button',{name:'Chơi lại',exact:true}).waitFor({timeout:60000});assert.match(await page.locator('#summary').textContent(),/Thất bại/);await page.screenshot({path:`${dir}/browser-loss.png`});await page.getByRole('button',{name:'Chơi lại',exact:true}).click();await page.waitForTimeout(100);assert.match(await page.locator('#stats').textContent(),/Sinh mệnh 100\/100.*Đèn 0\/5.*Điểm 0/);report.checks.push('real-time loss and restart reset HUD');assert.deepEqual(errors,[]);report.passed=true;
}catch(e){report.passed=false;report.failure=e.stack;process.exitCode=1;}finally{await browser?.close();server.kill();writeFileSync(`${dir}/browser.json`,JSON.stringify(report,null,2));}console.log(JSON.stringify(report));
