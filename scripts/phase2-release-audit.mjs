import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
const output='docs/proof/phase-2/core/release-final',git=args=>{const r=spawnSync('git',args,{encoding:'utf8',maxBuffer:64e6});assert.equal(r.status,0,r.stderr);return r.stdout;};
fs.mkdirSync(output,{recursive:true});
const staged=process.argv.includes('--staged'),paths=staged?git(['ls-files','-z','--cached']).split('\0').filter(Boolean):[...new Set(git(['ls-files','-z','--cached','--others','--exclude-standard']).split('\0').filter(Boolean))];
const inventory=[],issues=[];
const patterns=[['private-key',/-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/g],['github-token',/\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{40,})\b/g],['openai-key',/\bsk-(?:proj-|svcacct-)?[A-Za-z0-9_-]{30,}/g],['aws-access-key',/\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/g]];
for(const path of paths){
 if(/(^|\/)(?:node_modules|dist|coverage|playwright-report|test-results|\.vite-temp)(\/|$)/.test(path)||/(^|\/)\.env(?:\.|$)/.test(path)&&!path.endsWith('.env.example')||/\.(?:exe|dll|pdb|zip|tar|gz)$/i.test(path))issues.push({path,rule:'excluded-build-tool-or-secret-file'});
 const buffer=staged?spawnSync('git',['show',`:${path}`],{maxBuffer:128e6}).stdout:fs.readFileSync(path);
 inventory.push({path,bytes:buffer.length,sha256:crypto.createHash('sha256').update(buffer).digest('hex')});if(buffer.length>=100*1024*1024)issues.push({path,rule:'github-file-size-limit'});
 if(/\.(?:png|jpe?g|webp|ico|pdf|mp[34]|woff2?)$/i.test(path))continue;
 const text=buffer.toString('utf8');for(const[name,regex]of patterns){regex.lastIndex=0;const match=regex.exec(text);if(match)issues.push({path,rule:name,line:text.slice(0,match.index).split('\n').length});}
}
const report={timestamp:new Date().toISOString(),scope:staged?'Complete Git index':'Tracked plus all nonignored untracked files',head:git(['rev-parse','HEAD']).trim(),phase1:git(['rev-parse','phase-1^{commit}']).trim(),status:git(['status','--short','--branch']),files:inventory.length,bytes:inventory.reduce((n,f)=>n+f.bytes,0),largest:inventory.toSorted((a,b)=>b.bytes-a.bytes).slice(0,12),issues,inventory};
fs.writeFileSync(`${output}/${staged?'index-audit':'workspace-audit'}.json`,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({scope:report.scope,files:report.files,bytes:report.bytes,largest:report.largest.slice(0,4),issues}));assert.deepEqual(issues,[],'Release inventory contains files requiring review');assert.equal(report.phase1,'627ed7f92c59482bc902fba108c2936dc9481976');
