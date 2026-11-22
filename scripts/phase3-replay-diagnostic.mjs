import {readFileSync,writeFileSync} from 'node:fs';
import {createGame,step,gameSnapshot} from '../src/core/game.js';
const path=process.argv[2],report=JSON.parse(readFileSync(path,'utf8')),night=report.nights.at(-1),input=JSON.parse(readFileSync(night.inputFile,'utf8'));
const s=createGame({night:night.night,seed:input.seed}),points=new Map(night.checkpoints.map(c=>[c.tick,c])),differences=[];
for(const action of input.actions)for(let i=0;i<action.ticks;i++){
 const a={...action};if(i>0)for(const k of ['jump','interact','pulse','glow','restart'])a[k]=false;step(s,a);
 const b=points.get(s.sim_tick);if(b){const n=gameSnapshot(s,{history:false});if(b.score!==n.score||JSON.stringify(b.lamps)!==JSON.stringify(n.lanterns))differences.push({tick:s.sim_tick,expectedScore:n.score,browserScore:b.score,expectedLamps:n.lanterns,browserLamps:b.lamps});}
}
const expected=gameSnapshot(s),actual=night.final;
const result={differences,expected,actual};writeFileSync(path.replace('browser-e2e.json','replay-diagnostic.json'),JSON.stringify(result,null,2));
console.log(JSON.stringify({first:differences[0],final:actual&&{score:[expected.score,actual.score],player:[expected.player,actual.player],events:[expected.events.length,actual.events.length]}}));
