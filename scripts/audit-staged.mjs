import {execFileSync} from 'node:child_process';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const files=execFileSync('git',['diff','--cached','--name-only','-z']).toString().split('\0').filter(Boolean);
const prohibited=files.filter(p=>/(^|\/)(node_modules|dist|coverage|\.cache|__pycache__|playwright-report|test-results)(\/|$)|(^|\/)\.env($|\.)|\.(tmp|log\.tmp|pyc)$/.test(p));
const patterns=[/sk-[A-Za-z0-9_-]{24,}/,/AKIA[0-9A-Z]{16}/,/gh[pousr]_[A-Za-z0-9]{20,}/,/-----BEGIN (?:RSA |OPENSSH |EC )?PRIVATE KEY-----/];
const findings=[],largeFiles=[];
for(const p of files){const data=execFileSync('git',['show',`:${p}`],{maxBuffer:32e6});if(data.length>20e6)largeFiles.push(p);if(!p.endsWith('.png')&&patterns.some(pattern=>pattern.test(data.toString('utf8'))))findings.push(p);}
const hash=p=>createHash('sha256').update(execFileSync('git',['show',`:${p}`],{maxBuffer:32e6})).digest('hex');
const prior=JSON.parse(readFileSync('docs/proof/phase-1/remediation/qa-original-hashes.json'));
const changedQA=Object.entries(prior).filter(([p,h])=>hash(p)!==h).map(([p])=>p);
const prd=hash('docs/requirements/PRD-0.md');
const report={timestamp:new Date().toISOString(),stagedFileCount:files.length,prohibited,secretPatternMatchingPaths:findings,largeFiles,changedQA,prdSha256:prd,scope:'Limited secret-pattern scan and explicit staged path review; not a complete security audit'};
writeFileSync('docs/proof/phase-1/final-handover/staged-audit.json',JSON.stringify(report,null,2));
assert.deepEqual(prohibited,[]);assert.deepEqual(findings,[]);assert.deepEqual(changedQA,[]);assert.deepEqual(largeFiles,[]);assert.equal(prd,'11ffc0b564e8131536d022bce56e2f1aedb0f5a7344aaa0a306b97d1678e020b');console.log(JSON.stringify(report));
