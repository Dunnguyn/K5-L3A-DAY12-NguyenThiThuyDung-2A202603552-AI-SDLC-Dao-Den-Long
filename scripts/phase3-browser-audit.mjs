import assert from 'node:assert/strict';
import {readFileSync,readdirSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
const json=p=>JSON.parse(readFileSync(p,'utf8').replace(/^\uFEFF/,''));
const root=json('docs/notes/phase-3-browser-run.json').directory;
const git=(...args)=>{const r=spawnSync('git',args,{encoding:'utf8'});if(args.join(' ')==='diff --check')return{exitCode:r.status,stdout:r.stdout,stderr:r.stderr};assert.equal(r.status,0,r.stderr);return r.stdout.trim();};
const baseline=json(root+'/preservation-before.json'),hash=createHash('sha256');
for(const p of baseline.paths)hash.update(p+'\0').update(readFileSync(p));
const preservation={paths:baseline.paths.length,before:baseline.digest,after:hash.digest('hex'),head:git('rev-parse','HEAD'),phase1:git('rev-parse','phase-1'),phase2:git('rev-parse','phase-2')};
preservation.passed=preservation.before===preservation.after&&preservation.head===baseline.head&&preservation.phase1===baseline.phase1&&preservation.phase2===baseline.phase2;
const latest=(prefix,file,predicate=()=>true)=>{for(const d of readdirSync(root).filter(n=>n.startsWith(prefix)).sort().reverse()){try{const value=json(root+'/'+d+'/'+file);if(predicate(value))return{path:root+'/'+d+'/'+file,value};}catch{}}return null;};
const boundary=latest('boundaries-','browser-boundaries.json',v=>v.passed),campaign=latest('e2e-','browser-e2e.json',v=>v.passed);
const performance=[];
for(const d of ['performance-2026-11-21T16-07-13-002Z','performance-2026-11-21T16-13-04-814Z']){
 const p=root+'/'+d+'/performance.json',r=json(p);
 for(const s of r.samples.filter(s=>s.passed))performance.push({path:p,os:r.os,browser:r.browser,sourceHashes:r.sourceHashes,label:s.label,measurement:s.measurement,webgl:s.webgl,fixture:s.fixture,metrics:s.metrics,restartTrend:s.restartTrend,geometryTrendBounded:s.geometryTrendBounded,errors:s.errors});
}
const sourceVerification=[];
for(const sample of performance)for(const[p,digest]of Object.entries(sample.sourceHashes??{})){
 const current=readFileSync(p),after=createHash('sha256').update(current).digest('hex');
 if(after!==digest){
  assert.equal(p,'src/browser/renderer.js','Unexpected measured source change');
  const measured=readFileSync(root+'/renderer-measured-source.txt');
  assert.equal(createHash('sha256').update(measured).digest('hex'),digest);
  assert.equal(measured.toString().replace(/[ \t]+(?=\r?$)/gm,''),current.toString(),'Renderer changed beyond trailing whitespace');
  sourceVerification.push({path:p,measuredSha256:digest,currentSha256:after,change:'trailing whitespace only',verified:true});
 }else sourceVerification.push({path:p,sha256:after,change:'none',verified:true});
}
const core=json(root+'/core-regression-location.json').directory;
const report={timestamp:new Date().toISOString(),preservation,boundaries:boundary&&{path:boundary.path,count:boundary.value.checks.length,checks:boundary.value.checks.map(c=>({id:c.id,status:c.status,kind:c.kind}))},campaign:campaign&&{path:campaign.path,campaign:campaign.value.campaign,nights:campaign.value.nights.map(n=>({night:n.night,status:n.status,tick:n.final.sim_tick,lit:n.final.lanterns.filter(l=>l.lit).length,score:n.final.score,flames:n.final.player.flames})),crossRuntime:campaign.value.crossRuntime},performance,coreDirectory:core,verification:json(core+'/verification.json'),benchmark:json(core+'/benchmark-night3.json'),crossCheck:json(core+'/independent-core.json'),git:{status:git('status','--short','--branch'),diffCheck:git('diff','--check')},limitations:['Official v1.0 base/harness NOT VERIFIED','Real GPU, macOS, current remote CI and manual audio listening NOT VERIFIED','Cross-runtime bit-exact Node/Chromium replay differs; within-runtime replay checked','Sampled native SwiftShader performance and six restarts do not certify long-term leak freedom']};
const audio=[];
if(campaign)for(const n of campaign.value.nights){
 const expected={};for(const e of campaign.value.nights.filter(m=>m.night<=n.night).flatMap(m=>m.final.events))expected[e.type]=(expected[e.type]??0)+1;
 const actual=n.audio.eventCounts,comparisons=Object.entries(expected).map(([type,count])=>({type,expected:count,observed:actual[type]??0,passed:count===actual[type]}));
 audio.push({night:n.night,contextState:n.audio.contextState,volume:n.audio.volume,comparisons,passed:comparisons.every(c=>c.passed),manualListening:'NOT VERIFIED'});
}
report.audio=audio;report.sourceVerification=sourceVerification;
const path=root+'/audit-'+new Date().toISOString().replace(/[:.]/g,'-')+'.json';writeFileSync(path,JSON.stringify(report,null,2)+'\n');
assert.ok(preservation.passed,'Protected source/evidence/tag changed');assert.ok(report.verification.passed);assert.ok(campaign,'No passing default campaign');assert.ok(audio.every(a=>a.passed),'Audio Core event counts differ');assert.equal(report.git.diffCheck.exitCode,0,'git diff --check failed');
console.log(JSON.stringify({path,preservation:preservation.passed,campaign:report.campaign,performance:performance.map(p=>({label:p.label,fps:p.measurement.averageFps})),audio:audio.map(a=>({night:a.night,passed:a.passed}))}));
