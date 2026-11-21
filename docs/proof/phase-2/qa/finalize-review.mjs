import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
import assert from 'node:assert/strict';
const dir='docs/proof/phase-2/qa';
const git=args=>spawnSync('git',args,{encoding:'utf8',maxBuffer:32e6});
const comparison=git(['rev-list','--left-right','--count','origin/main...HEAD']);
const check=git(['diff','--check']);
fs.writeFileSync(`${dir}/git-final-check.json`,JSON.stringify({timestamp:new Date().toISOString(),remoteTrackingComparison:{exitCode:comparison.status,stdout:comparison.stdout,stderr:comparison.stderr,meaning:'Counts are behind/ahead relative to the local origin/main tracking ref; no network fetch or remote write was performed.'},diffCheck:{exitCode:check.status,stdout:check.stdout,stderr:check.stderr},commitStat:git(['show','--stat','--oneline','9ced7a1']).stdout},null,2));
assert.equal(check.status,0);
for(const name of ['create-review.mjs','review.md']){
 const p=`${dir}/${name}`;let s=fs.readFileSync(p,'utf8');
 s=s.replace('main remains ahead1 with the same pre-existing21 tracked modifications','main and the local origin/main tracking ref currently match (behind0/ahead0), differing from the reported ahead1 baseline; there are the same pre-existing21 tracked modifications');
 fs.writeFileSync(p,s);
}
const cases=[
 ['E2E-01','PASS','Menu and night intro','existing-browser/browser-e2e.json'],
 ['E2E-02','PASS','Default Night1 win:5/5,1417points; production rerun also won','browser-independent.json'],
 ['E2E-03','PARTIAL','Default Night2 win:6/6,1640; bridge/pads/charm exercised; no dedicated browser theft/drop oracle for every Drifter transition (Core fixtures cover FSM)','browser-independent.json; existing-browser/browser-e2e.json'],
 ['E2E-04','FAIL','Default Night3 win:7/7,1736; tiers/slopes/wind traversed, but wind warning hidden after dash F06; bell collision assertions are Core-scoped','browser-independent.json; independent-results-final.json'],
 ['E2E-05','PASS','Actual-input full campaign and Binh Minh4793; arithmetic verified','browser-independent.json; screenshots/qa-full-campaign-dawn.png'],
 ['E2E-06','PASS','Natural failure and correct-night retry reproduced; repeated Night3 UI restart sampled; no direct outcome mutation','existing-browser/browser-e2e.json; boundaries/boundaries.json; browser-independent.json'],
 ['E2E-07','PASS','Pause freezes sim/time; resume works; respawn/dash/charm/stun timer freeze separately asserted in Core','browser-independent.json; independent-results-final.json'],
 ['E2E-08','PASS','Keyboard settings changes persist through reload','browser-independent.json'],
 ['E2E-09','PASS','HUD bag/cooldown/offscreen arrow, countdown red/blink/readability','existing-browser/browser-e2e.json; boundaries/boundaries.json'],
 ['E2E-10','PARTIAL','Audio unlock/master gain/volume/mute/events/countdown checked programmatically; subjective listening NOT VERIFIED','browser-independent.json; boundaries/boundaries.json'],
 ['E2E-11','FAIL','Camera quaternion and ordinary jump/dash/fall/respawn tested; underside snap F03 and dash tail F02 remain','native-underside-analysis.json; independent-results-final.json; browser-independent.json'],
 ['E2E-12','FAIL','Ambient formula/environment/character constants inspected and actual campaign screenshots; partial unlit lamp material fails palette F07','browser-independent.json; screenshots/qa-partial-charge.png']
].map(([id,status,actual,evidence])=>({id,status,actual,evidence}));
fs.writeFileSync(`${dir}/browser-e2e-review.json`,JSON.stringify({method:'Automated Chromium actual-input E2E; read-only observations, no game-state mutation. Screenshots visually inspected; no human manual full-game play or audio listening claimed.',cases},null,2));
fs.writeFileSync(`${dir}/browser-e2e-review.md`,'# Browser E2E acceptance mapping\n\nAutomated actual-input browser runs; headless fixture tests are identified separately. No direct state mutation creates a win/loss. PASS applies to the stated observations, not all related systems.\n\n| Case | Status | Observed scope / limitation | Evidence |\n|---|---|---|---|\n'+cases.map(c=>`| ${c.id} | ${c.status} | ${c.actual} | ${c.evidence} |`).join('\n')+'\n');
const p=`${dir}/review.md`;
fs.appendFileSync(p,'\nCommit audit:9ced7a1 changes51files (+2456/-244), adding the shared three-world Core/data, browser app/renderer/audio/CSS, headless adapter/manifest/scripts, tests, requirements/notes and early evidence. The current delivery also depends on21 modified tracked files and untracked recovery helpers/evidence outside HEAD; therefore HEAD alone does not preserve the reviewed completed candidate. Requirements and historical evidence are unchanged during this QA, as verified by baseline hashes. See git-final-check.json for the full commit stat and actual behind0/ahead0 tracking-ref result. No fetch/push was performed.\n\nE2E-01 through E2E-12 are individually mapped in browser-e2e-review.md/json, including the partial Drifter browser oracle and audio listening limitation. git diff --check exited0; line-ending warnings are preserved in git-final-check.json.\n');
console.log(JSON.stringify({gitComparison:comparison.stdout.trim(),diffCheckExit:check.status,e2eCases:cases.length}));
