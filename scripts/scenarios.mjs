import assert from 'node:assert/strict';
import { writeFileSync,mkdirSync } from 'node:fs';
import { createGame,step,distance } from '../src/core/game.js';
import { runScenario } from '../src/headless/adapter.js';
const dir=process.env.PROOF_DIR || 'docs/proof/phase-1';mkdirSync(dir,{recursive:true});
const s=createGame(),actions=[];
function advance(a){actions.push({ticks:1,...a});step(s,a);}
function go(p){let budget=1000;while(distance(s.player,p)>.18&&s.status==='playing'&&budget--){let dx=p.x-s.player.x,dz=p.z-s.player.z,n=Math.hypot(dx,dz);advance({moveX:dx/n,moveZ:dz/n});}assert.ok(budget>0,'route timeout');}
for(const l of s.lanterns){for(const f of s.fireflies.filter(f=>Math.floor(f.id/8)===l.id).slice(0,6))go(f);go(l);advance({interact:true});}
assert.equal(s.status,'won');
const win={version:'internal-draft-1',actions};const loss={version:'internal-draft-1',actions:[{ticks:3600}]};
for(const [name,input,status] of [['win',win,'won'],['loss',loss,'lost']]){const a=runScenario(input),b=runScenario(input);assert.deepEqual(a,b);assert.equal(a.state.status,status);writeFileSync(`${dir}/${name}.input.json`,JSON.stringify(input));writeFileSync(`${dir}/${name}.actual.json`,JSON.stringify(a,null,2));writeFileSync(`${dir}/${name}.expected.json`,JSON.stringify({status,deterministic:true}));}
console.log('PASS: default-world win route and idle loss, deterministic replay; no teleport or config overrides.');
