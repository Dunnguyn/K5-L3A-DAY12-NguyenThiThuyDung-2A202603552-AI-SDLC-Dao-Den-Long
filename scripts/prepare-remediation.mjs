import {readFileSync,writeFileSync,mkdirSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
const base='docs/proof/phase-1',dir=`${base}/remediation`;mkdirSync(dir,{recursive:true});
const hashes={};function walk(path){for(const f of readdirSync(path,{withFileTypes:true})){const p=`${path}/${f.name}`;if(f.isDirectory())walk(p);else hashes[p]=createHash('sha256').update(readFileSync(p)).digest('hex');}}walk(`${base}/qa`);
writeFileSync(`${dir}/qa-original-hashes.json`,JSON.stringify(hashes,null,2));
for(const file of ['independent.mjs','browser-acceptance.mjs'])writeFileSync(`${dir}/${file}`,readFileSync(`${base}/qa/${file}`,'utf8').replaceAll('docs/proof/phase-1/qa','docs/proof/phase-1/remediation'));
for(const file of ['win.input.json','win.actual.json','loss.input.json','loss.actual.json'])writeFileSync(`${dir}/baseline-${file}`,readFileSync(`${base}/${file}`));
