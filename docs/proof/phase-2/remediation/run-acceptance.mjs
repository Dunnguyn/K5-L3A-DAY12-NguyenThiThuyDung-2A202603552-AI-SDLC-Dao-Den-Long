import {spawnSync} from 'node:child_process';
import {mkdirSync,writeFileSync,existsSync} from 'node:fs';
import {dirname,join} from 'node:path';
import os from 'node:os';
const dir='docs/proof/phase-2/remediation/regression-acceptance',npm=join(dirname(process.execPath),'node_modules/npm/bin/npm-cli.js');
if(!existsSync(npm))throw Error('npm CLI path not found');
const report={startedAt:new Date().toISOString(),node:process.version,os:{platform:os.platform(),release:os.release(),arch:os.arch()},scope:'Unchanged existing regression commands after actual npm ci --offline; browser command has SKIP_FPS=1 because native independent FPS is separate',commands:[]};
for(const [id,args]of [['npm-version',['--version']],['unit',['test']],['cross-check',['run','test:independent']],['build',['run','build']],['harness',['run','verify']],['benchmark',['run','bench:headless']],['existing-browser',['run','test:browser']]]){
 const proof=`${dir}/${id}`;mkdirSync(proof,{recursive:true});const before=performance.now(),r=spawnSync(process.execPath,[npm,...args],{encoding:'utf8',maxBuffer:32e6,timeout:id==='existing-browser'?1200000:180000,windowsHide:true,env:{...process.env,PROOF_DIR:proof,SKIP_FPS:'1'}});
 writeFileSync(`${proof}/stdout.log`,r.stdout??'');writeFileSync(`${proof}/stderr.log`,r.stderr??'');report.commands.push({id,command:[process.execPath,npm,...args],exitCode:r.status,elapsedMs:performance.now()-before,error:r.error?.message});writeFileSync(`${dir}/existing-test-results.json`,JSON.stringify(report,null,2));console.log(`${id}: ${r.status===0?'PASS':'FAIL'} (${r.status})`);
}
report.finishedAt=new Date().toISOString();report.passed=report.commands.every(c=>c.exitCode===0);writeFileSync(`${dir}/existing-test-results.json`,JSON.stringify(report,null,2));if(!report.passed)process.exitCode=1;
