import {proofDirectory} from './proof-directory.mjs';
import {spawnSync} from 'node:child_process';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const dir=proofDirectory('core','preflight');mkdirSync(dir,{recursive:true});process.env.PROOF_DIR=dir;
const report={node:process.version,platform:process.platform,timestamp:new Date().toISOString(),scope:'Phase 2 internal acceptance; not external QA or official schema verification',commands:[]};
function run(name,exe,args){const r=spawnSync(exe,args,{encoding:'utf8',timeout:240000,maxBuffer:16e6,env:process.env,windowsHide:true});report.commands.push({name,command:[exe,...args],exitCode:r.status,stdout:r.stdout,stderr:r.stderr,error:r.error?.message});writeFileSync(`${dir}/regression-${process.platform}.json`,JSON.stringify(report,null,2));assert.equal(r.status,0,r.stderr);return r;}
for(const [name,args]of [['unit',['node_modules/vitest/vitest.mjs','run']],['internal cross-check',['scripts/independent-core.mjs']],['build',['node_modules/vite/bin/vite.js','build']],['harness',['scripts/verify.mjs']]])run(name,process.execPath,args);
const input=`${dir}/ci-loss.input.json`;writeFileSync(input,JSON.stringify({version:'internal-draft-1',scenario:{player:{flames:0}},actions:[{ticks:1}]}));
for(let n=1;n<=3;n++){const r=run(`CLI night ${n}`,process.execPath,['scripts/headless.mjs','--night',String(n),input]),out=JSON.parse(r.stdout);assert.equal(r.stderr,'');assert.equal(out.state.night,n);assert.equal(out.state.state,'lost');assert.equal(out.state.end_reason,'no_flames');writeFileSync(`${dir}/ci-night-${n}.actual.json`,r.stdout);}
const invalid=spawnSync(process.execPath,['scripts/headless.mjs','package.json'],{encoding:'utf8'});assert.equal(invalid.status,1);assert.equal(invalid.stdout,'');assert.equal(typeof JSON.parse(invalid.stderr).error,'string');
const tag=run('Phase 1 tag','git',['rev-parse','phase-1^{}']);assert.equal(tag.stdout.trim(),'627ed7f92c59482bc902fba108c2936dc9481976');
const tree=run('tracked paths','git',['ls-tree','-r','--name-only','HEAD']).stdout.split('\n');
const preserved=tree.filter(p=>p.startsWith('docs/proof/phase-1/')||p==='docs/requirements/PRD-0.md'||p==='docs/requirements/TICKET-02.md');
const changed=preserved.filter(p=>{const original=spawnSync('git',['show',`HEAD:${p}`],{maxBuffer:16e6}).stdout;return !createHash('sha256').update(readFileSync(p)).digest().equals(createHash('sha256').update(original).digest());});assert.deepEqual(changed,[]);
writeFileSync(`${dir}/preservation-${process.platform}.json`,JSON.stringify({invalidCLI:true,preservedFiles:preserved.length,changedImmutableFiles:changed,phase1Commit:tag.stdout.trim()},null,2));console.log('PASS: Phase 2 regression, three-night CLI, immutable requirements and Phase 1 evidence');
