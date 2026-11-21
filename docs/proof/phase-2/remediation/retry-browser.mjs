import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
const dir='docs/proof/phase-2/remediation';
for(const f of ['browser-regression.json','browser-verified.log','performance.json'])if(fs.existsSync(`${dir}/${f}`))fs.copyFileSync(`${dir}/${f}`,`${dir}/attempt2-${f}`);
const p=`${dir}/browser-regression.mjs`;let s=fs.readFileSync(p,'utf8');s=s.replace("await new Promise(r=>setTimeout(r,250));report.audioMuted=", "for(let i=0;i<100;i++){const a=await page.evaluate(()=>window.__DAO_LANTERN_AUDIO__());if(a.masterGain<.005)break;await new Promise(r=>setTimeout(r,50));}report.audioMuted=");fs.writeFileSync(p,s);
const out=fs.openSync(`${dir}/browser-verified-final.log`,'w'),r=spawnSync(process.execPath,[p],{stdio:['ignore',out,out],timeout:1200000,windowsHide:true});fs.closeSync(out);console.log(`browser: exit ${r.status}`);if(r.status!==0)process.exitCode=1;
