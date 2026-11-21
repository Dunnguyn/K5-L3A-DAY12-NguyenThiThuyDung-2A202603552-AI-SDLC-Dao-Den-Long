import fs from 'node:fs';
import {createGame,step,gameSnapshot} from '../../../../src/core/game.js';
import {createRouteDriver} from '../../../../scripts/browser-route.mjs';
const out=[];
for(const n of [1,2,3]){const s=createGame({night:n,seed:20261202}),drive=createRouteDriver(),stride=n===3?3:6;for(let i=0;i<3;i++)step(s);while(s.status==='playing'){const a=drive(gameSnapshot(s));for(let i=0;i<stride&&s.status==='playing';i++)step(s,{...a,dash:i===0&&!!a.dash,interact:i===0&&!!a.interact,pulse:i===0&&!!a.pulse});}out.push({night:n,state:s.status,tick:s.sim_tick,score:s.score,lamps:s.lanterns.filter(l=>l.lit).length});console.log(JSON.stringify(out.at(-1)));}
fs.writeFileSync('docs/proof/phase-2/remediation/driver-final.json',JSON.stringify(out,null,2));
