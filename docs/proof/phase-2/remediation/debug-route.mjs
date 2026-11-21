import fs from 'node:fs';
import {createGame,step,gameSnapshot} from '../../../../src/core/game.js';
import {createRouteDriver} from '../../../../scripts/browser-route.mjs';
const s=createGame({night:3,seed:20261202});let aim;const drive=createRouteDriver(x=>aim=x),trace=[];for(let i=0;i<3;i++)step(s);
while(s.status==='playing'){
 const a=drive(gameSnapshot(s));for(let i=0;i<6&&s.status==='playing';i++)step(s,{...a,dash:i===0&&!!a.dash,interact:i===0&&!!a.interact,pulse:i===0&&!!a.pulse});
 if(s.sim_tick%60===3)trace.push({tick:s.sim_tick,pos:[s.player.x,s.player.y,s.player.z],vel:s.player.vel,light:s.player.light,flames:s.player.flames,lamps:s.lanterns.map(l=>[l.id,l.progress]),aim,action:a});
}
fs.writeFileSync('docs/proof/phase-2/remediation/route-trace.json',JSON.stringify({final:gameSnapshot(s),trace},null,2));console.log(JSON.stringify({status:s.status,tick:s.sim_tick,score:s.score,last:trace.slice(-4)}));
