import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { writeFileSync,mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { performance } from 'node:perf_hooks';
import os from 'node:os';
const dir=process.env.PROOF_DIR||'docs/proof/phase-2/core';mkdirSync(dir,{recursive:true});
const base={version:'internal-draft-1',seed:7341,scenario:{player:{invuln_ticks:21600},random_drifters:false,wind_enabled:false},actions:[{ticks:21600}]};
const npmScript=join(dirname(process.execPath),'node_modules','npm','bin','npm-cli.js');
let npm=spawnSync(process.execPath,[npmScript,'--version'],{encoding:'utf8',windowsHide:true});
if(npm.status!==0)npm=spawnSync('npm',['--version'],{encoding:'utf8',windowsHide:true,shell:process.platform==='win32'});
const report={node:process.version,npm:npm.status===0?npm.stdout.trim():'NOT AVAILABLE',os:{platform:os.platform(),release:os.release(),arch:os.arch()},scenario:'night 3 full 21600 ticks; invulnerability scenario override prevents early loss',ticks:21600,replays:[],startedAt:new Date().toISOString()};
const inputPath=join(dir,'benchmark-night3.input.json');writeFileSync(inputPath,JSON.stringify(base)+'\n');
for(let i=0;i<2;i++){const start=performance.now(),r=spawnSync(process.execPath,['scripts/headless.mjs','--night','3',inputPath],{encoding:'utf8',timeout:30000});const elapsed=performance.now()-start;assert.equal(r.status,0,r.stderr);const o=JSON.parse(r.stdout);assert.equal(o.state.sim_tick,21600);assert.equal(o.state.state,'lost');assert.equal(o.state.end_reason,'dawn');report.replays.push({elapsedMs:Math.round(elapsed*100)/100,exitCode:r.status,state:o.state.state,end_reason:o.state.end_reason,finalSimTick:o.state.sim_tick,stdoutJson:true,stderr:r.stderr});if(i===0)report.first=o;else assert.deepEqual(o,report.first);}
report.deterministic=true;report.elapsedWithin30s=report.replays.every(x=>x.elapsedMs<=30000);assert.ok(report.elapsedWithin30s);delete report.first;writeFileSync(`${dir}/benchmark-night3.json`,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
