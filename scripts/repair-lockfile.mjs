// One-time lockfile repair: isolated npm project, no installed dependency tree.
import {readFileSync,writeFileSync,copyFileSync,mkdtempSync,mkdirSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import assert from 'node:assert/strict';
const dir='docs/proof/phase-2/preflight';mkdirSync(dir,{recursive:true});
const clean=mkdtempSync(join(tmpdir(),'dao-lock-repair-'));
for(const p of ['package.json','package-lock.json'])copyFileSync(p,join(clean,p));
const before=JSON.parse(readFileSync('package-lock.json'));
const r=spawnSync('cmd.exe',['/d','/s','/c','npx.cmd --yes npm@11.19.1 install --package-lock-only --ignore-scripts --no-audit --no-fund'],{cwd:clean,encoding:'utf8',timeout:180000});
writeFileSync(`${dir}/lock-repair-command.json`,JSON.stringify({cwd:clean,command:'npx --yes npm@11.19.1 install --package-lock-only --ignore-scripts --no-audit --no-fund',exitCode:r.status,stdout:r.stdout,stderr:r.stderr},null,2));assert.equal(r.status,0);
const after=JSON.parse(readFileSync(join(clean,'package-lock.json'))),changed=[];
for(const [p,v]of Object.entries(before.packages))if(after.packages[p]?.version!==v.version)changed.push(p);
assert.deepEqual(changed,[]);
for(const p of ['@emnapi/core','@emnapi/runtime'])assert.equal(after.packages[`node_modules/${p}`]?.version,'2.0.0-beta.2');
writeFileSync(`${dir}/lock-delta.json`,JSON.stringify({existingVersionsChanged:changed,added:Object.keys(after.packages).filter(p=>!before.packages[p]),parent:'vite@8.3.8 -> rolldown@1.2.19 -> optional @rolldown/binding-wasm32-wasi@1.2.19 -> @emnapi/core + @emnapi/runtime 2.0.0-beta.2',localBefore:{node:process.version,npm:'11.6.2'},phase1CI:{node:'24.22.2',npm:'11.19.1'},selected:{node:'24.13.0',npm:'11.19.1'}},null,2));
copyFileSync(join(clean,'package-lock.json'),'package-lock.json');console.log('PASS: lock repaired in clean folder, all existing versions retained');
