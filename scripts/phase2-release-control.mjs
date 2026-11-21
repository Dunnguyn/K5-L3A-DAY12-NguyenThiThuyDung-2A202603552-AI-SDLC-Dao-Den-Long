import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
const slug='Dunnguyn/K5-L3A-DAY12-NguyenThiThuyDung-2A202603552-AI-SDLC-Dao-Den-Long',repo=`https://github.com/${slug}`,phase1='627ed7f92c59482bc902fba108c2936dc9481976';
const git=(args,allowed=[0])=>{const r=spawnSync('git',args,{encoding:'utf8',maxBuffer:32e6,timeout:180000,windowsHide:true,env:{...process.env,GIT_TERMINAL_PROMPT:'0'}});assert.ok(allowed.includes(r.status),`git ${args[0]} failed: ${r.stderr}`);return r;};
const head=()=>git(['rev-parse','HEAD']).stdout.trim();
const clean=()=>assert.equal(git(['status','--porcelain']).stdout,'','Working tree must be clean');
function refs(){return Object.fromEntries(git(['ls-remote','origin','refs/heads/main','refs/tags/phase-1','refs/tags/phase-1^{}','refs/tags/phase-2','refs/tags/phase-2^{}']).stdout.trim().split('\n').filter(Boolean).map(l=>{const[sha,ref]=l.split(/\s+/);return[ref,sha];}));}
function phase1Gate(remote){assert.equal(git(['rev-parse','phase-1^{commit}']).stdout.trim(),phase1);assert.equal(remote['refs/tags/phase-1^{}']??remote['refs/tags/phase-1'],phase1,'Remote phase1 changed');}
function absentTag(remote){assert.equal(git(['show-ref','--verify','--quiet','refs/tags/phase-2'],[0,1]).status,1,'Local phase-2 exists: STOP');assert.ok(!remote['refs/tags/phase-2']&&!remote['refs/tags/phase-2^{}'],'Remote phase-2 exists: STOP');}
async function api(url){const r=await fetch(url,{headers:{Accept:'application/vnd.github+json','User-Agent':'phase2-release-verification'},signal:AbortSignal.timeout(30000)});const data=await r.json();assert.ok(r.ok,`GitHub API ${r.status}: ${data.message??'request failed'}`);return data;}
async function ci(sha){const data=await api(`https://api.github.com/repos/${slug}/actions/workflows/verify.yml/runs?event=push&per_page=20&head_sha=${sha}`),run=data.workflow_runs.filter(r=>r.head_sha===sha&&r.event==='push').toSorted((a,b)=>b.id-a.id)[0];if(!run)return{sha,state:'awaiting-run'};
 const result={sha,state:run.status,conclusion:run.conclusion,id:run.id,attempt:run.run_attempt,url:run.html_url,name:run.name,path:run.path};assert.equal(run.name,'Verify Phase 2');assert.ok(run.path.startsWith('.github/workflows/verify.yml'));
 if(run.status==='completed'){const jobs=await api(run.jobs_url);result.jobs=jobs.jobs.map(j=>({name:j.name,conclusion:j.conclusion,url:j.html_url,steps:j.steps.map(s=>({name:s.name,conclusion:s.conclusion}))}));result.success=run.conclusion==='success'&&result.jobs.some(j=>j.name==='verify'&&j.conclusion==='success');}
 return result;
}
function localGate(){const dir='docs/proof/phase-2/core/release-final',result=JSON.parse(fs.readFileSync(`${dir}/results.json`,'utf8')),qa=JSON.parse(fs.readFileSync(`${dir}/qa42/independent-results-final.json`,'utf8')),bench=JSON.parse(fs.readFileSync(`${dir}/benchmark/benchmark-night3.json`,'utf8'));assert.ok(result.passed&&result.commands.every(c=>c.exitCode===0));assert.equal(qa.passed,42);assert.equal(qa.failed,0);assert.equal(bench.ticks,21600);assert.ok(bench.deterministic&&bench.elapsedWithin30s);assert.equal(git(['diff','--check']).status,0);}
const action=process.argv[2]??'ci';
if(action==='ci'){const sha=head();console.log(JSON.stringify(await ci(sha)));}
else if(action==='push'){
 clean();localGate();const remote=refs();phase1Gate(remote);absentTag(remote);const parent=git(['rev-parse','HEAD^']).stdout.trim();assert.equal(remote['refs/heads/main'],parent,'Remote main changed: STOP and review before push');
 const r=git(['push','origin','HEAD:main']);process.stderr.write(r.stderr);const after=refs();assert.equal(after['refs/heads/main'],head());phase1Gate(after);console.log(JSON.stringify({pushed:true,sha:head(),repository:repo}));
}else if(action==='tag'){
 clean();localGate();const sha=head(),remote=refs();phase1Gate(remote);absentTag(remote);assert.equal(remote['refs/heads/main'],sha,'Remote main changed: STOP');const run=await ci(sha);assert.ok(run.success,'Exact pushed Phase2 CI must be completed SUCCESS');
 const folder=fs.mkdtempSync(path.join(os.tmpdir(),'phase2-release-')),file=path.join(folder,'tag-message.txt');
 fs.writeFileSync(file,`Phase 2: three-island campaign\n\nRelease commit: ${sha}\nVerify Phase 2 CI: ${run.url}\nCI conclusion: SUCCESS; run ${run.id}, attempt ${run.attempt}\nLocal verification:79 unit,7 cross-check,42 original QA assertions,7 harness,build,browser campaign and2x21600tick benchmark PASS.\nProject owner explicitly waived additional Independent QA Re-test. Codex42/42 is not independent acceptance of remediation.\nRTM:36PASS,4PARTIAL,0FAIL,3NOT VERIFIED.\nOfficialv1.0base/schema,realGPU,macOS and human audio listening remain unverified. Software performance remains PARTIAL, including a final29.69FPS Night3 observation and earlier native30.30/30.65FPS samples. No full compliance claim.\nFinal report: docs/proof/phase-2/PHASE2_FINAL_REPORT.md\nphase-1 preserved at ${phase1}. No Phase3.\n`);
 try{git(['tag','-a','phase-2',sha,'--file',file]);const pushed=git(['push','origin','refs/tags/phase-2']);process.stderr.write(pushed.stderr);}finally{fs.unlinkSync(file);fs.rmdirSync(folder);}
 const after=refs();assert.equal(after['refs/tags/phase-2^{}'],sha);assert.equal(after['refs/heads/main'],sha);phase1Gate(after);assert.equal(git(['cat-file','-t','refs/tags/phase-2']).stdout.trim(),'tag');assert.equal(git(['rev-parse','phase-2^{commit}']).stdout.trim(),sha);clean();
 console.log(JSON.stringify({released:true,verdict:'PHASE 2 RELEASED WITH DOCUMENTED LIMITATIONS',sha,repository:repo,ci:run,tag:'phase-2',tagObject:after['refs/tags/phase-2'],tagCommit:sha,tagUrl:`${repo}/releases/tag/phase-2`,reportUrl:`${repo}/blob/phase-2/docs/proof/phase-2/PHASE2_FINAL_REPORT.md`,workingTree:'clean',phase1}));
}else throw Error('Expected ci, push or tag');
