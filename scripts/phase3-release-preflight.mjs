import {spawnSync} from 'node:child_process';
import {readFileSync,writeFileSync,statSync} from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const root=process.env.RELEASE_DIR;assert.ok(root);
const git=(...args)=>{const r=spawnSync('git',args,{encoding:'utf8',maxBuffer:16e6});assert.equal(r.status,0,r.stdout+r.stderr);return r.stdout.trim();};
const files=git('ls-files','--cached','--others','--exclude-standard').split('\n').filter(Boolean),initialPath=root+'/preservation-before.json';
const protectedFiles=files.filter(p=>(p.startsWith('docs/proof/')&&!p.startsWith(root+'/'))||p.startsWith('docs/requirements/')||p==='package-lock.json'||p==='src/data/worlds.js');
const hash=paths=>{const h=createHash('sha256');for(const p of paths.sort())h.update(p+'\0').update(readFileSync(p));return h.digest('hex');};
let before;try{before=JSON.parse(readFileSync(initialPath,'utf8'));}catch{before={paths:protectedFiles,digest:hash(protectedFiles),phase1:git('rev-parse','phase-1'),phase2:git('rev-parse','phase-2'),baseline:git('rev-parse','HEAD')};writeFileSync(initialPath,JSON.stringify(before,null,2)+'\n');}
const patterns=[/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,/\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/,/\bgh[pousr]_[A-Za-z0-9]{32,}\b/,/\bsk-(?:proj-)?[A-Za-z0-9_-]{40,}\b/];
const leaks=[],large=[],artifacts=[];
for(const p of files){const size=statSync(p).size;if(size>50e6)large.push({path:p,bytes:size});if(/(?:^|\/)(?:node_modules|dist|coverage|\.env|test-results)(?:\/|$)/.test(p))artifacts.push(p);if(/\.(?:md|js|mjs|json|yml|yaml|txt|log|patch)$/.test(p)&&p!=='scripts/phase3-release-preflight.mjs'){const t=readFileSync(p,'utf8');if(patterns.some(r=>r.test(t)))leaks.push(p);}}
const report={timestamp:new Date().toISOString(),head:git('rev-parse','HEAD'),baseline:before.baseline,phase1:git('rev-parse','phase-1'),phase2:git('rev-parse','phase-2'),protectedCount:before.paths.length,protectedDigest:hash(before.paths),expectedDigest:before.digest,secrets:leaks,oversized:large,inappropriateArtifacts:artifacts,status:git('status','--short','--branch'),files:files.map(p=>({path:p,bytes:statSync(p).size,category:p.startsWith('docs/proof/')?'retained/actual evidence':p.startsWith('docs/requirements/')?'immutable requirement':p.startsWith('src/')?'production source':p.startsWith('tests/')||p.startsWith('scripts/')?'tests/tooling':'documentation/configuration'}))};
assert.equal(report.protectedDigest,report.expectedDigest);assert.equal(report.phase1,before.phase1);assert.equal(report.phase2,before.phase2);assert.deepEqual(leaks,[]);assert.deepEqual(large,[]);assert.deepEqual(artifacts,[]);
report.passed=true;writeFileSync(root+'/preflight-'+Date.now()+'.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({passed:true,protectedCount:before.paths.length,files:files.length,totalBytes:report.files.reduce((n,f)=>n+f.bytes,0),head:report.head}));
