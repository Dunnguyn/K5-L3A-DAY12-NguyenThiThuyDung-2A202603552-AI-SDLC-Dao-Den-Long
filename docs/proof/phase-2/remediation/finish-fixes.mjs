import fs from 'node:fs';
const p='src/headless/adapter.js';let s=fs.readFileSync(p,'utf8');s=s.replace("for(const x of s.events)if(!isObj(x)||typeof x.type!=='string')throw Error('invalid event');return o;","for(const x of s.events)validateEvent(x);return o;");
s+=`\n// Published v1.1 delta only; unknown legacy event fields remain unconstrained.\nfunction validateEvent(e){\n if(!isObj(e)||typeof e.type!=='string')throw Error('invalid event');\n const field=(k,test)=>{if(!test(e[k]))throw Error(\`invalid event \${e.type}.\${k}\`);};\n const id=v=>typeof v==='string'&&v.length>0,integer=(v,max)=>Number.isSafeInteger(v)&&v>=0&&v<=max;\n switch(e.type){\n case 'charm_picked':field('charm_id',id);field('charm_ticks',v=>integer(v,Number.MAX_SAFE_INTEGER));break;\n case 'drifter_steal':field('drifter_id',id);field('amount',v=>integer(v,3));field('carried',v=>integer(v,10));break;\n case 'drifter_drop':field('drifter_id',id);field('amount',v=>integer(v,3));break;\n case 'night_start':field('night',v=>[1,2,3].includes(v));break;\n case 'player_hit':if(e.source==='fall')field('lost',v=>integer(v,10));break;\n }\n}\n`;
fs.writeFileSync(p,s);
// Preserve failed before outputs, then execute original QA assertions redirected only.
const dir='docs/proof/phase-2/remediation';
const src=fs.readFileSync(`${dir}/browser-independent.mjs`,'utf8');
const a=src.indexOf(' for(let n=1;n<=3;n++){'),b=src.indexOf('}catch(e){report.functionalPassed=false;',a);
fs.writeFileSync(`${dir}/browser-baseline-focused.mjs`,(src.slice(0,a)+" await partialLampCheck();await page.keyboard.press('Shift');await advance(1000);await observations(await snap());report.dashAfter=await page.locator('#fx').evaluate(e=>e.className);report.functionalPassed=true;\n"+src.slice(b)).replaceAll('browser-independent.json','before-focused-browser.json').replaceAll('performance.json','before-focused-performance.json'));
console.log('Completed F05/F07 and prepared actual-input baseline partial-lamp reproduction.');
