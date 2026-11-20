import { readFileSync } from 'node:fs';
import { runScenario,validateOutput } from '../src/headless/adapter.js';
try { if(process.argv.length!==3)throw Error('Usage: node scripts/headless.mjs scenario.json (internal draft only)');console.log(JSON.stringify(validateOutput(runScenario(JSON.parse(readFileSync(process.argv[2],'utf8')))))); }
catch(error){console.error(JSON.stringify({error:error.message}));process.exitCode=1;}
