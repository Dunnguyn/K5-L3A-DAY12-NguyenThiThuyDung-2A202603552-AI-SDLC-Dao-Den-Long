import fs from 'node:fs';
import assert from 'node:assert/strict';
const dir='docs/proof/phase-2/remediation';
fs.copyFileSync('src/browser/app.js',`${dir}/app-before-hud-perf.js`);fs.copyFileSync('src/browser/app.css',`${dir}/css-before-hud-perf.css`);
let p='src/browser/app.css',s=fs.readFileSync(p,'utf8');assert.ok(s.includes('backdrop-filter:blur(10px)'));s=s.replace('backdrop-filter:blur(10px)','backdrop-filter:none');fs.writeFileSync(p,s);
p='src/browser/app.js';s=fs.readFileSync(p,'utf8');
s=s.replace('function updateHud(time){',"function hudText(selector,value){const e=$(selector),text=String(value);if(e.textContent!==text)e.textContent=text;}\nfunction updateHud(time){");
const pairs=[
 ["$('#night-name').textContent=`ĐÊM ${state.night} · ${state.name}`;","hudText('#night-name',`ĐÊM ${state.night} · ${state.name}`);"],
 ["clock.textContent=`${m}:${s}`;","if(clock.textContent!==`${m}:${s}`)clock.textContent=`${m}:${s}`;"],
 ["$('#lamps').textContent=`${lit}/${state.lanterns.length}`;","hudText('#lamps',`${lit}/${state.lanterns.length}`);"],
 ["$('#score').textContent=String(state.score);","hudText('#score',state.score);"],
 ["$('#dash-cd').textContent=p.dash_cd_ticks?`LƯỚT ${Math.ceil(p.dash_cd_ticks/tuning.tick_rate)}s`:'SHIFT · LƯỚT';","hudText('#dash-cd',p.dash_cd_ticks?`LƯỚT ${Math.ceil(p.dash_cd_ticks/tuning.tick_rate)}s`:'SHIFT · LƯỚT');"],
 ["$('#pulse-cd').textContent=p.pulse_cd_ticks?`TỎA SÁNG ${Math.ceil(p.pulse_cd_ticks/tuning.tick_rate)}s`:'Q · TỎA SÁNG';","hudText('#pulse-cd',p.pulse_cd_ticks?`TỎA SÁNG ${Math.ceil(p.pulse_cd_ticks/tuning.tick_rate)}s`:'Q · TỎA SÁNG');"],
 ["$('#charm-time').textContent=p.charm_ticks?`BÙA ${Math.ceil(p.charm_ticks/tuning.tick_rate)}s`:'';","hudText('#charm-time',p.charm_ticks?`BÙA ${Math.ceil(p.charm_ticks/tuning.tick_rate)}s`:'');"],
 ["$('#toast').textContent=`E — Nạp ánh sáng (${lamp.progress}/10)`;","hudText('#toast',`E — Nạp ánh sáng (${lamp.progress}/10)`);"]
];
for(const[a,b]of pairs){assert.ok(s.includes(a),a);s=s.replace(a,b);}fs.writeFileSync(p,s);
console.log('HUD values/positions/colors unchanged; decorative backdrop blur removed and unchanged text writes skipped.');
