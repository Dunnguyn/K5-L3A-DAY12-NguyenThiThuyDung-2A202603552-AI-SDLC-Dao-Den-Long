import {createGame,step,gameSnapshot,startNight} from '../src/core/game.js';
import {createCampaignDriver} from './phase3-campaign-route.mjs';
import {writeFileSync,readFileSync,mkdirSync} from 'node:fs';
const root=process.env.BROWSER_INPUT_DIR||JSON.parse(readFileSync('docs/notes/phase-3-browser-run.json','utf8')).directory,dir=root+'/default-headless-'+Date.now();mkdirSync(dir,{recursive:true});
const report={kind:'default-state headless input pilot; not browser E2E',nights:[]};
for(const n of (process.argv[2]?[Number(process.argv[2])]:[1,2,3])){
 const s=createGame({night:n,seed:20261202}),drive=createCampaignDriver(),trace=[],actions=[];let stamp=-1;
 while(s.status==='playing'){
  const a=drive(gameSnapshot(s,{history:false})),batch=n===3?3:6;
  for(let i=0;i<batch&&s.status==='playing';i++){
   const input={...a};if(i)for(const key of ['dash','interact','pulse'])input[key]=false;
   for(const k of Object.keys(input))if(input[k]===false)delete input[k];
   const key=JSON.stringify(input),last=actions.at(-1);if(last?.key===key)last.ticks++;else actions.push({...input,ticks:1,key});step(s,input);
  }
  if(Math.floor(s.sim_tick/600)!==stamp){stamp=Math.floor(s.sim_tick/600);trace.push({tick:s.sim_tick,p:{...s.player},lamps:s.lanterns.map(l=>({id:l.id,lit:l.lit,ever_lit:l.ever_lit,fuel:l.fuel_units/60})),score:s.score});}
 }
 const item={night:n,state:s.status,reason:s.end_reason,flames:s.player.flames,tick:s.sim_tick,lit:s.lanterns.filter(l=>l.lit).length,score:s.score,capacity:s.player.capacity,actions:actions.length};report.nights.push(item);
 writeFileSync(dir+'/night-'+n+'.input.json',JSON.stringify({seed:20261202,actions:actions.map(({key,...a})=>a)},null,2));
 writeFileSync(dir+'/night-'+n+'.trace.json',JSON.stringify(trace,null,2));writeFileSync(dir+'/night-'+n+'.actual.json',JSON.stringify(gameSnapshot(s),null,2));console.log(JSON.stringify(item));
}
writeFileSync(dir+'/pilot.json',JSON.stringify(report,null,2));
