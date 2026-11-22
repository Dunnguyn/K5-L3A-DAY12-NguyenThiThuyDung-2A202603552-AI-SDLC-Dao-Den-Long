import assert from 'node:assert/strict';
import {ensureServer,launch,evidenceDirectory,newPage,enter,snap,events,visuals,advance,save,inputController} from './phase3-browser-support.mjs';
const dir=evidenceDirectory('boundaries'),server=await ensureServer(),browser=await launch(),report={scope:'Actual Chromium controlled initial-state browser fixtures; default cases explicitly marked; not full-campaign acceptance',checks:[],screenshots:[]};
async function test(id,fixture,fn,options={}){
 const x=await newPage(browser,fixture,options),c={id,kind:fixture?'controlled browser initial-state fixture':'default-state browser input',fixture,status:'RUNNING'};report.checks.push(c);
 try{await enter(x.page);await fn(x.page,c);assert.deepEqual(x.errors,[]);c.status='PASS';}
 catch(e){c.status='FAIL';c.failure=e.stack;try{await x.page.screenshot({path:dir+'/'+id+'-failure.png'});}catch{}}
 finally{c.errors=x.errors;try{c.final=await snap(x.page);c.events=await events(x.page);c.visuals=await visuals(x.page);}catch{}await x.context.close();save(dir+'/browser-boundaries.json',report);console.log(c.status+' '+id);}
}
const lamp=(id,units=6000)=>({id,lit:true,ever_lit:true,fuel_units:units});
const player={x:0,y:0,z:25};
async function photo(p,name){await p.screenshot({path:dir+'/'+name+'.png'});report.screenshots.push(name+'.png');}
try{
 await test('E2E-02-first-light',{player:{...player,light:10}},async p=>{
  assert.match(await p.locator('#toast').textContent(),/10/);await p.keyboard.press('KeyE');await advance(p,100);
  const s=await snap(p);assert.equal(s.player.capacity,12);assert.equal(s.lanterns[0].lit,true);assert.equal(s.score,150);
  assert.equal(await p.locator('#mote-bar i').count(),12);const v=await visuals(p);assert.equal(v.lamps[0].cageScaleY,1);
  await photo(p,'first-light-fuelbar');
 });
 await test('E2E-03-refuel',{player:{...player,light:2},lanterns:[lamp('L1',5100)]},async p=>{
  assert.match(await p.locator('#toast').textContent(),/Châm dầu/);await p.keyboard.press('KeyE');await advance(p,100);
  const e=(await events(p)).find(e=>e.type==='refuel');assert.equal(e.amount,2);assert.equal(e.fuel,100);assert.equal((await snap(p)).score,10);await photo(p,'refuel');
 });
 await test('full-fuel-exclusion',{player:{...player,light:3},lanterns:[lamp('L1')]},async p=>{
  assert.equal((await snap(p)).sim_tick,0);assert.equal(await p.locator('#toast.visible').count(),0);
  await advance(p,100);assert.match(await p.locator('#toast').textContent(),/Châm dầu/);
 });
 await test('E2E-04-lantern-out',{lanterns:[lamp('L1',60)],player:{...player,x:8}},async p=>{
  await advance(p,1100);const ticks=await p.evaluate(()=>window.__PHASE3_FIXTURE_TICKS__());
  for(const n of [59,60,61])assert.ok(ticks.some(s=>s.sim_tick===n),'observed exact tick'+n);
  assert.equal(ticks.find(s=>s.sim_tick===59).lanterns[0].lit,true);assert.equal(ticks.find(s=>s.sim_tick===60).lanterns[0].lit,false);
  assert.equal((await events(p)).filter(e=>e.type==='lantern_out').length,1);const v=await visuals(p);assert.equal(v.lamps[0].cageScaleY,.8);assert.equal(v.lamps[0].fuel,0);assert.equal(v.ambient,.15);await photo(p,'lantern-out-torn');
 });
 await test('E2E-05-partial-relight',{player:{...player,light:3},lanterns:[{id:'L1',ever_lit:true,progress:2}]},async p=>{
  const v=await visuals(p);assert.equal(v.lamps[0].color,'#5b5f6e');assert.equal(v.lamps[0].cost,5);assert.match(await p.locator('#toast').textContent(),/\(2\/5\)/);
  await photo(p,'partial-off-color');await p.keyboard.press('KeyE');await advance(p,100);const s=await snap(p);assert.equal(s.lanterns[0].relit_count,1);assert.equal(s.score,55);assert.equal(s.player.capacity,12);
 });
 await test('E2E-06-safe-reaction',{player:{...player,x:.5,light:1},lanterns:[lamp('L1',1207)],shades:[{id:'S1',x:0,y:0,z:25,state:'drain',target_lantern_id:'L1'}]},async p=>{
  assert.equal((await visuals(p)).safeZones,0);await p.keyboard.press('KeyE');await advance(p,34);
  const ticks=await p.evaluate(()=>window.__PHASE3_FIXTURE_TICKS__());const one=ticks.find(s=>s.sim_tick===1);assert.ok(one);assert.ok(one.shades[0].pos.x>=6);assert.equal(one.player.flames,3);
  await photo(p,'safe-reactivation');
 });
 await test('E2E-07-drain-interrupt',{player:{...player,x:4,light:3},lanterns:[lamp('L1',1200)],shades:[{id:'S1',x:0,y:0,z:25,state:'drain',target_lantern_id:'L1'}]},async p=>{
  assert.equal((await visuals(p)).drains.length,1);await photo(p,'shade-drain');await p.keyboard.press('KeyQ');await advance(p,100);assert.equal((await snap(p)).shades[0].state,'stunned');assert.equal((await snap(p)).score,15);assert.equal((await visuals(p)).drains.length,0);
  const a=await p.evaluate(()=>window.__DAO_LANTERN_AUDIO__());assert.equal(a.eventCounts.pulse,1);
  await advance(p,500);assert.equal((await p.evaluate(()=>window.__DAO_LANTERN_AUDIO__())).eventCounts.pulse,1);await photo(p,'drain-stunned-cleanup');
 });
 await test('multi-shade-drain',{player:{...player,x:10},lanterns:[lamp('L1',1740)],shades:['S1','S2'].map(id=>({id,x:0,y:0,z:25,state:'drain',target_lantern_id:'L1'}))},async p=>{
  assert.equal((await visuals(p)).drains.length,2);await advance(p,1100);assert.equal((await events(p)).filter(e=>e.type==='fuel_drain').length,2);await photo(p,'multi-drain');
 });
 await test('E2E-08-capacity20-fixture',{player:{successful_lights:5,light:20}},async p=>{
  assert.equal(await p.locator('#mote-bar i').count(),20);assert.equal(await p.locator('#bag-count').textContent(),'20/20');await photo(p,'capacity20');
 });
 await test('E2E-09-all-lit-no-early',{lanterns:['L1','L2','L3','L4','L5'].map(id=>lamp(id))},async p=>{
  assert.equal((await snap(p)).player.capacity,10);await advance(p,1100);assert.equal((await snap(p)).state,'playing');assert.equal((await snap(p)).score,0);assert.ok(Math.abs((await visuals(p)).ambient-.7)<1e-12);await photo(p,'all-lit-still-playing');
 });
 for(const n of [1,2,3])await test('E2E-10-dawn-fixture-night'+n,{night:n,time_ticks:1,lanterns:Array.from({length:[0,3,4,5][n]},(_,i)=>lamp('L'+(i+1)))},async p=>{
  await advance(p,100);const s=await snap(p);assert.equal(s.state,'won');assert.equal(s.end_reason,'dawn_survived');assert.ok(Number(await p.locator('#dawn-bonus').textContent())>0);await photo(p,'night'+n+'-dawn-fixture');
 });
 await test('E2E-11-dawn-loss',{time_ticks:1,lanterns:[lamp('L1'),lamp('L2')]},async p=>{await advance(p,100);assert.equal((await snap(p)).end_reason,'dawn');assert.equal(await p.locator('#dawn-bonus').textContent(),'0');});
 await test('E2E-12-no-flames-priority',{time_ticks:1,player:{flames:1},lanterns:[lamp('L1'),lamp('L2'),lamp('L3')],shades:[{x:.2,y:0,z:0,state:'chase'}]},async p=>{await advance(p,100);assert.equal((await snap(p)).end_reason,'no_flames');assert.equal(await p.locator('#dawn-bonus').textContent(),'0');});
 await test('E2E-14-natural-loss-retry',null,async p=>{
  const input=inputController(p);await input({moveZ:-1});for(let i=0;i<350&&(await snap(p)).state==='playing';i++)await advance(p,100);await input({});
  assert.equal((await snap(p)).end_reason,'no_flames');await photo(p,'natural-loss');await p.locator('#retry-night').click();await p.locator('#enter-night').click();
  const s=await snap(p);assert.equal(s.player.flames,3);assert.equal(s.player.capacity,10);assert.equal(s.player.light,0);assert.ok(s.lanterns.every(l=>!l.lit));await photo(p,'retry-reset');
 });
 await test('E2E-15-palette-persistence',null,async p=>{
  await p.keyboard.press('KeyP');await advance(p,100);const before=await snap(p);await p.locator('#pause-settings').click();await p.locator('#distinguishable').check();
  await p.locator('#settings-back').click();await advance(p,100);assert.equal((await snap(p)).sim_tick,before.sim_tick);assert.equal((await visuals(p)).eyes,'#00b3ff');
  await p.reload();await p.locator('#open-settings').click();assert.equal(await p.locator('#distinguishable').isChecked(),true);await photo(p,'palette-persisted');
 });
 await test('E2E-16-danger-pause-camera-audio',{time_ticks:1800,shades:[{x:20,y:0,z:0,state:'wander'}]},async p=>{
  await p.keyboard.press('KeyP');await advance(p,100);const a=await snap(p);await advance(p,300);assert.equal((await snap(p)).sim_tick,a.sim_tick);
  await p.locator('#pause-settings').click();await p.locator('#distinguishable').check();await p.locator('#volume').fill('0.2');await p.locator('#volume').dispatchEvent('input');await p.locator('#settings-back').click();await advance(p,100);
  assert.equal(await p.locator('#clock').evaluate(e=>getComputedStyle(e).color),'rgb(255, 255, 255)');assert.equal((await visuals(p)).eyes,'#00b3ff');await photo(p,'danger-white-icon');
  await p.locator('#resume').click();await advance(p,100);const v=await visuals(p);await p.mouse.move(650,400);await p.mouse.down();await p.mouse.move(750,400,{steps:4});await p.mouse.up();await advance(p,100);assert.notEqual((await visuals(p)).camera.x,v.camera.x);
  const audio=await p.evaluate(()=>window.__DAO_LANTERN_AUDIO__());assert.equal(audio.unlocked,true);assert.equal(audio.volume,.2);assert.equal(audio.contextState,'running');
 });

 await test('low-fuel-1Hz-and-pause',{player:{x:8,y:0,z:25},lanterns:[lamp('L1',1200)],observeBlink:true},async (p,c)=>{
  const samples=[];
  for(const target of [0,15,30,45,60,75]){
   while((await snap(p)).sim_tick<target)await p.clock.runFor(8);
   const v=await visuals(p);samples.push({tick:(await snap(p)).sim_tick,emissive:v.lamps[0].emissive,barHeight:v.lamps[0].barHeight});
   if(target===15||target===45)await photo(p,'low-fuel-phase-'+target);
  }
  assert.ok(samples[1].emissive>samples[3].emissive+.45);
  assert.ok(Math.abs(samples[0].emissive-samples[4].emissive)<.08);
  assert.ok(Math.abs(samples[1].emissive-samples[5].emissive)<.08);
  assert.ok(samples[1].barHeight>.9&&samples[3].barHeight<.4&&samples[4].barHeight>.9);
  await p.keyboard.press('KeyP');await advance(p,100);const before=await visuals(p);await advance(p,500);
  assert.equal((await visuals(p)).lamps[0].emissive,before.lamps[0].emissive);c.samples=samples;
 });
 await test('dash-wind-lifecycle',{night:3,sim_tick:1679,time_ticks:16321,shades:[]},async p=>{
  await p.keyboard.press('Shift');await advance(p,100);assert.equal(await p.locator('#fx.warning').count(),1);
  assert.equal(await p.locator('#fx').evaluate(e=>getComputedStyle(e).animationName),'gust');
  await advance(p,300);assert.equal(await p.locator('#fx.dash').count(),0);assert.equal(await p.locator('#fx.warning').count(),1);
  assert.equal((await p.evaluate(()=>window.__DAO_LANTERN_AUDIO__())).eventCounts.wind_warning,1);
  await p.keyboard.press('KeyP');await advance(p,100);assert.equal(await p.locator('#fx.dash').count(),0);await p.locator('#retry').click();
  assert.equal(await p.locator('#fx.dash').count(),0);await photo(p,'dash-wind-cleanup');
 });

 report.passed=report.checks.every(c=>c.status==='PASS');if(!report.passed)process.exitCode=1;
}finally{save(dir+'/browser-boundaries.json',report);await browser.close();server?.kill();console.log(JSON.stringify({directory:dir,passed:report.passed,checks:report.checks.map(c=>({id:c.id,status:c.status,failure:c.failure}))}));}
