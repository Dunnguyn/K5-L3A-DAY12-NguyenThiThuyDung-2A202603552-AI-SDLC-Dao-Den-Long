import {spawnSync} from 'node:child_process';
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import {performance} from 'node:perf_hooks';
const root=JSON.parse(readFileSync('docs/notes/phase-3-release-run.json','utf8').replace(/^\uFEFF/,'')).directory;
const dir=root+'/regression-'+Date.now();mkdirSync(dir,{recursive:true});
const env={...process.env,PROOF_DIR:dir+'/core',BROWSER_PROOF_DIR:root+'/browser',BROWSER_INPUT_DIR:root+'/inputs',SKIP_BOUNDARIES:'0'};
const report={timestamp:new Date().toISOString(),node:process.version,platform:process.platform,directory:dir,checks:[]};
const save=()=>writeFileSync(dir+'/results.json',JSON.stringify(report,null,2)+'\n');
function run(name,args,npm=false,timeout=240000){
 const start=performance.now();console.log('RUN '+name);
 const exe=npm&&process.platform==='win32'?(process.env.ComSpec||'cmd.exe'):npm?'npm':process.execPath;
 const argv=npm&&process.platform==='win32'?['/d','/s','/c','npm.cmd '+args.join(' ')]:args;
 const r=spawnSync(exe,argv,{env,encoding:'utf8',timeout,maxBuffer:32e6,windowsHide:true});
 writeFileSync(dir+'/'+name+'.stdout.log',r.stdout??'');writeFileSync(dir+'/'+name+'.stderr.log',r.stderr??'');
 report.checks.push({name,command:[npm?'npm':'node',...args],exitCode:r.status,elapsedMs:performance.now()-start,error:r.error?.message});save();console.log(name+': '+(r.status===0?'PASS':'FAIL'));if(r.status!==0)throw Error(name+' failed; inspect retained logs');
}
try{run('npm-test',['test'],true);run('npm-independent',['run','test:independent'],true);run('npm-verify',['run','verify'],true);run('npm-build',['run','build'],true);run('cli-edges',['scripts/phase3-edge-scenarios.mjs']);run('npm-browser',['run','test:browser'],true,1200000);report.passed=true;}
catch(e){report.passed=false;report.failure=e.stack;process.exitCode=1;}
save();console.log(JSON.stringify({directory:dir,passed:report.passed,failure:report.failure}));
