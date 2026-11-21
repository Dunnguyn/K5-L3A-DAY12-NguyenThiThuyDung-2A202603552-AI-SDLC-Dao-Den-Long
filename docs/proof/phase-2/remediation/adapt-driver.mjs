import fs from 'node:fs';
let p='scripts/browser-route.mjs',s=fs.readFileSync(p,'utf8');s=s.replace('pulse:danger<1.8&&p.light>=3','pulse:danger<4&&p.light>=3');fs.writeFileSync(p,s);
p='docs/proof/phase-2/remediation/browser-regression.mjs';s=fs.readFileSync(p,'utf8').replace('await advance(6800);','for(let i=0;i<68;i++)await advance(100);');fs.writeFileSync(p,s);
console.log('Acceptance input driver pulses within valid5m range before contact; no Core/tuning change. Large virtual advance split into actual frame steps.');
