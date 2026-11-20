import {spawnSync} from 'node:child_process';
import {mkdirSync,copyFileSync,readdirSync,writeFileSync,readFileSync,mkdtempSync} from 'node:fs';
import {tmpdir,platform,cpus,totalmem} from 'node:os';
import {join} from 'node:path';
const dir='docs/proof/phase-1/qa';
mkdirSync(`${dir}/prior-evidence`,{recursive:true});
for(const name of readdirSync('docs/proof/phase-1'))if(name.endsWith('.json'))copyFileSync(`docs/proof/phase-1/${name}`,`${dir}/prior-evidence/${name}`);
const report={timestamp:new Date().toISOString(),platform:platform(),node:process.version,cpu:cpus()[0].model,memory:totalmem(),commands:[]};
function run(name,exe,args,cwd=process.cwd()){
 const windowsNpm=process.platform==='win32'&&exe==='npm.cmd';
 const r=spawnSync(windowsNpm?'cmd.exe':exe==='npm.cmd'?'npm':exe,windowsNpm?['/d','/s','/c',`npm.cmd ${args.join(' ')}`]:args,{cwd,encoding:'utf8',timeout:180000,maxBuffer:8e6});
 const item={name,command:[exe,...args],cwd,exitCode:r.status,stdout:r.stdout,stderr:r.stderr,error:r.error?.message};
 report.commands.push(item);writeFileSync(`${dir}/command-results.json`,JSON.stringify(report,null,2));console.log(`${name}: ${r.status}`);return r;
}
const clean=mkdtempSync(join(tmpdir(),'dao-qa-clean-'));
for(const file of ['package.json','package-lock.json'])copyFileSync(file,join(clean,file));
run('clean npm ci','npm.cmd',['ci','--no-audit','--no-fund'],clean);
for(const [name,args] of [['npm test',['test']],['npm run build',['run','build']],['npm run verify',['run','verify']],['npm run test:browser',['run','test:browser']]])run(name,'npm.cmd',args);
for(const name of ['win','loss'])run(`CLI ${name}`,process.execPath,['scripts/headless.mjs',`docs/proof/phase-1/${name}.input.json`]);
run('git diff check','git',['diff','--check']);
run('git tracked files','git',['ls-files']);
