import {chromium} from '@playwright/test';
import {spawn} from 'node:child_process';
import {writeFileSync} from 'node:fs';
const dir='docs/proof/phase-1/remediation',url='http://127.0.0.1:4190';
const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','--host','127.0.0.1','--port','4190','--strictPort'],{stdio:'ignore'});let browser;
const report={timestamp:new Date().toISOString(),method:'Chromium default headless GPU selection; no SwiftShader flag, no GPU override',errors:[]};
try{for(let i=0;i<60;i++){try{if((await fetch(url)).ok)break;}catch{}await new Promise(r=>setTimeout(r,200));}
 browser=await chromium.launch({headless:true});report.browser=browser.version();const p=await browser.newPage();p.on('pageerror',e=>report.errors.push(e.message));const begin=Date.now();await p.goto(url);await p.getByRole('button',{name:'Bắt đầu hành trình'}).waitFor({timeout:15000});report.loadMs=Date.now()-begin;
 report.gpu=await p.evaluate(()=>{const gl=document.querySelector('canvas').getContext('webgl2');if(!gl)return null;const e=gl.getExtension('WEBGL_debug_renderer_info');return {renderer:e?gl.getParameter(e.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER),vendor:e?gl.getParameter(e.UNMASKED_VENDOR_WEBGL):null,error:gl.getError()};});
 report.hardwareVerified=!!report.gpu&&!/swiftshader|software|llvmpipe/i.test(report.gpu.renderer);
 if(!report.hardwareVerified)report.status='NOT VERIFIED: hardware acceleration not available in tested runtime; retain QA software-only performance sample';
 else {report.status='Hardware renderer detected; further performance sampling required';}
}catch(e){report.status='NOT VERIFIED';report.failure=e.message;}finally{await browser?.close();server.kill();writeFileSync(`${dir}/hardware-probe.json`,JSON.stringify(report,null,2));console.log(JSON.stringify(report));}
