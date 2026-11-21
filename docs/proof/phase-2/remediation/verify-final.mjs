import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
const dir='docs/proof/phase-2/remediation';
fs.writeFileSync(`${dir}/interrupted-accepted-run.json`,JSON.stringify({timestamp:new Date().toISOString(),status:'INTERRUPTED — NOT PASS',reason:'Stopped only run-accepted.mjs process tree after observing deterministic old Night1 driver losses. Logs/artifacts retained; driver final headless proof now wins all three nights. New verification runs all required commands again.'},null,2));
fs.writeFileSync(`${dir}/run-verified.mjs`,fs.readFileSync(`${dir}/run-accepted.mjs`,'utf8').replaceAll('remediation/regression-accepted','remediation/regression-verified'));
fs.writeFileSync(`${dir}/final-report.mjs`,fs.readFileSync(`${dir}/final-report.mjs`,'utf8').replaceAll('regression-accepted','regression-verified'));
for(const[id,args,timeout]of [
 ['all-regression',[`${dir}/run-verified.mjs`],1200000],
 ['qa-core-final',[`${dir}/independent-core.mjs`],120000],
 ['instrumented-build-verified',['node_modules/vite/bin/vite.js','build','--config',`${dir}/vite.qa.config.mjs`],120000],
 ['browser-verified',[`${dir}/browser-regression.mjs`],1200000]
]){const out=fs.openSync(`${dir}/${id}.log`,'w'),r=spawnSync(process.execPath,args,{stdio:['ignore',out,out],timeout,windowsHide:true});fs.closeSync(out);console.log(`${id}: exit${r.status}`);if(r.status!==0){process.exitCode=1;break;}}
