import {spawnSync} from 'node:child_process';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const dir='docs/proof/phase-2/preflight';mkdirSync(dir,{recursive:true});process.env.PROOF_DIR=dir;
const report={node:process.version,platform:process.platform,timestamp:new Date().toISOString(),commands:[]};
function run(name,exe,args){const r=spawnSync(exe,args,{encoding:'utf8',timeout:240000,maxBuffer:8e6});report.commands.push({name,command:[exe,...args],exitCode:r.status,stdout:r.stdout,stderr:r.stderr});writeFileSync(`${dir}/regression-${process.platform}.json`,JSON.stringify(report,null,2));assert.equal(r.status,0);return r;}
const npm=args=>process.platform==='win32'?run(args.join(' '),'cmd.exe',['/d','/s','/c',`npx.cmd --yes npm@11.19.1 ${args.join(' ')}`]):run(args.join(' '),'npm',args);
if(process.argv.includes('--clean'))npm(['ci']);
npm(['--version']);npm(['test']);
writeFileSync(`${dir}/independent.mjs`,readFileSync('docs/proof/phase-1/qa/independent.mjs','utf8').replaceAll('docs/proof/phase-1/qa',dir));
run('independent QA',process.execPath,[`${dir}/independent.mjs`]);npm(['run','build']);npm(['run','verify']);
for(const name of ['win','loss']){const r=run(`CLI ${name}`,process.execPath,['scripts/headless.mjs',`docs/proof/phase-1/${name}.input.json`]);assert.equal(r.stderr,'');assert.deepEqual(JSON.parse(r.stdout),JSON.parse(readFileSync(`docs/proof/phase-1/${name}.actual.json`)));}
const invalid=spawnSync(process.execPath,['scripts/headless.mjs','package.json'],{encoding:'utf8'});assert.equal(invalid.status,1);assert.equal(invalid.stdout,'');assert.equal(typeof JSON.parse(invalid.stderr).error,'string');
const tag=spawnSync('git',['rev-parse','phase-1^{}'],{encoding:'utf8'});assert.equal(tag.status,0);assert.equal(tag.stdout.trim(),'627ed7f92c59482bc902fba108c2936dc9481976');
const tree=spawnSync('git',['ls-tree','-r','--name-only','phase-1'],{encoding:'utf8'});assert.equal(tree.status,0);
const preserved=tree.stdout.split('\n').filter(p=>p.startsWith('src/')||p.startsWith('docs/proof/phase-1/')||p==='docs/requirements/PRD-0.md');assert.ok(preserved.length>100);
const changed=preserved.filter(p=>{const original=spawnSync('git',['show',`phase-1:${p}`],{maxBuffer:16e6}).stdout;return !createHash('sha256').update(readFileSync(p)).digest().equals(createHash('sha256').update(original).digest());});assert.deepEqual(changed,[]);
writeFileSync(`${dir}/parity-${process.platform}.json`,JSON.stringify({headlessBaselineExact:true,invalidCLI:true,preservedFiles:preserved.length,changedPhase1Files:changed,phase1Commit:'627ed7f92c59482bc902fba108c2936dc9481976'},null,2));console.log('PASS: baseline parity, Phase 1 source/evidence/PRD unchanged');
