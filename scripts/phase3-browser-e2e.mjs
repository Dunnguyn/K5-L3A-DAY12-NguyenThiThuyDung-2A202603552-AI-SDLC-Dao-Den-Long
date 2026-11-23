import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {readdirSync,readFileSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
import os from 'node:os';
import {ensureServer,launch,evidenceDirectory,newPage,enter,snap,events,visuals,advance,save,inputController,root,inputRoot} from './phase3-browser-support.mjs';
const dir=evidenceDirectory('e2e'),report={scope:'Full default campaign via real Playwright keyboard input replay; no game-state injection, no browser fixture route for campaign. Playwright clock accelerates rendering time; FPS is measured separately with native clocks.',
 startedAt:new Date().toISOString(),os:{platform:os.platform(),release:os.release(),arch:os.arch()},viewport:{width:1280,height:720},checks:[],nights:[],errors:[]};
const check=(id,details={})=>{report.checks.push({id,status:'PASS',...details});save(dir+'/browser-e2e.json',report);console.log('PASS '+id);};
const server=await ensureServer();let browser,x;
try{
 if(process.env.SKIP_BOUNDARIES!=='1'){
  const r=spawnSync(process.execPath,['scripts/phase3-browser-boundaries.mjs'],{encoding:'utf8',timeout:300000,maxBuffer:16e6});
  writeFileSync(dir+'/boundary-command.log',r.stdout+r.stderr);assert.equal(r.status,0,r.stdout+r.stderr);
  const folder=readdirSync(root).filter(n=>n.startsWith('boundaries-')).sort().at(-1);
  const boundary=JSON.parse(readFileSync(root+'/'+folder+'/browser-boundaries.json','utf8'));
  assert.equal(boundary.passed,true);report.boundaries={directory:root+'/'+folder,checks:boundary.checks.map(c=>({id:c.id,status:c.status,kind:c.kind}))};check('Controlled boundary suite', {count:boundary.checks.length});
 }
 const candidates=readdirSync(inputRoot).filter(n=>n.startsWith('default-headless-')).sort().reverse(),inputFiles={};
 for(const n of [1,2,3]){
  const folder=candidates.find(d=>{try{return JSON.parse(readFileSync(inputRoot+'/'+d+'/night-'+n+'.actual.json','utf8')).state==='won';}catch{return false;}});
  assert.ok(folder,'missing default-state winning input for Night '+n);
  const inputFile=inputRoot+'/'+folder+'/night-'+n+'.input.json',input=JSON.parse(readFileSync(inputFile,'utf8'));assert.equal(input.scenario,undefined);assert.equal(input.seed,20261202);
  const r=spawnSync(process.execPath,['scripts/headless.mjs','--night',String(n),inputFile],{encoding:'utf8',timeout:30000,maxBuffer:16e6});
  writeFileSync(dir+'/night-'+n+'-cli.log',r.stdout+r.stderr);assert.equal(r.status,0,r.stderr);
  const expected=JSON.parse(r.stdout).state;assert.equal(expected.state,'won');inputFiles[n]={inputFile,input,expected};
 }
 browser=await launch();report.browser=browser.version();x=await newPage(browser);const p=x.page;
 // Browser and Node V8 builds can differ in floating-point math used by AI.
 // Validate input fidelity against a separate Core-only Chromium run, without
 // exposing or mutating the campaign state. Keep the Node comparison explicit.
 report.crossRuntime=[];
 for(const n of [1,2,3]){
  const input=inputFiles[n].input;
  const results=await p.evaluate(async({input,n})=>{const {runScenario}=await import('/src/headless/adapter.js');return [runScenario(input,n),runScenario(input,n)];},{input,n});
  assert.deepEqual(results[0],results[1],'Chromium seeded replay must be deterministic');
  save(dir+'/night-'+n+'-chromium-core.json',results[0]);
  report.crossRuntime.push({night:n,nodeScore:inputFiles[n].expected.score,chromiumCoreScore:results[0].state.score,exactParity:JSON.stringify(inputFiles[n].expected)===JSON.stringify(results[0].state),chromiumDeterministic:true});
  inputFiles[n].browserExpected=results[0].state;
 }
 report.campaignFixture=null;report.campaignNetworkInterception=false;
 await p.screenshot({path:dir+'/menu.png'});await p.locator('#start-campaign').click();assert.match(await p.locator('#panel').textContent(),/bình minh/);
 await p.screenshot({path:dir+'/night-1-intro.png'});await p.locator('#enter-night').click();check('E2E-01 menu to Night1');
 let total=0;const sent=[];
 const send=inputController(p,sent);
 for(const n of [1,2,3]){
  const candidate=inputFiles[n],initial=await snap(p);
  assert.equal(initial.night,n);assert.equal(initial.sim_tick,0);assert.equal(initial.player.flames,3);assert.equal(initial.player.light,0);assert.equal(initial.player.capacity,10);
  assert.ok(initial.lanterns.every(l=>!l.lit&&l.fuel===0&&!l.ever_lit));
  const entry={night:n,kind:'DEFAULT STATE / REAL KEYBOARD INPUT',fixture:null,inputFile:candidate.inputFile,initial,frames:[],checkpoints:[],status:'RUNNING'};
  report.nights.push(entry);let s=initial,checkpoint=-1;
  for(let index=0;index<candidate.input.actions.length;index++){
   const a=candidate.input.actions[index],startTick=s.sim_tick,target=startTick+a.ticks;let releasedJump=false;
   await send(a,{night:n,index,sim_tick:s.sim_tick,target_tick:target});
   let watchdog=0;
   while(s.sim_tick<target&&s.state==='playing'){
    // The CLI treats jump as a one-tick command per action segment. Release
    // Space after that tick, while retaining movement for the remaining ticks.
    if(a.jump&&!releasedJump&&s.sim_tick>startTick){await send({...a,jump:false,dash:false,interact:false,pulse:false},{night:n,index,sim_tick:s.sim_tick,jumpRelease:true});releasedJump=true;}
    const left=(a.jump&&!releasedJump?startTick+1:target)-s.sim_tick;
    if(left<=3)await p.clock.runFor(8);else await p.clock.fastForward(Math.min(500,(left-2)*1000/60-17));
    s=await snap(p);
    assert.ok(s.sim_tick<=target,'clock/input segment overshot '+target+' got '+s.sim_tick);
    if(++watchdog>10000)throw Error('clock stalled');
    if(Math.floor(s.sim_tick/600)!==checkpoint){
     checkpoint=Math.floor(s.sim_tick/600);entry.checkpoints.push({tick:s.sim_tick,time:s.time_s,flames:s.player.flames,bag:s.player.light,capacity:s.player.capacity,score:s.score,lamps:s.lanterns});
     save(dir+'/browser-e2e.json',report);console.log('Night '+n+' tick '+s.sim_tick+' lamps '+s.lanterns.filter(l=>l.lit).length+' flames '+s.player.flames);
    }
   }
   entry.frames.push({index,sim_tick:s.sim_tick,action:a});if(s.state!=='playing')break;
  }
  await send({}, {night:n,release:true});entry.final=await p.evaluate(()=>window.__DAO_LANTERN_SNAPSHOT__());entry.audio=await p.evaluate(()=>window.__DAO_LANTERN_AUDIO__());entry.visuals=await visuals(p);
  save(dir+'/night-'+n+'-keyboard-inputs.json',sent.filter(a=>a.night===n));
  save(dir+'/night-'+n+'-actual.json',entry.final);
  await p.screenshot({path:dir+'/night-'+n+'-'+entry.final.state+'.png'});
  assert.equal(entry.final.state,'won');assert.equal(entry.final.end_reason,'dawn_survived');
  assert.equal(entry.final.sim_tick,[0,14400,16200,18000][n]);assert.equal(entry.final.score,candidate.browserExpected.score);
  for(const field of ['player','lanterns','shades','motes','drifters','wind','events'])assert.deepEqual(entry.final[field],candidate.browserExpected[field],'Keyboard replay differs from Chromium Core: '+field);
  assert.equal(entry.final.player.capacity,20);assert.ok(entry.final.lanterns.filter(l=>l.lit).length>=[0,3,4,5][n]);
  const lights=entry.final.events.filter(e=>e.type==='lantern_lit');assert.ok(lights.some(e=>!e.relight));assert.ok(entry.final.events.some(e=>e.type==='mote_picked'));
  entry.status='PASS';total+=entry.final.score;assert.equal(entry.final.campaign_score,total);
  check('E2E-10 default Night '+n+' dawn victory',{tick:entry.final.sim_tick,lit:entry.final.lanterns.filter(l=>l.lit).length,score:entry.final.score,flames:entry.final.player.flames});
  if(n===1){check('E2E-02 first light from default collection',{firstLights:lights.filter(e=>!e.relight).length});check('E2E-04/E2E-05 natural out and relight from default input',{out:entry.final.events.filter(e=>e.type==='lantern_out').length,relights:lights.filter(e=>e.relight).length});check('E2E-08 capacity20 from actual successful lights');}
  if(n<3){await p.locator('#next-night').click();await p.screenshot({path:dir+'/night-'+(n+1)+'-intro.png'});await p.locator('#enter-night').click();}
 }
 assert.equal(await p.evaluate(()=>window.__DAO_LANTERN_SCREEN__()),'dawn');
 assert.equal(await p.locator('#leaderboard-form').count(),1,'Dawn must offer leaderboard submission');
 assert.equal(await p.locator('#leaderboard-name').getAttribute('pattern'),'[A-Za-z0-9_]{3,12}');
 await p.locator('#panel').evaluate(el=>el.scrollTop=el.scrollHeight);
 await p.screenshot({path:dir+'/dawn-leaderboard-form.png'});check('WS3 leaderboard form after default-input Dawn');
 report.campaign={status:'PASS',scores:report.nights.map(n=>n.final.score),total,fixture:null,inputOnly:true};
 await p.screenshot({path:dir+'/full-campaign-binh-minh.png'});check('E2E-13 full default campaign to Binh Minh',{total});
 report.errors=x.errors;assert.deepEqual(x.errors,[]);report.passed=true;
}catch(e){report.passed=false;report.failure=e.stack;process.exitCode=1;if(x)try{report.failureState=await snap(x.page);await x.page.screenshot({path:dir+'/failure.png'});}catch{}}
finally{report.finishedAt=new Date().toISOString();save(dir+'/browser-e2e.json',report);if(x)await x.context.close();await browser?.close();server?.kill();console.log(JSON.stringify({directory:dir,passed:report.passed,failure:report.failure,campaign:report.campaign}));}
