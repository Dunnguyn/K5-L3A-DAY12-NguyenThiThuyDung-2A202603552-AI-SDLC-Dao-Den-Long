import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
const dir='docs/proof/phase-2/remediation';
for(let i=0;i<300;i++){const bytes=fs.readFileSync(`${dir}/atomic-progress.log`),log=bytes[0]===255&&bytes[1]===254?bytes.toString('utf16le'):bytes.toString('utf8');if(log.includes('exit'))break;if(i===299)throw Error('Previous browser did not finish');await new Promise(r=>setTimeout(r,2000));}
for(const f of ['browser-regression.json','performance.json','atomic-browser.log'])fs.copyFileSync(`${dir}/${f}`,`${dir}/pre-hud-${f}`);
fs.cpSync(`${dir}/screenshots`,`${dir}/pre-hud-screenshots`,{recursive:true});
fs.writeFileSync(`${dir}/run-acceptance.mjs`,fs.readFileSync(`${dir}/run-render-final.mjs`,'utf8').replaceAll('remediation/regression-render-final','remediation/regression-acceptance'));
let p=`${dir}/final-report.mjs`,s=fs.readFileSync(p,'utf8').replaceAll('regression-render-final','regression-acceptance');s=s.replace('topology, transforms and materials are retained.','topology, transforms and materials are retained. Decorative HUD backdrop blur is removed and unchanged text writes skipped; text, layout and canonical colors remain identical.');fs.writeFileSync(p,s);
for(const[id,args,timeout]of [
 ['acceptance-regression',[`${dir}/run-acceptance.mjs`],1200000],
 ['acceptance-qa-core',[`${dir}/independent-core.mjs`],120000],
 ['acceptance-instrumented-build',['node_modules/vite/bin/vite.js','build','--config',`${dir}/vite.qa.config.mjs`],120000],
 ['acceptance-browser',[`${dir}/browser-regression.mjs`],1200000],
 ['acceptance-boundaries',['scripts/phase2-browser-boundaries.mjs'],1200000]
]){const out=fs.openSync(`${dir}/${id}.log`,'w'),r=spawnSync(process.execPath,args,{stdio:['ignore',out,out],timeout,windowsHide:true,env:{...process.env,PROOF_DIR:`${dir}/final-boundaries`}});fs.closeSync(out);console.log(`${id}: exit ${r.status}`);if(r.status!==0){process.exitCode=1;break;}}
