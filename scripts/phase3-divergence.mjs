import assert from 'node:assert/strict';
import {readFileSync,mkdirSync,writeFileSync,readdirSync} from 'node:fs';
import {runtimeTrace} from './phase3-runtime-trace.mjs';
import {ensureServer,launch,baseURL} from './phase3-browser-support.mjs';
const root=process.env.RELEASE_DIR;assert.ok(root);const dir=root+'/divergence-'+Date.now();mkdirSync(dir,{recursive:true});
const source=JSON.parse(readFileSync('docs/proof/phase-3/browser/run-2026-11-21T13-19-33-241Z/e2e-2026-11-21T16-46-11-480Z/browser-e2e.json','utf8'));
if(process.env.DIVERGENCE_INPUT_DIR){const folder=readdirSync(process.env.DIVERGENCE_INPUT_DIR).filter(p=>p.startsWith('default-headless-release-')).sort().at(-1);assert.ok(folder);source.nights=[1,2,3].map(n=>({night:n,inputFile:process.env.DIVERGENCE_INPUT_DIR+'/'+folder+'/night-'+n+'.input.json'}));}
const save=(p,v)=>writeFileSync(dir+'/'+p,JSON.stringify(v,null,2)+'\n');
function diffs(a,b,path='',out=[]){if(Object.is(a,b))return out;if(a&&b&&typeof a==='object'&&typeof b==='object'){for(const k of new Set([...Object.keys(a),...Object.keys(b)]))diffs(a[k],b[k],path+'.'+k,out);}else out.push({path,node:a,chromium:b});return out;}
const server=await ensureServer(),browser=await launch(),report={node:process.version,chromium:browser.version(),kind:'Same default initial state/seed/night/actions/ticks; no campaign vs fixture comparison',nights:[]};
try{const page=await browser.newPage();await page.goto(baseURL);for(const n of source.nights){
 const input=JSON.parse(readFileSync(n.inputFile,'utf8')),night=n.night;
 const node=runtimeTrace(input,night),chromium=await page.evaluate(async({input,night})=>{const {runtimeTrace}=await import('/scripts/phase3-runtime-trace.mjs');return runtimeTrace(input,night);},{input,night});
 assert.equal(node.exact.length,chromium.exact.length);
 const first=key=>node[key].findIndex((v,i)=>JSON.stringify(v)!==JSON.stringify(chromium[key][i]))+1;
 const item={night,inputFile:n.inputFile,seed:input.seed,scenario:null,ticks:node.exact.length,initialEqual:JSON.stringify(node.initial)===JSON.stringify(chromium.initial),initialDifferences:diffs(node.initial,chromium.initial),firstExactTick:first('exact'),firstGameplayTick:first('semantic'),finalDifferences:diffs(node.final,chromium.final),scores:[node.final.score,chromium.final.score],outcomes:[node.final.end_reason,chromium.final.end_reason]};
 for(const[k,tick]of [['exact',item.firstExactTick],['gameplay',item.firstGameplayTick]])if(tick){const a=runtimeTrace(input,night,tick),b=await page.evaluate(async({input,night,tick})=>{const {runtimeTrace}=await import('/scripts/phase3-runtime-trace.mjs');return runtimeTrace(input,night,tick);},{input,night,tick});save('night-'+night+'-first-'+k+'.json',{tick,node:a.detail,chromium:b.detail,differences:diffs(a.detail,b.detail)});}
 if(!item.initialEqual){
  const canonical=await page.evaluate(async({input,night,initial})=>{const {runtimeTrace}=await import('/scripts/phase3-runtime-trace.mjs');return runtimeTrace(input,night,null,initial);},{input,night,initial:node.initial});
  assert.deepEqual(node.initial,canonical.initial,'captured initial-state fixture mismatch');
  item.identicalInitialState={kind:'diagnostic-only captured initial mote coordinate fixture, not campaign evidence',initialEqual:true,firstGameplayTick:node.semantic.findIndex((v,i)=>JSON.stringify(v)!==JSON.stringify(canonical.semantic[i]))+1,finalDifferences:diffs(node.final,canonical.final),scores:[node.final.score,canonical.final.score]};save('night-'+night+'-identical-initial-chromium.json',canonical);
 }
 save('night-'+night+'-node.json',node);save('night-'+night+'-chromium.json',chromium);report.nights.push(item);save('comparison.json',report);console.log(JSON.stringify({night,firstExactTick:item.firstExactTick,firstGameplayTick:item.firstGameplayTick,scores:item.scores,outcomes:item.outcomes}));
 }report.gameplayParity=report.nights.every(n=>!n.firstGameplayTick&&!n.identicalInitialState?.firstGameplayTick);save('comparison.json',report);if(process.env.REQUIRE_GAMEPLAY_PARITY==='1')assert.ok(report.gameplayParity,'Unresolved gameplay divergence');
}finally{await browser.close();server?.kill();console.log(dir);}
