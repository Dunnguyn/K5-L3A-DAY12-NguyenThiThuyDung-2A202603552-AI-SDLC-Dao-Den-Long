import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
const dir='docs/proof/phase-2/remediation';
// Preserve all under-target samples; the current functional campaign was successful.
for(const f of ['browser-regression.json','performance.json'])fs.copyFileSync(`${dir}/${f}`,`${dir}/pre-instancing-${f}`);
const src=fs.readFileSync(`${dir}/run-verified.mjs`,'utf8').replaceAll('remediation/regression-verified','remediation/regression-render-final');fs.writeFileSync(`${dir}/run-render-final.mjs`,src);
let p=`${dir}/final-report.mjs`,s=fs.readFileSync(p,'utf8').replaceAll('regression-verified','regression-render-final');s=s.replace("assert.ok(samples.length>=2&&samples.every(s=>s.valid));","assert.ok(samples.length>=2&&samples.every(s=>s.valid&&s.target30),'Fresh Night3 software-render samples must meet30FPS');");s=s.replace('prevent dash selector overriding warning/wind/pulse/hurt.','prevent dash selector overriding warning/wind/pulse/hurt. Night3 identical shade body/eye meshes are instanced after correct visible FX exposed under-target software FPS; topology, transforms and materials are retained.');s=s.replace("'src/browser/app.js; src/browser/app.css'","'src/browser/app.js; src/browser/app.css; src/browser/renderer.js'");fs.writeFileSync(p,s);
for(const[id,args,timeout]of [['render-regression',[`${dir}/run-render-final.mjs`],1200000],['instrumented-render-build',['node_modules/vite/bin/vite.js','build','--config',`${dir}/vite.qa.config.mjs`],120000],['render-browser',[`${dir}/browser-regression.mjs`],1200000]]){
 const out=fs.openSync(`${dir}/${id}.log`,'w'),r=spawnSync(process.execPath,args,{stdio:['ignore',out,out],timeout,windowsHide:true});fs.closeSync(out);console.log(`${id}: exit ${r.status}`);if(r.status!==0){process.exitCode=1;break;}
}
