import {proofDirectory} from './proof-directory.mjs';
import {createGame,step,gameSnapshot,startNight} from '../src/core/game.js';
import {createRouteDriver} from './browser-route.mjs';
import {spawnSync} from 'node:child_process';
import {mkdirSync,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const dir=proofDirectory('core','campaign');mkdirSync(dir,{recursive:true});
const campaign=createGame({night:1,seed:20261202}),report={scope:'Default-state campaign, no scenario overrides; generated input replayed through actual headless CLI',nights:[]};
for(let night=1;night<=3;night++){
 if(night>1)startNight(campaign,night);const drive=createRouteDriver(),actions=[],stride=night===2?6:3;
 function tick(a){const last=actions.at(-1),key=JSON.stringify(a);if(last?.key===key)last.ticks++;else actions.push({...a,ticks:1,key});step(campaign,a);}
 while(campaign.status==='playing'){const a=drive(gameSnapshot(campaign));for(let i=0;i<stride&&campaign.status==='playing';i++)tick({...a,dash:i===0&&!!a.dash,interact:i===0&&!!a.interact,pulse:i===0&&!!a.pulse});}
 const input={version:'internal-draft-1',seed:20261202,actions:actions.map(({key,...a})=>a)},path=`${dir}/winning-night-${night}.input.json`;writeFileSync(path,JSON.stringify(input)+'\n');
 const cli=spawnSync(process.execPath,['scripts/headless.mjs','--night',String(night),path],{encoding:'utf8',timeout:30000,maxBuffer:16e6,windowsHide:true});writeFileSync(`${dir}/winning-night-${night}.stderr.log`,cli.stderr??'');assert.equal(cli.status,0,cli.stderr);writeFileSync(`${dir}/winning-night-${night}.actual.json`,cli.stdout);const actual=JSON.parse(cli.stdout).state;
 assert.equal(actual.state,'won',`Night ${night}: ${actual.end_reason}`);assert.equal(actual.sim_tick,campaign.sim_tick);assert.equal(actual.score,campaign.score);assert.ok(actual.lanterns.every(l=>l.lit));report.nights.push({night,sim_tick:actual.sim_tick,score:actual.score,flames:actual.player.flames,cliExitCode:cli.status,actions:input.actions.length});
}
report.campaign_score=gameSnapshot(campaign).campaign_score;assert.equal(report.campaign_score,report.nights.reduce((n,x)=>n+x.score,0));report.passed=true;writeFileSync(`${dir}/default-campaign.json`,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
