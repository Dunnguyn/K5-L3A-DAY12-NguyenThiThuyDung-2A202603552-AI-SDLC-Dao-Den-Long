import {createGame,step,gameSnapshot} from '../src/core/game.js';
import {createCampaignDriver} from './phase3-campaign-route.mjs';
import {writeFileSync,readFileSync,mkdirSync} from 'node:fs';
const root=JSON.parse(readFileSync('docs/notes/phase-3-browser-run.json')).directory,dir=root+'/route-search-'+Date.now();mkdirSync(dir,{recursive:true});
const report={scope:'Read-only input-policy search on default Night3; no fixtures/rule changes',attempts:[]};
outer:for(const lead of [99,90,80])for(const ground of [0,1])for(const avoid of [5,7,4]){
 Object.assign(process.env,{P3_FINAL_LEAD:String(lead),P3_GROUND_ONLY:String(ground),P3_AVOID:String(avoid),P3_CLEARANCE:avoid===4?'1.3':'2'});
 const s=createGame({night:3,seed:20261202}),drive=createCampaignDriver();let actions=[],aim={};
 while(s.status==='playing'){
  const a=drive(gameSnapshot(s,{history:false}));for(let i=0;i<3&&s.status==='playing';i++){const q={...a};if(i)for(const k of ['interact','pulse','dash'])q[k]=false;for(const k of Object.keys(q))if(q[k]===false)delete q[k];const key=JSON.stringify(q),last=actions.at(-1);if(last?.key===key)last.ticks++;else actions.push({...q,ticks:1,key});step(s,q);}
 }
 const item={lead,ground,avoid,clearance:process.env.P3_CLEARANCE,state:s.status,reason:s.end_reason,flames:s.player.flames,lit:s.lanterns.filter(l=>l.lit).length,tick:s.sim_tick,score:s.score,actions:actions.length};report.attempts.push(item);
 const i=report.attempts.length;writeFileSync(dir+'/attempt-'+i+'.input.json',JSON.stringify({seed:20261202,actions:actions.map(({key,...a})=>a)},null,2));writeFileSync(dir+'/attempt-'+i+'.actual.json',JSON.stringify(gameSnapshot(s),null,2));writeFileSync(dir+'/search.json',JSON.stringify(report,null,2));console.log(JSON.stringify(item));if(s.status==='won'){report.winner=item;break outer;}
}
writeFileSync(dir+'/search.json',JSON.stringify(report,null,2));console.log(JSON.stringify({directory:dir,winner:report.winner??null}));
