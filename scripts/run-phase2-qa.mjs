// Execute the existing 42 QA assertions without overwriting their historical evidence.
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {proofDirectory} from './proof-directory.mjs';
const source='docs/proof/phase-2/qa/independent-core.mjs';
const output=proofDirectory('core','qa42');
fs.mkdirSync(output,{recursive:true});
const runner=`docs/proof/phase-2/core/.qa42-runner-${process.pid}.mjs`;
const original=fs.readFileSync(source,'utf8');
fs.writeFileSync(runner,original.replaceAll('docs/proof/phase-2/qa',output.replaceAll('\\','/')));
const result=spawnSync(process.execPath,[runner],{encoding:'utf8',maxBuffer:32e6,timeout:180000,windowsHide:true});
fs.writeFileSync(path.join(output,'stdout.log'),result.stdout??'');
fs.writeFileSync(path.join(output,'stderr.log'),result.stderr??'');
fs.writeFileSync(path.join(output,'execution.json'),JSON.stringify({timestamp:new Date().toISOString(),source,output,assertions:'Original QA assertions unchanged; only output path redirected',executor:'Codex/internal automation; not independent remediation acceptance',exitCode:result.status,error:result.error?.message},null,2)+'\n');
process.stdout.write(result.stdout??'');process.stderr.write(result.stderr??'');
// Only remove our disposable execution copy; all results and original QA files remain.
fs.unlinkSync(runner);
process.exitCode=result.status??1;
