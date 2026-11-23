import { readFileSync } from 'node:fs';
import { runScenario } from '../src/headless/adapter.js';
import { exportLeaderboard } from '../src/server/leaderboard.js';
try {let args=process.argv.slice(2),night=1;if(args[0]==='--export-leaderboard'){if(args.length!==2||!args[1].trim())throw Error('Usage: node scripts/headless.mjs --export-leaderboard <out.json>');await exportLeaderboard(args[1]);}else{if(args[0]==='--night'){night=Number(args[1]);args=args.slice(2);if(![1,2,3].includes(night))throw Error('--night must be 1, 2, or 3');}if(args.length!==1)throw Error('Usage: node scripts/headless.mjs [--night 1|2|3] <scenario.json>');const result=runScenario(JSON.parse(readFileSync(args[0],'utf8')),night);process.stdout.write(JSON.stringify(result)+'\n');}}
catch(e){process.stderr.write(JSON.stringify({error:e.message})+'\n');process.exitCode=1;}
