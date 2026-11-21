import fs from 'node:fs';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
const dir='docs/proof/phase-2/remediation',qa='docs/proof/phase-2/qa';
fs.mkdirSync(dir,{recursive:true});
const files=[];
function scan(p){for(const e of fs.readdirSync(p,{withFileTypes:true})){const f=`${p}/${e.name}`;if(e.isDirectory())scan(f);else files.push({path:f,sha256:crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex')});}}
for(const p of ['docs/requirements','docs/proof/phase-1',qa])scan(p);
const git=args=>spawnSync('git',args,{encoding:'utf8',maxBuffer:32e6}).stdout;
fs.writeFileSync(`${dir}/before.json`,JSON.stringify({timestamp:new Date().toISOString(),head:git(['rev-parse','HEAD']).trim(),tag:git(['rev-parse','phase-1^{commit}']).trim(),status:git(['status','--short','--branch']),protectedFiles:files},null,2));
fs.writeFileSync(`${dir}/baseline.diff`,git(['diff','--binary']));
for(const name of ['independent-core.mjs','run-existing.mjs','browser-independent.mjs','vite.qa.config.mjs']){
 const original=fs.readFileSync(`${qa}/${name}`,'utf8');
 fs.writeFileSync(`${dir}/${name}`,original.replaceAll('docs/proof/phase-2/qa',dir));
}
console.log(JSON.stringify({protectedFiles:files.length,copies:'QA tests copied verbatim except output/build directory redirection; original assertions unchanged'}));
