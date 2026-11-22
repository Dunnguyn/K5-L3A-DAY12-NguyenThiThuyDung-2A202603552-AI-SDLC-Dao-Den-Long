import {spawnSync} from 'node:child_process';
import {mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import {performance} from 'node:perf_hooks';
import {proofDirectory} from './proof-directory.mjs';
const root=JSON.parse(readFileSync('docs/notes/phase-3-core-run.json','utf8')).directory;
const dir=root+'/final-'+new Date().toISOString().replace(/[:.]/g,'-');
mkdirSync(dir,{recursive:true});
const report={scope:'Phase 3 Core/Headless local verification; not browser or independent QA',timestamp:new Date().toISOString(),platform:process.platform,node:process.version,directory:dir,checks:[]};
function command(name,args,timeout=30000){
 console.log('RUN '+name);
 const start=performance.now();
 const r=process.platform==='win32'?spawnSync(process.env.ComSpec||'cmd.exe',['/d','/s','/c','npm.cmd '+args.join(' ')],{encoding:'utf8',timeout,maxBuffer:32e6,env:{...process.env,PROOF_DIR:dir}}):spawnSync('npm',args,{encoding:'utf8',timeout,maxBuffer:32e6,env:{...process.env,PROOF_DIR:dir}});
 writeFileSync(dir+'/'+name+'.stdout.log',r.stdout??'');writeFileSync(dir+'/'+name+'.stderr.log',r.stderr??'');
 report.checks.push({name,command:'npm '+args.join(' '),exitCode:r.status,elapsedMs:performance.now()-start,error:r.error?.message});
 writeFileSync(dir+'/regression-results.json',JSON.stringify(report,null,2)+'\n');
 console.log(name+': '+(r.status===0?'PASS':'FAIL'));if(r.status!==0)throw Error(r.stderr||r.stdout||r.error?.message);
}
try{
 command('npm-test',['test']);
 command('npm-test-independent',['run','test:independent']);
 command('npm-build',['run','build']);
 command('npm-verify',['run','verify'],240000);
 const diff=spawnSync('git',['diff','--check'],{encoding:'utf8'});
 writeFileSync(dir+'/git-diff-check.log',diff.stdout+diff.stderr);report.checks.push({name:'git-diff-check',exitCode:diff.status});
 if(diff.status!==0)throw Error(diff.stdout+diff.stderr);
 report.passed=true;
 const unit=readFileSync(dir+'/npm-test.stdout.log','utf8').replace(/\u001b\[[0-9;]*m/g,'');
 report.unitPassed=Number(unit.match(/Tests\s+(\d+)\s+passed/)?.[1]);
 report.crossCheck=JSON.parse(readFileSync(dir+'/independent-core.json','utf8'));
 report.harness=JSON.parse(readFileSync(dir+'/verification.json','utf8'));
 report.headless=JSON.parse(readFileSync(dir+'/headless-results.json','utf8'));
 report.dawnReplays=JSON.parse(readFileSync(dir+'/dawn-input-replay.json','utf8'));
 report.benchmark=JSON.parse(readFileSync(dir+'/benchmark-night3.json','utf8'));
}catch(e){report.passed=false;report.error=e.message;process.exitCode=1;}
writeFileSync(dir+'/regression-results.json',JSON.stringify(report,null,2)+'\n');
writeFileSync(root+'/final-run-location.json',JSON.stringify({directory:dir,passed:report.passed},null,2)+'\n');
console.log(JSON.stringify({directory:dir,passed:report.passed,error:report.error,unitPassed:report.unitPassed}));
