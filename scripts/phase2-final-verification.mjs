import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
import {dirname,join} from 'node:path';
import os from 'node:os';
const root='docs/proof/phase-2',core=`${root}/core/release-final`,browser=`${root}/browser/release-final`;
fs.mkdirSync(core,{recursive:true});fs.mkdirSync(browser,{recursive:true});
const npm=join(dirname(process.execPath),'node_modules/npm/bin/npm-cli.js');
const report={startedAt:new Date().toISOString(),node:process.version,os:{platform:os.platform(),release:os.release(),arch:os.arch()},executor:'Codex release verification; additional independent QA re-test waived by project owner',commands:[]};
for(const[id,exe,args,output]of [
 ['npm-version',process.execPath,[npm,'--version'],`${core}/environment`],
 ['unit',process.execPath,[npm,'test'],`${core}/unit`],
 ['cross-check',process.execPath,[npm,'run','test:independent'],`${core}/cross-check`],
 ['qa42',process.execPath,['scripts/run-phase2-qa.mjs'],`${core}/qa42`],
 ['build',process.execPath,[npm,'run','build'],`${core}/build`],
 ['verify',process.execPath,[npm,'run','verify'],`${core}/harness`],
 ['benchmark',process.execPath,[npm,'run','bench:headless'],`${core}/benchmark`],
 ['browser',process.execPath,[npm,'run','test:browser'],browser],
 ['diff-check','git',['diff','--check'],`${core}/diff-check`]
]){
 fs.mkdirSync(output,{recursive:true});const env={...process.env,PROOF_DIR:output};delete env.SKIP_FPS;delete env.FPS_NIGHTS;
 const start=performance.now(),r=spawnSync(exe,args,{encoding:'utf8',maxBuffer:64e6,timeout:id==='browser'?1800000:240000,windowsHide:true,env});
 fs.writeFileSync(`${output}/command.stdout.log`,r.stdout??'');fs.writeFileSync(`${output}/command.stderr.log`,r.stderr??'');
 report.commands.push({id,command:[exe,...args],output,exitCode:r.status,elapsedMs:performance.now()-start,error:r.error?.message});
 fs.writeFileSync(`${core}/results.json`,JSON.stringify(report,null,2)+'\n');console.log(`${id}: ${r.status===0?'PASS':'FAIL'} (${r.status})`);
 if(r.status!==0){report.passed=false;report.finishedAt=new Date().toISOString();fs.writeFileSync(`${core}/results.json`,JSON.stringify(report,null,2)+'\n');process.exitCode=1;break;}
}
if(process.exitCode!==1){report.passed=true;report.finishedAt=new Date().toISOString();fs.writeFileSync(`${core}/results.json`,JSON.stringify(report,null,2)+'\n');}
