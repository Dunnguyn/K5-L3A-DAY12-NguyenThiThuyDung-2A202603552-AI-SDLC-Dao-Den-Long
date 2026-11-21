import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
import {join,dirname} from 'node:path';
const dir='docs/proof/phase-2/remediation',npm=join(dirname(process.execPath),'node_modules/npm/bin/npm-cli.js'),commands=[];
for(const[id,args]of [['final-unit',['test']],['final-harness',['run','verify']]]){const proof=`${dir}/${id}`;fs.mkdirSync(proof,{recursive:true});const r=spawnSync(process.execPath,[npm,...args],{encoding:'utf8',maxBuffer:32e6,timeout:180000,windowsHide:true,env:{...process.env,PROOF_DIR:proof}});fs.writeFileSync(`${proof}/stdout.log`,r.stdout??'');fs.writeFileSync(`${proof}/stderr.log`,r.stderr??'');commands.push({id,command:['node',npm,...args],exitCode:r.status});console.log(`${id}: ${r.status}`);}
fs.writeFileSync(`${dir}/confirmed-tests.json`,JSON.stringify({timestamp:new Date().toISOString(),commands,passed:commands.every(c=>c.exitCode===0)},null,2));
if(!commands.every(c=>c.exitCode===0))process.exitCode=1;
