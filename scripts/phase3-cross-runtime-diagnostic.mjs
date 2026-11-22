import {readFileSync} from 'node:fs';
import {ensureServer,launch,evidenceDirectory,save,baseURL} from './phase3-browser-support.mjs';
import {runScenario} from '../src/headless/adapter.js';
const input=JSON.parse(readFileSync(process.argv[2],'utf8')),night=Number(process.argv[3]??1),dir=evidenceDirectory('cross-runtime');
const server=await ensureServer(),browser=await launch();
try{const page=await browser.newPage();await page.goto(baseURL);const actual=await page.evaluate(async({input,night})=>{const {runScenario}=await import('/src/headless/adapter.js');return runScenario(input,night);},{input,night});const expected=runScenario(input,night);save(dir+'/comparison.json',{kind:'Core-only cross-runtime diagnostic, not browser E2E',night,node:process.version,chromium:browser.version(),expected,actual});console.log(JSON.stringify({dir,node:expected.state.score,chromium:actual.state.score,events:[expected.state.events.length,actual.state.events.length],playerEqual:JSON.stringify(expected.state.player)===JSON.stringify(actual.state.player)}));}finally{await browser.close();server?.kill();}
