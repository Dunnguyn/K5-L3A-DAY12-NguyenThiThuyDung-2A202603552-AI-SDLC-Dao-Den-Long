import fs from 'node:fs';
const dir='docs/proof/phase-2/remediation';
let s=fs.readFileSync(`${dir}/run-existing.mjs`,'utf8').replaceAll("const dir='docs/proof/phase-2/remediation'","const dir='docs/proof/phase-2/remediation/regression-final'");
fs.writeFileSync(`${dir}/run-final.mjs`,s);
s=fs.readFileSync(`${dir}/browser-independent.mjs`,'utf8');
s=s.replace("if(material.color.toUpperCase()!=='#5B5F6E')", "assert.equal(material.color.toUpperCase(),'#5B5F6E','F07 partial cage base color');pass('F07 partial unlit material retains canonical color',{actual:material.color,progress:partial.progress});if(material.color.toUpperCase()!=='#5B5F6E')");
s=s.replace("if((ui.className.includes('warning')||ui.className.includes('wind'))&&ui.opacity===0)","if(ui.className.includes('warning')||ui.className.includes('wind')){assert.ok(ui.opacity>0,'F06 wind feedback hidden');report.windVisible={night:s.night,tick:s.sim_tick,...ui};}if((ui.className.includes('warning')||ui.className.includes('wind'))&&ui.opacity===0)");
s=s.replace("if(n===3){await page.keyboard.press('Shift');await advance(100);}for(let i=1;i<=(n===3?3:1);i++)await perf(n,i);if(n===1)await partialLampCheck();", "if(n===1){await defectInputs();await partialLampCheck();}if(n===3){await page.keyboard.press('Shift');await advance(100);for(let i=1;i<=2;i++)await perf(n,i);}");
s=s.replace("report.functionalPassed=true;", "assert.deepEqual(report.findings,[],'Browser defect observations must be empty');assert.ok(report.windVisible,'Wind warning/gust was not exercised');report.functionalPassed=true;");
const helpers=`
async function defectInputs(){
 await retry();await input({moveX:1,dash:true});await advance(100);const d=await snap();assert.ok(Math.abs(d.player.vel.x-14)<1e-6);await input({});await advance(200);const stop=await snap();assert.ok(Math.abs(stop.player.vel.x)<1e-6,'F02 browser stop');assert.ok(!(await page.locator('#fx').getAttribute('class')).includes('dash'),'F06 stale dash');
 pass('F01/F02/F06 real-input dash speed14, stop and FX expiry',{dash:d.player.vel,stop:stop.player.vel});
 await retry();await input({dash:true});await advance(50);await page.keyboard.press('Escape');await advance(100);assert.ok(!(await page.locator('#fx').getAttribute('class')).includes('dash'));const frozen=await snap();await advance(500);assert.equal((await snap()).sim_tick,frozen.sim_tick);await page.locator('#resume').click();await advance(400);assert.ok(!(await page.locator('#fx').getAttribute('class')).includes('dash'));pass('F06 dash pause cleanup and resume expiry');
 await retry();await input({dash:true});await advance(50);await retry();assert.ok(!(await page.locator('#fx').getAttribute('class')).includes('dash'));pass('F06 dash retry cleanup');
 await retry();await input({moveX:1});await advance(6800);await input({moveX:-1});const trace=[];for(let i=0;i<30;i++){const before=await snap();await advance(1000/60);const after=await snap();trace.push({tick:after.sim_tick,before:before.player,after:after.player});assert.ok(after.player.y<=before.player.y+1e-7,'F03 upward underside snap');}report.terrainTrace=trace;assert.ok(trace.some(t=>t.after.x<40&&t.after.y<-.1),'Did not re-enter below island');await photo('after-underside-no-snap');pass('F03 actual-input underside re-entry does not snap');await retry();
}
`;
s=s.replace('try{\n for(let i=0;i<80;',helpers+'\ntry{\n for(let i=0;i<80;');
fs.writeFileSync(`${dir}/browser-regression.mjs`,s.replaceAll('browser-independent.json','browser-regression.json'));
console.log('Prepared unchanged npm regression and read-only real-input browser remediation checks.');
