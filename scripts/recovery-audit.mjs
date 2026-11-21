import {spawnSync} from 'node:child_process';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const dir=process.env.PROOF_DIR||'docs/proof/phase-2/core/recovery-final';mkdirSync(dir,{recursive:true});
function git(args,binary=false){const r=spawnSync('git',args,{encoding:binary?undefined:'utf8',maxBuffer:32e6,windowsHide:true});assert.equal(r.status,0,String(r.stderr));return binary?r.stdout:r.stdout.trim();}
const hash=x=>createHash('sha256').update(x).digest('hex'),head=git(['rev-parse','HEAD']);
const paths=git(['ls-tree','-r','--name-only','HEAD']).split('\n').filter(p=>p.startsWith('docs/proof/phase-1/')||p.startsWith('docs/proof/phase-2/')||['docs/requirements/PRD-0.md','docs/requirements/TICKET-02.md','package-lock.json'].includes(p));
const records=paths.map(path=>({path,baselineSha256:hash(git(['show',`HEAD:${path}`],true)),currentSha256:hash(readFileSync(path))}));
const changed=records.filter(x=>x.baselineSha256!==x.currentSha256);assert.deepEqual(changed,[]);
const phase1=git(['rev-parse','phase-1^{commit}']);assert.equal(phase1,'627ed7f92c59482bc902fba108c2936dc9481976');
const report={timestamp:new Date().toISOString(),head,parent:git(['rev-parse','HEAD^']),commitSummary:git(['show','--format=fuller','--stat','HEAD']),phase1,status:git(['status','--short','--branch']),preservedFiles:records.length,changedImmutableFiles:changed,files:records,node:process.version,packageManager:JSON.parse(readFileSync('package.json','utf8').replace(/^\uFEFF/,'')).packageManager};
writeFileSync(`${dir}/preservation.json`,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({head,phase1,preservedFiles:records.length,changedImmutableFiles:changed}));
