import fs from 'node:fs';
import {createGame,step,gameSnapshot} from '../../../../src/core/game.js';
import {createRouteDriver} from '../../../../scripts/browser-route.mjs';
const reports=[];
for(const idle of [0,3,6]){const s=createGame({night:3,seed:20261202}),drive=createRouteDriver();for(let i=0;i<idle;i++)step(s);while(s.status==='playing'){const a=drive(gameSnapshot(s));for(let i=0;i<3&&s.status==='playing';i++)step(s,{...a,dash:i===0&&!!a.dash,interact:i===0&&!!a.interact,pulse:i===0&&!!a.pulse});}reports.push({idle,state:s.status,tick:s.sim_tick,score:s.score,flames:s.player.flames,lamps:s.lanterns.map(l=>l.progress)});console.log(JSON.stringify(reports.at(-1)));}
fs.writeFileSync('docs/proof/phase-2/remediation/route-stride.json',JSON.stringify(reports,null,2));
