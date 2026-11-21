import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
const dir='docs/proof/phase-2/remediation';
let s=fs.readFileSync(`${dir}/browser-regression.mjs`,'utf8');
s=s.replace("pass('F06 dash retry cleanup');",`pass('F06 dash retry cleanup');await input({dash:true});await advance(50);await page.keyboard.press('Escape');await advance(100);await page.locator('#to-menu').click();assert.ok(!(await page.locator('#fx').getAttribute('class')).includes('dash'));await page.locator('#start-campaign').click();await page.locator('#enter-night').click();await advance(100);pass('F06 dash return-to-menu cleanup');`);
s=s.replace("await photo(`night-${n}-${s.state}`);save();", "assert.ok(!(await page.locator('#fx').getAttribute('class')).includes('dash'),'F06 terminal cleanup');await photo(`night-${n}-${s.state}`);save();");
fs.writeFileSync(`${dir}/browser-regression.mjs`,s);
console.log('Waiting for production regression to finish before isolated FPS samples.');
for(let i=0;i<300;i++){try{const r=JSON.parse(fs.readFileSync(`${dir}/regression-final/existing-test-results.json`,'utf8'));if(r.finishedAt){console.log(`Production regression completed: ${r.passed}`);break;}}catch{}if(i===299)throw Error('Production regression did not finish');await new Promise(r=>setTimeout(r,3000));}
for(const[id,args,timeout]of [['instrumented-build',['node_modules/vite/bin/vite.js','build','--config',`${dir}/vite.qa.config.mjs`],120000],['browser',['docs/proof/phase-2/remediation/browser-regression.mjs'],1200000]]){
 const out=fs.openSync(`${dir}/${id}-final.log`,'w'),r=spawnSync(process.execPath,args,{stdio:['ignore',out,out],timeout,windowsHide:true});fs.closeSync(out);console.log(`${id}: exit ${r.status}`);if(r.status!==0){process.exitCode=1;break;}
}
