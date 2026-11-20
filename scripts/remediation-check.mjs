import {spawnSync} from 'node:child_process';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const dir='docs/proof/phase-1/remediation';
const report={timestamp:new Date().toISOString(),node:process.version,platform:process.platform,commands:[]};
process.env.PROOF_DIR=dir;
function run(name,exe,args,encoding='utf8'){
 const r=spawnSync(exe,args,{encoding,timeout:600000,maxBuffer:16e6});report.commands.push({name,command:[exe,...args],exitCode:r.status,stdout:r.stdout,stderr:r.stderr,error:r.error?.message});writeFileSync(`${dir}/commands.json`,JSON.stringify(report,null,2));console.log(name,r.status);return r;
}
const npm=args=>process.platform==='win32'?['cmd.exe',['/d','/s','/c',`npm.cmd ${args.join(' ')}`]]:['npm',args];
run('WSL availability','wsl.exe',['--list','--quiet'],'utf16le');
run('Docker availability','docker',['version']);
for(const args of [['test'],['run','build'],['run','verify'],['run','test:browser']]){const [exe,argv]=npm(args);assert.equal(run(`npm ${args.join(' ')}`,exe,argv).status,0);}
assert.equal(run('all independent tests',process.execPath,[`${dir}/independent.mjs`]).status,0);
const cli=[];
for(const name of ['win','loss']){
 const file=`${dir}/baseline-${name}.input.json`,expected=JSON.parse(readFileSync(`${dir}/baseline-${name}.actual.json`));
 for(const mode of ['node','npm-silent']){const invocation=mode==='node'?[process.execPath,['scripts/headless.mjs',file]]:npm(['--silent','run','headless','--',file]);const r=run(`${mode} ${name}`,...invocation);assert.equal(r.status,0);assert.equal(r.stderr,'');assert.deepEqual(JSON.parse(r.stdout),expected);cli.push({name,mode,parse:true,baselineEqual:true});}
 assert.deepEqual(JSON.parse(readFileSync(`${dir}/${name}.actual.json`)),expected);
}
for(const invocation of [[process.execPath,['scripts/headless.mjs','package.json']],npm(['--silent','run','headless','--','package.json'])]){const r=run('invalid input',...invocation);assert.equal(r.status,1);assert.equal(r.stdout,'');assert.equal(typeof JSON.parse(r.stderr).error,'string');}
writeFileSync(`${dir}/cli-parity.json`,JSON.stringify({cli,fullSnapshotBaselineEqual:true,seed:'none: fixed layout; exact original action streams'},null,2));
assert.equal(run('git diff check','git',['diff','--check']).status,0);run('git status','git',['status','--short']);run('git tags','git',['tag','--list']);
const hashes=JSON.parse(readFileSync(`${dir}/qa-original-hashes.json`));assert.ok(Object.entries(hashes).every(([p,h])=>createHash('sha256').update(readFileSync(p)).digest('hex')===h));
const prd=createHash('sha256').update(readFileSync('docs/requirements/PRD-0.md')).digest('hex');assert.equal(prd,'11ffc0b564e8131536d022bce56e2f1aedb0f5a7344aaa0a306b97d1678e020b');
writeFileSync(`${dir}/preservation.json`,JSON.stringify({qaOriginalUnchanged:true,files:Object.keys(hashes).length,prdSha256:prd},null,2));
console.log('PASS: CLI pure JSON, exact baseline parity, QA original and PRD unchanged');
