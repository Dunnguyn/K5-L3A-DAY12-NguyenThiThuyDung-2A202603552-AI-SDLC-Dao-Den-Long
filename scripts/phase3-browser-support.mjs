import {chromium} from '@playwright/test';
import {readFileSync,mkdirSync,writeFileSync,existsSync} from 'node:fs';
import {spawn} from 'node:child_process';
const releasePath='docs/notes/phase-3-release-run.json';
const releaseRoot=existsSync(releasePath)?JSON.parse(readFileSync(releasePath,'utf8').replace(/^\uFEFF/,'')).directory:null;
export const inputRoot=process.env.BROWSER_INPUT_DIR||(releaseRoot?releaseRoot+'/inputs':JSON.parse(readFileSync('docs/notes/phase-3-browser-run.json','utf8')).directory);
export const root=process.env.BROWSER_PROOF_DIR||(releaseRoot?releaseRoot+'/browser':inputRoot);
export const baseURL=process.env.BROWSER_URL||'http://127.0.0.1:4175';
export async function ensureServer(){
 try{if((await fetch(baseURL)).ok)return null;}catch{}
 const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','--host','127.0.0.1','--port','4175','--strictPort'],{stdio:'ignore',windowsHide:true});
 for(let i=0;i<80;i++){try{if((await fetch(baseURL)).ok)return server;}catch{}await new Promise(r=>setTimeout(r,250));}
 throw Error('Vite server not ready');
}
export const launch=()=>chromium.launch({headless:true,args:['--enable-unsafe-swiftshader']});
export function evidenceDirectory(label){const dir=root+'/'+label+'-'+new Date().toISOString().replace(/[:.]/g,'-');mkdirSync(dir,{recursive:true});return dir;}
function fixtureSource(f){
 return 'const __fixture='+JSON.stringify(f)+';const __fixtureTicks=[];\n'+
 'function seedInitial(s){const f=__fixture;if(f.player)Object.assign(s.player,f.player);if(f.time_ticks!==undefined)s.time_ticks=f.time_ticks;if(f.sim_tick!==undefined)s.sim_tick=f.sim_tick;'+
 'for(const q of f.lanterns??[]){const l=s.lanterns.find(l=>l.id===q.id);Object.assign(l,q);if(q.lit&&!Object.hasOwn(q,"ever_lit"))l.ever_lit=true;}'+
 'if(f.shades)s.shades=f.shades.map((e,i)=>({id:"S"+(i+1),state:"wander",state_ticks_left:0,wander_deg:0,eviction_ticks:0,push_ticks:0,push_dir:{x:1,z:0},recoil_dir:{x:1,z:0},...e}));'+
 'if(f.fullMotes)s.motes=getWorld(s.night).motePoints.map((p,i)=>({...p,id:"PerfM"+i,kind:"random",available:true,ttl:Infinity,spawnIndex:i}));return s;}function createGame(o){return seedInitial(realCreateGame({...o,night:__fixture.night??o.night}));}'+
 'function startNight(s,n){realStartNight(s,__fixture.night??n);return seedInitial(s);}function restartNight(s){realRestartNight(s);return seedInitial(s);}\n'+
 'window.__PHASE3_FIXTURE_TICKS__=()=>structuredClone(__fixtureTicks);\n';
}
export async function newPage(browser,fixture=null,{clock=true,distinguishable=false}={}){
 const context=await browser.newContext({viewport:{width:1280,height:720},deviceScaleFactor:1}),page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 if(distinguishable)await page.addInitScript(()=>localStorage.setItem('dao-den-long-settings-v1',JSON.stringify({volume:.37,sensitivity:1.7,distinguishable:true})));
 if(fixture?.observeBlink)await page.route('**/src/browser/renderer.js*',async route=>{const response=await route.fetch();let t=await response.text();t=t.replace('progress:l.progress,cost:l.cost,barVisible:',"emissive:o.cage.material.emissiveIntensity,barHeight:l.lit?Math.hypot(...visuals.fill.instanceMatrix.array.slice((bars-1)*16+4,(bars-1)*16+7)):null,progress:l.progress,cost:l.cost,barVisible:");await route.fulfill({response,body:t});});
 if(fixture)await page.route('**/src/browser/app.js*',async route=>{
  const response=await route.fetch();let t=await response.text();
  if(!t.includes('createGame, step, gameSnapshot, startNight, restartNight'))throw Error('fixture import seam not found');
  t=t.replace('createGame, step, gameSnapshot, startNight, restartNight','createGame as realCreateGame, step, gameSnapshot, startNight as realStartNight, restartNight as realRestartNight');
  const i=t.indexOf('const $=');if(i<0)throw Error('fixture factory seam not found');t=t.slice(0,i)+fixtureSource(fixture)+t.slice(i);
  t=t.replace("screen='menu',night=1,returnScreen","screen='menu',night="+(fixture.night??1)+",returnScreen")
   .replaceAll('night=1;state=createGame','night='+(fixture.night??1)+';state=createGame');
  t=t.replace('step(state,action);','step(state,action);__fixtureTicks.push(gameSnapshot(state,{history:false}));');
  await route.fulfill({response,body:t});
 });
 if(clock)await page.clock.install();await page.goto(baseURL);await page.locator('#start-campaign').waitFor();
 if(clock)await page.clock.pauseAt(await page.evaluate(()=>Date.now()+10000));
 return {page,context,errors,fixture};
}
export async function enter(page){await page.locator('#start-campaign').click();await page.locator('#enter-night').click();}
export const snap=page=>page.evaluate(()=>window.__DAO_LANTERN_SNAPSHOT__(false));
export const events=page=>page.evaluate(()=>window.__DAO_LANTERN_EVENTS__());
export const visuals=page=>page.evaluate(()=>window.__DAO_LANTERN_VISUALS__());
export async function advance(page,ms=100){for(let left=ms;left>0;left-=100)await page.clock.fastForward(Math.min(100,left));}
export function inputController(page,record=[]){
 let held=new Set();return async (a,meta={})=>{
  const next=new Set();if(a.moveX>0)next.add('KeyD');if(a.moveX<0)next.add('KeyA');if(a.moveZ>0)next.add('KeyW');if(a.moveZ<0)next.add('KeyS');if(a.jump)next.add('Space');
  for(const k of held)if(!next.has(k))await page.keyboard.up(k);
  for(const k of next)if(!held.has(k))await page.keyboard.down(k);held=next;
  for(const[k,v]of [['Shift',a.dash],['KeyE',a.interact],['KeyQ',a.pulse]])if(v)await page.keyboard.press(k);
  record.push({...meta,...a});
 };
}
export const save=(path,value)=>writeFileSync(path,JSON.stringify(value,null,2)+'\n');
