import {readFileSync,readdirSync,mkdirSync,writeFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import assert from 'node:assert/strict';
const root=process.env.RELEASE_DIR;assert.ok(root);const report=JSON.parse(readFileSync('docs/proof/phase-3/browser/run-2026-11-21T13-19-33-241Z/e2e-2026-11-21T16-46-11-480Z/browser-e2e.json','utf8'));
const dir=root+'/inputs/default-headless-release-'+Date.now();mkdirSync(dir,{recursive:true});
for(const n of [1,2,3]){
 const candidates=readdirSync(root+'/inputs').filter(p=>p.startsWith('default-headless-')&&!p.includes('release-')).sort().reverse().map(p=>root+'/inputs/'+p+'/night-'+n+'.input.json');candidates.push(report.nights.find(x=>x.night===n).inputFile);
 let found=false;for(const p of candidates){let input;try{input=JSON.parse(readFileSync(p,'utf8'));}catch{continue;}assert.equal(input.scenario,undefined);const r=spawnSync(process.execPath,['scripts/headless.mjs','--night',String(n),p],{encoding:'utf8',maxBuffer:16e6,timeout:30000});if(r.status!==0)continue;const s=JSON.parse(r.stdout).state;if(s.state!=='won')continue;
 writeFileSync(dir+'/night-'+n+'.input.json',JSON.stringify(input,null,2)+'\n');writeFileSync(dir+'/night-'+n+'.actual.json',JSON.stringify(s,null,2)+'\n');writeFileSync(dir+'/night-'+n+'.source.json',JSON.stringify({source:p,command:['node','scripts/headless.mjs','--night',String(n),p],exitCode:r.status,scenario:null},null,2)+'\n');console.log(JSON.stringify({night:n,score:s.score,lit:s.lanterns.filter(l=>l.lit).length,path:dir}));found=true;break;}assert.ok(found,'No revalidated legal winning input for night '+n);
}
