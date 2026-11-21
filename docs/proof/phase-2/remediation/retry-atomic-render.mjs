import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
const dir='docs/proof/phase-2/remediation';
for(const f of ['browser-regression.json','render-browser.log','performance.json'])fs.copyFileSync(`${dir}/${f}`,`${dir}/non-atomic-${f}`);
fs.cpSync(`${dir}/screenshots`,`${dir}/non-atomic-screenshots`,{recursive:true});
const p=`${dir}/browser-regression.mjs`;let s=fs.readFileSync(p,'utf8');s=s.replace('const render=await page.evaluate(()=>window.__QA_RENDER_OBSERVE__());',"const {render,observedState}=await page.evaluate(()=>({render:window.__QA_RENDER_OBSERVE__(),observedState:window.__DAO_LANTERN_SNAPSHOT__()}));s=observedState;");fs.writeFileSync(p,s);
const out=fs.openSync(`${dir}/atomic-browser.log`,'w'),r=spawnSync(process.execPath,[p],{stdio:['ignore',out,out],timeout:1200000,windowsHide:true});fs.closeSync(out);console.log(`atomic browser: exit ${r.status}`);if(r.status!==0)process.exitCode=1;
