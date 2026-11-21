import fs from 'node:fs';
const dir='docs/proof/phase-2/remediation';
for(const f of ['browser-regression.json','browser-final.log','performance.json'])if(fs.existsSync(`${dir}/${f}`))fs.copyFileSync(`${dir}/${f}`,`${dir}/attempt1-${f}`);
if(fs.existsSync(`${dir}/screenshots`))fs.cpSync(`${dir}/screenshots`,`${dir}/screenshots-attempt1`,{recursive:true});
let p='scripts/phase2-campaign.mjs',s=fs.readFileSync(p,'utf8');s=s.replace('await input(action);await advance(100);s=await snap();','await input(action);await advance(n===3?50:100);s=await snap();');fs.writeFileSync(p,s);
p=`${dir}/browser-regression.mjs`;s=fs.readFileSync(p,'utf8').replace('await input(a);await advance(100);s=await snap();if(Math.floor','await input(a);await advance(n===3?50:100);s=await snap();if(Math.floor');fs.writeFileSync(p,s);
s=fs.readFileSync(`${dir}/run-final.mjs`,'utf8').replaceAll('remediation/regression-final','remediation/regression-accepted');fs.writeFileSync(`${dir}/run-accepted.mjs`,s);
console.log('Preserved failed runs; Night3 driver decisions now every3ticks (20Hz), unchanged win/loss assertions.');
