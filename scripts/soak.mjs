import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { parseSoakArgs } from '../src/benchmark/cli.js';
import { runSoak, soakAccepted } from '../src/benchmark/soak.js';
const started=process.hrtime.bigint();
try {
 const args=parseSoakArgs(process.argv.slice(2));
 const {output,trace}=await runSoak(args);
 await writeFile(resolve(args.out),JSON.stringify(output,null,2)+'\n');
 await writeFile(resolve(args.out+'.trace.json'),JSON.stringify({pid:process.pid,elapsed_from_launcher_s:Number(process.hrtime.bigint()-started)/1e9,nights:trace},null,2)+'\n');
 console.log(JSON.stringify(output,null,2));
 if(!soakAccepted(output))process.exitCode=1;
} catch(error) { console.error(error?.stack??String(error));process.exitCode=1; }
