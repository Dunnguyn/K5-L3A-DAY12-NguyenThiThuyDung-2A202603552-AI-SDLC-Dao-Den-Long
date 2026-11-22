# Phase 3 — acceptance criteria and test strategy

**Core criteria now implemented and tested; browser criteria remain NOT VERIFIED.** The original planning oracles below are retained; see the current execution/migration section at the end. Expected values below are proposed test oracles, not execution evidence. Where noted, they depend on [ADR A1–A9](../decisions/ADR-phase-3-lantern-fuel.md).

Layers: U = unit/component with an explicit initial fixture or pure stage function; H = actual CLI scenario; B = Chromium with real input and read-only observation. Setting time_ticks=1 in a unit fixture is not a default campaign or a supported CLI override.

## Acceptance criteria

| Test ID | Given / When | Expected, including boundaries | Layer |
|---|---|---|---|
| F01 | Pre-lit fuel 1, no drain; active ticks 59/60/61 | Fuel 1/60 and lit after 59; out/0 at 60; no repeated out at 61. Isolated fuel 100 lasts 6,000 active ticks | U,H |
| F02 | Fuel reaches/crosses 0 with multiple drainers | Clamp 0; lit=false; deposited/progress=0; preserve ever_lit and relit_count; one out event; ambient and safe zone decrease. No decay while off | U,H,B |
| F03 | F60=1801 followed by three natural-decay ticks | Tick 1: 1800, safe; tick 2: 1799, unsafe; tick 3 still unsafe. Both boundary values may serialize as 30.0. Fuel never exceeds 100 | U,H |
| F04 | Pre-interaction fuel 80/90/99.9; bag 0/1/2/20 | Apply ceil and clamp. At 99.9, one mote adds only 0.1 actual fuel but scores 5; no lighting-counter increase. amount follows approved A1 | U,H |
| F05 | At pure step 5: full nearby lamp and eligible farther lamp; equal distances and radius boundaries | Exclude full lamps before nearest/ID selection; retain 3D radius 2. Full-only interaction consumes nothing, emits nothing, scores nothing | U,H where reachable |
| F06 | Integration tick begins lit at 100; player has a mote and presses E | Step 2 reduces to 99+59/60; step 5 consumes one mote and scores 5. Do not incorrectly expect a no-op from start-of-tick fullness | U,H |
| F07 | Never-lit deposits 6 then 4; previously out lamp deposits 2 then 3 | First cost 10, relight cost 5; partial deposits persist. Completion sets fuel 100; first relit_count=0, relight increments it. Out clears partial but preserves history | U,H,B |
| F08 | Ignite at step 5 of tick k; observe tick k+1 | Fuel=100 on ignition tick, first decay next tick; each lighting/capacity/event update occurs once | U,H |
| A01 | Wander sees weak lit and off lamps; player outside detection | Prefer nearest weak lit even if an off lamp is closer; tie by ID. Without weak target choose nearest off. Chase does not retarget lamps; fallback awaits A6 | U,H |
| A02 | Target distance XZ = 2−ε/2/2+ε; spawning/new drain | Enter stationary drain at ≤2 only. Entry at AI step 8 of k first drains at step 2 of k+1. Spawn at step 10 cannot interact earlier that tick. Test different Y without inventing a height guard | U,H |
| A03 | K=0/1/2/3 drainers, F60=1799; reorder Shades | Lose 1+5K subunits/tick, clamp 0; K=2 reaches out at tick 164 if eligibility persists. Same IDs yield deterministic aggregate/events despite input ordering | U,H |
| A04 | Refill weak lamp to 29.983/30/30.017 with Shades inside 6 | Below 30 inactive; exactly 30 active, eviction within 30 ticks and no contact while evicting. Shared predicate in safe/AI/contact; Drifter still steals. A3 controls state order | U,H,B |
| A05 | Pulse hits a draining Shade in existing 3D range | Earlier step-2 drain remains; pulse total 15, stun 120 ticks/push 4m over 15 ticks. Next tick has no drain from stunned Shade. Re-pulse of stunned target scores normal 5 | U,H |
| A06 | Drain exit: player distance 6−ε/6/6+ε; target off/healthy/out of range | Apply approved A3/A6/A9 guards. Retain generic wander detection 12 and abandon 18. Stun expiry returns wander; no drain while stunned/recoiling or invalidly evicting | U,H |
| A07 | Enter drain at tick 17; 59/60/61 eligible ticks; pause, interruption, re-entry and simultaneous actors | Under A2, first event after 60 eligible ticks, not global tick 60; pause freezes, exit resets. Due events share final fuel and precede out in approved stable order | U,H |
| W01 | Each default night without earlier terminal outcome | 240/270/300 seconds. Check 14399/14400/14401, 16199/16200/16201, 17999/18000/18001 active ticks. Terminal tick+1 cannot decay or score again | U,H |
| W02 | All lamps lit or sufficient ratio before dawn | Remain playing; fuel continues decreasing; no early win or time bonus. No invented continuous-60%-uptime requirement | U,H,B |
| W03 | At dawn alive with N1 counts 2/3/4, N2 3/4/5, N3 4/5/6 | Below 3/4/5 loses with dawn; at/above wins with dawn_survived. Ever-lit but currently off does not count | U,H,B |
| W04 | Last-tick out crosses threshold, or step-5 relight restores it | Evaluate after updates: out can cause loss; same-tick relight can restore victory. Check F60=1 vs 2; score from raw fuel | U,H |
| W05 | Sufficient lit count but fatal hit/fall on final tick | no_flames takes precedence, no dawn bonus; one game_over on the exact tick, then freeze. Audit fatal-fall short-circuit | U,H |
| I01 | 0/1/4/5/6 successful ignitions, including relights | Capacity 10/12/18/20/20; count occurrences, not distinct lamps. Partial/refuel do not count. Step-5 increase cannot retroactively pick up at step 4 | U,H,B |
| I02 | Scenario pre-lit lamps; omitted counter or explicit successful_lights=3 | Capacity 10 or 16; pre-lit lamps never auto-count. Normalize explicit counter before bag validation | U,H |
| I03 | Retry/new night; bag 20 theft/fall/hit | Reset counter/bag to 0 and cap to 10; preserve settings and earlier won scores. Theft 3 leaves carried 17; fall lost 20; hit drops 10 with inherited TTL 480 | U,H,B |
| S01 | First deposit 10; relight 5; refuel used 2; partial 6 | Score deltas 150/65/10/30 without dawn bonus. No repeated first-light 100. Used=0 gives 0 | U,H |
| S02 | Pulse hits drain and ordinary targets in same tick | Sum 15 per pre-hit draining target and 5 per other target exactly once. Refuel→safe→pulse→AI follows A3; do not classify after applying stun | U,H |
| S03 | Five pre-lit fuel-100 lamps at dawn, 3 Flames, one natural-decay tick | Bonus 895 = 5*(50+floor(5999/60))+150. Fresh-lit final-tick lamp bonus 150; lit fuel .9 bonus 50; off bonus 0; loss bonus 0; no time bonus | U,H |
| U01 | Healthy/low/out/partial lamps and fuel boundaries | Fuel bar; lamp and bar blink 1 Hz only below 30; no out glow. Ambient=.15+.55*currentLit/N may decrease. HUD shows bag/current capacity through 20 | B |
| U02 | Toggle, reload/new context, retry/new night; missing/corrupt storage | A7 persistence retains volume/sensitivity. Actual edge+eyes normal #7A3CFF, enabled #00B3FF; danger #FF5A5F→#FFFFFF plus ⚠. Probe clock/border/hurt styles and normal/instanced material paths | B, optional UI unit |
| U03 | Compare off/lit under grayscale, every night/mode | Under A7, off paper cage height .8 with torn silhouette; restore lit shape. Pole/collider unchanged; clear stale material/instance state across stun/pause/menu/retry | B |
| C01 | Manifest/config/night selection and snapshots | Eight added tuning keys and durations match Ticket; finite one-decimal numeric fuel, off 0, Boolean ever_lit, nonnegative integer relit_count, derived capacity, drain enum | U,H |
| C02 | Missing/null/wrong type/NaN/Inf/negative/out-of-range fields | Clear path errors; bag 11 accepted at cap 12, rejected at cap 10. Preserve existing required arrays and valid enum members | U,H |
| C03 | Lit scenario with fuel omitted; empty/partial overrides; bad IDs | Official fuel default 100; other normalization follows approved A4/A5. No silent inconsistent tuple repair or fabricated runtime lighting events | U,H |
| C04 | Valid/missing/malformed fuel event payloads and relight flag | Per-event matrix in migration document; used=0 emits none; out once; approved 60-tick drain cadence and full ordered trace | U,H |
| C05 | Victory/loss/fatal fall and repeated terminal steps | dawn_survived/dawn/no_flames reasons; game_over once at step 11 under A8; no new all_lit/victory reason or replay duplicates | U,H |
| R01 | Same seed/actions/scenario twice; different render rates and inserted pauses | Same active simulation and event stream after separating pause metadata. No wall-clock fuel/counters. Retain maps and seven remediation regressions | U,H,B |
| R02 | Inherited systems, campaign, CI and performance | Explicit migration ledger, no silent skips. Full Night 3: 18,000 active ticks≤30s. Each browser night ≥60s native sampling, repeat Night 3; actual GPU only if exercised | H,B,CI |

## Required same-tick traces

1. time=1, F60=1: step-2 out → insufficient lit count → dawn loss. Out precedes terminal event.
2. Same fixture with bag 5 and E at an ever-lit out lamp: relight at step 5, capacity +2, fuel 100, sufficient ratio can win if alive. Preserve both out and lighting events.
3. Drain at 2 → pickup at 4 → refuel at 5 → safety at 6 → pulse at 7 → AI at 8 → contact at 9. No refund of earlier drain; approved pre-hit state determines bonus.
4. Pause+E+Q stops simulation at step 1: tick advances, sim_tick/fuel/events do not. During 60-tick respawn, world fuel continues decreasing while player cannot collect/deposit; inherited velocity reset and invulnerability remain.
5. Fatal fall at step 3 plus enough lit lamps at dawn: no_flames, no post-death pickup/deposit, exact-tick finalizer under A3/A8.
6. Drain cadence n−1/n/n+1 with simultaneous out/refuel/multiple Shades: assert IDs, final fuel, event count and order.

## Existing-test migration ledger

Preserve original Q tests/evidence under docs/proof/phase-2/qa/. Create a mapped Phase 3 suite. Tag phase-2 reproduces the original suite; do not silently filter failures in the old 42-test wrapper.

| Current test/file or ID | Old requirement → new requirement | Planned change |
|---|---|---|
| U lamp tie-break / lit lamps cannot be charged again | T02 unlit-only → P3-F02/F03 | Retain nearest/ID assertions; replace lit exclusion with full exclusion; add eligible lit and closer-full cases |
| U motes / capacity is ten / partial | T02 cap10/deposit10 → P3-I01/S01 | Retain pickup-once and partial; add capacity growth/cap20 and score5 |
| U same-tick pickup funds deposit / terminal priority | T02 instant-clear/score350 → P3-W02/W04/S03 | Retain pickup→deposit→pulse; use dawn/fuel fixture and recalculate raw-fuel score |
| U clear at time zero / remaining-time bonus | T02 clear/time bonus → P3-W03/S03 | Replace with dawn threshold and fuel/flame bonus; preserve terminal coverage with clause mapping |
| U no-Flames priority / terminal freezes | T02 priority → P3-W05 | Retain priority/freeze, supply valid lamp fuel/history and add fatal-fall event coverage |
| U safe-zone eviction / spawn300 | T02 every-lit safe → P3-F06/A04 | Retain spawn timing/IDs; add below/exact/above 30 and off cases |
| U pulse costs three / H pulse scenario | T02 pulse5 → P3-S02 | Keep normal5/cost3/stun/push/cooldown; separately add drain15 |
| U night reset / Q-RESET | T02 durations/cap → P3-W01/I03 | Add fuel/progress/counter reset; replace 19800/21600 with 16200/18000 where applicable |
| H required v1.1 delta | T02 snapshot/manifest → P3-C01/C02 | Retain arrays/wind/velocity/edge checks; add fields/drain and label v1.2 scope |
| H scenario arrays replace defaults | T02 Drifter/Charm replace → P3-C03 | Preserve old replacement semantics; proposed lamp merge-by-ID is a separate rule |
| Validation player.light=11 / remediation F05 carried/lost | T02 inventory≤10 → P3-I01/C02 | 11 invalid at cap10, valid at cap12; lost20/carried17 valid at cap20; theft amount4 remains invalid |
| Remediation F01/F02/F03/F04 and world/collision tests | Unchanged physics/Drifter → P3-R01 | Keep behavioral assertions; change only fixtures affected by fuel/score rules |
| Q-TUNING, QA-SPAWN, QA-RESET, QA-DELTA-CLI | T02 durations/five states → P3-W01/C01 | New mapped durations and six Shade states; retain spawn-ring/timing assertions |
| Q-LAMP, QA-SAFE, QA-PICKUP, QA-DEATH-CLEAR, QA-CLEAR-TIMEOUT, QA-PICK-DEPOSIT-PULSE | T02 lamp/safety/cap/end → P3-F/I/W/S | Map each replaced assertion; do not edit original QA proof or claim unchanged 42/42 |
| Q-EVENT-VALIDATION / remediation F05 matrix | T02 payloads → P3-C04/C05 | Keep old malformed cases; extend dynamic limits and five changed/new event forms |
| scripts/independent-core.mjs literal 360 | T02 duration → P3-W01 | Update duration oracle and add fuel/capacity checks; no obligation to retain exactly seven tests |
| scripts/bench-headless.mjs sim_tick=21600 | T02 360 seconds → P3 300 seconds | Assert 18,000 active ticks and deterministic≤30s runs; input budget not explicitly replaced |
| Browser/headless campaign, boundary, preflight, CI/release helpers | T02 early-win/unlit routes → P3 dawn/refuel/HUD | New Phase 3 drivers/CI; retain historical helpers; do not execute Phase 2 tag/release control |
| tests/environment.test.js | Runtime probes unchanged | Retain both tests; runtime availability is not gameplay acceptance |

U/H refer to current unit/headless files identified in the change matrix. Preserve unaffected movement, dash, pads, wind, fall, collision, drops, Drifter/Charm, malformed CLI, JSON stdout, exit-code and determinism assertions. If a fixture changes, document the replaced clause and retained behavior.

## Scenarios, browser, performance and regression

CLI families: natural fuel/out; selection/refuel cap; partial/first/relight; multi-Shade drain and cadence; safety reactivation; drain pulse; capacity/pre-lit initialization; dawn win/loss/no_flames for all nights; pause/respawn; malformed inputs and replay. Only approved scenario fields are allowed. Use unit fixtures for immediate last-tick boundaries; CLI must run real durations. An empty shades array does not disable later scheduled spawns.

Browser E2E uses real inputs: instructions and thresholds; all lamp interactions; low blink/out/ambient; weak targeting/drain/reactivation; full default campaign to dawn; natural loss/retry; pause; capacity20; persisted palette/volume/sensitivity; actual materials/silhouettes across normal and instanced paths. A rare drain-pulse state may need a valid unit/CLI fixture under A9; do not manufacture a default-browser coincidence.

Headless performance: two deterministic full-Night-3 runs, 18,000 active ticks≤30s. If testing 21,600 input ticks, report terminal tail separately.

Browser performance: 1280×720 drawing buffer, native render counters/clock plus external elapsed time, ≥60s per night, repeated Night 3. No screenshots, forced GC or competing test load during sampling. Record OS/browser/renderer, frame time, draw calls, geometry/material counts and scene/fuel/AI state. Include drain-heavy fuel bars/outline mode and transition/retry memory trends. SwiftShader is not real-GPU proof; do not lower resolution or hide required objects to pass.

After approved implementation: npm test; mapped independent checks; new Phase 3 delta suite; build; verify; CLI nights 1/2/3; benchmark; browser suite; git diff --check; actual Ubuntu CI on the candidate. macOS, real GPU and audio listening pass only after execution. Phase 2's waiver does not waive Phase 3 QA. Browser-only accessibility remains explicitly covered at that layer; do not invent contract settings to claim headless coverage.

scripts/proof-directory.mjs currently defaults to Phase 2. Select Phase 3 output explicitly or introduce a scoped helper before running evidence scripts. Verify requirements/historical-proof hashes and both tag references before/after verification.

## Implemented Core acceptance and exact test migration

Current commands and outcomes are linked from [Core handover](../proof/phase-3/core/PHASE3_CORE_FINAL_REPORT.md). tests/phase3.test.js contains83 new tests (parameterized cases included); original79 are retained with explicit migrations below. No skip/delete. U01-U03 browser cases remain NOT VERIFIED. Core portions of F/A/W/I/S/C/R are exercised by units,CLI and replay; browser/performance/CI portions remain deferred.

| Changed assertion/fixture | Old rule | New rule / reason |
|---|---|---|
| game.test same-tick score350 | Deposit10,light100,win Flames150 | Ticket03 sections3/5: deposit50+first100+dawn896=1046; valid pre-lit fixtures carry6000 units and ever_lit |
| game.test partial score60/200 | Deposit10 per mote | Section5:30 after6 motes,150 after first complete10 |
| game.test lamp tie/no recharge | Lit lamps excluded | Section1: retain ID tie, accept one-mote refuel after natural decay; pure full-stage exclusion separately tested |
| game.test safe/terminal lit fixtures | lit Boolean alone sufficient | Sections1/2: supply fuel_units6000,ever_lit=true; retain original safety/priority assertions |
| game.test clear/time bonus | victory and150 Flames bonus | Sections3/5: dawn_survived and895 raw-fuel/flame bonus; no early victory/time bonus |
| headless.test delta labels | v1.1 scope | Section7:v1.2; existing arrays/input/physics cases retained |
| remediation F05 carried/lost11 assertions | Base capacity 10 boundary | KEEP UNCHANGED: 11 remains invalid at cap10. New tests separately verify valid11 at cap12 and valid20/invalid21 at cap20 |
| independent-core duration360 | Night3 lasts360s | Section3:300s; other seven baseline assertions retained and eight new cross-checks added |
| benchmark sim_tick21600 | Night3 lasts360s | Section3:18000 active plus terminal tail; separately measure21600 active updates over two legal sessions |
| historical42 QA tests | Original Phase2 requirements | Source/evidence unchanged. Ledger above maps replaced clauses; do not claim unchanged42/42 on Phase3 |

CLI edge command: node scripts/phase3-edge-scenarios.mjs (6/6), including targeting tie, safe+refuel+pulse, threshold1799/1800/1801 behavior despite rounded30.0, and two-part relight with actual pickups. Browser source is unchanged; scripts/browser-route.mjs only exports the existing navigation helper.

The first A01 test attempt failed because drain exits to wander on one tick and selects the next target on the following tick. Both assertions now check the correct stages, with no rule change; original failure log is retained.

## Implemented browser verification and migration

`npm run test:browser` now builds and runs `scripts/phase3-browser-e2e.mjs`; the historical Phase2 script remains unchanged. Mapping: Phase2 all-lit early win/time bonus -> Ticket03 sections3/5 dawn-only ratio/fuel bonus -> three complete default keyboard nights and declared boundary fixtures. HUD10 -> section4 dynamic10..20 -> actual ignition/reset and slot-count assertions. Permanent lit/partial color -> section1 fuel/out/refuel/first10/relight5 -> tick-boundary/material/interaction tests. No old source/evidence is deleted or silently skipped; replaced Phase2 journeys remain historical rather than valid Phase3 oracles.

`tests/browser-presentation.test.js` adds8 tests covering shared targeting/purity, raw1799/1800 safe flags despite identical rounded30.0, full exclusion, relight cost/progress, Core dawn bonus/reset, default/lightweight snapshot parity and settings migration. No gameplay test assertion was weakened. `scripts/phase3-browser-boundaries.mjs` exercises20 cases: first/refuel/full/out59/60/61/partial-relight, safe reactivation, drain/pulse cleanup, multiple drain, capacity20, no early victory, all three dawn outcomes, insufficient lights, no-flames precedence, natural default loss/retry, persisted settings, HUD/audio/pause/camera, exact1Hz phases/pause and Dash/wind lifecycle. Initial-state fixtures are explicit; no fixture result is called a default campaign.

Default campaign uses real keyboard and no fixture route/state write. Inputs generated by a default-state headless navigation pilot are revalidated through the real CLI, then played through the browser. The CLI's one-tick jump semantics are mirrored explicitly. Exact segment ticks, full default initial state, ending thresholds, Core campaign total and complete Chromium Core snapshot/events are asserted. Playwright clock only advances time; native FPS uses a separate context without clock installation. Node/Chromium output is compared and any cross-runtime difference is recorded rather than hidden. Within-runtime seeded replay remains mandatory.

Native samples>=60s/night at1280x720 include repeat Night3 with all lamps lit, ten Shades and30 motes (declared stress fixture), actual keyboard movement, renderer metadata, draw calls and six restart observations. Screenshots are taken outside timing. Audio Core event counts are compared cumulatively, independently of subjective listening. Actual results, retained failed attempts and reproducible commands: [browser report](../proof/phase-3/browser/PHASE3_BROWSER_REPORT.md).


## Final release regression

Added tests/safe-boundary.test.js: original1FAIL/2PASS, corrected3PASS; total173. No existing assertion changed. Original Phase2 legacy permanent-light/early-win/time-bonus rules remain explicitly mapped above. Full runtime traces locate exact/gameplay-first ticks, then compare all ticks for three default winning inputs; a diagnostic-only captured initial mote fixture makes Night3 initial state identical. This fixture is not campaign evidence. Final campaign input source is release-run/inputs; browser proof output can be redirected independently. CI uses mapped Phase3 units/CLI/runtime/browser gates and preserves old42 QA source/evidence. Final report links actual outputs and non-blocking PARTIAL audit.
