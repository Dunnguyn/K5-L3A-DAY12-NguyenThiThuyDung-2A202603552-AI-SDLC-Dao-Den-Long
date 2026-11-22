# Phase 3 Core & Headless — final handover

Status: **READY FOR PHASE 3 BROWSER INTEGRATION**. This is a local Core/Headless verdict, not release readiness, browser E2E, independent QA sign-off or official contract compliance.

## Applied semantics and modules

The owner approved ADR A1-A9. Fuel is an integer count of 1/60 units: maximum 6000, natural decay 1/tick, each eligible drainer 5/tick, safe threshold 1800. Refuel uses the published ceil rule and amount means motes used (1..10); zero use has no event/score. First light costs10, relight5; both restore100. Out clears progress while preserving ever_lit/relit_count. Dynamic capacity is min(20,10+2*successful_lights); scenario pre-lit does not count.

Pipeline order remains 12 stages. Step2 aggregates prior eligible drains and natural decay, samples stable per-actor 60-tick events, then emits out once. Counters reset on exit/target changes and freeze on pause. Safe reactivation precedes movement/damage; pulse stunned state has priority. Drain-to-chase uses6m XZ; ordinary detection12/abandon18 remain inherited. Pulse uses5m 3D and scores total15 for pre-hit drain, otherwise5. Fatal fall completes world-only updates and always finalizes once at11; no player interaction after death.

Dawn durations are240/270/300s; no early victory; no_flames precedes dawn evaluation. Thresholds3/5,4/6,5/7 and current raw fuel determine outcome/bonus. Deposit5/mote, first100, relight40; winning bonus sum_lit(50+floor(raw fuel))+50*Flames; no time bonus. Retry/start reset counters, fuel and terminal flags while retaining campaign settings/won-night totals.

Production changes: src/config/game.js, src/core/game.js, new src/core/fuel.js and src/headless/adapter.js. Browser source/styles/audio remain unchanged. scripts/browser-route.mjs only exports its existing route function for the headless input pilot; navigation behavior is unchanged.

## Contract v1.2

Known delta implemented and locally tested: manifest1.2, eight tuning additions, three durations, lantern fuel/ever_lit/relit_count, player.capacity, Shade drain, canonical-ID scenario merges, successful_lights/defaults/target references, refuel/out/drain events, lantern_lit.relight and game_over reasons. Snapshot/event fuel is numeric rounded to one decimal; JSON100 is numerically100.0. Scenario fuel must be representable in1/60 units (conversion tolerance1e-8 internal unit);29.99 is rejected rather than rounded across30. Local wrapper remains internal-draft-1. OFFICIAL CONTRACT COMPLIANCE NOT VERIFIED: v1.0 base/schema remains unavailable.

## Actual verification

| Gate | Result |
|---|---|
| npm test | 162/162 PASS: original 79 migrated/retained +83 new Phase 3 tests |
| npm run test:independent | 15/15 PASS; agent-authored internal cross-check, not external QA |
| npm run build | PASS |
| npm run verify | 8/8 PASS |
| Actual CLI scenario groups | 16/16 plus 6/6 edge groups PASS; deterministic replay |
| Dawn input fixture replays | 3/3 wins; input generation matches standalone CLI |
| git diff --check | PASS |

| Night | Active sim ticks | Lit | Outcome | Score |
|---|---|---|---|---|
| 1 | 14400 | 3 | dawn_survived | 606 |
| 2 | 16200 | 4 | dawn_survived | 775 |
| 3 | 18000 | 5 | dawn_survived | 973 |

These dawn wins use documented initial scenario fixtures: pre-lit lamps, explicit successful_lights5/bag20, invulnerability and random Drifters disabled; wind and normal Shade spawns remain active. After initialization the pilot uses only normal inputs. It waits, then legally relights near dawn. CLI replay must match the generated state exactly. This is not default-state campaign completion or browser E2E, and no runtime state mutation manufactures the outcomes.

## Headless performance

Windows 10.0.26300 x64, Node v24.13.0. CLI 21,600 input ticks: 6586.61 / 6510.24 ms; each contains 18,000 active Night 3 ticks plus 3,600 terminal ticks. Separate dense throughput fixtures execute 21,600 active updates across 18,000+3,600 Night 3 sessions: 9472.13 / 9227.88 ms. Every run is deterministic and below 30,000 ms. Initial dense scene: 30 random motes, 10 Shades, 2 Drifters; wind/random systems enabled. No timer or tuning override pretends a 300-second night lasts 360 seconds.

## Migration, retained failures and limits

No tests were deleted or skipped. tests/game.test.js replaces lit-exclusion, deposit/time-bonus/early-clear scoring and valid lit fixtures according to Ticket03. tests/headless.test.js updates delta scope. tests/remediation.test.js changes impossible carried/lost11 to21 while new tests retain invalid11 at cap10 and valid11 at cap12. Historical42 QA source/evidence is unchanged and is not claimed to pass unchanged under replaced Phase3 rules. See the detailed migration ledger in docs/notes/phase-3-test-plan.md.

Retained failures include unit-attempt-1 (test observed drain exit before the next wander targeting tick), the over-budget analog-action pilot, and Night3 maintenance pilots that lost with4/7 lamps. Fixes changed fixture sampling or legal input strategy, not assertions/tuning/thresholds. A nested position-copy review finding was fixed to copy only x/y/z, with a regression preventing inventory/counter injection through pos.

RTM:19 PASS,3 PARTIAL,0 FAIL,3 NOT VERIFIED. PASS is scoped to tested Core/known-delta behavior. PARTIAL: fuel-out ambient rendering, browser portions of inherited regression, and full DoD/browser/CI/performance. NOT VERIFIED: the three browser fuel-HUD/accessibility/silhouette groups. Browser visuals/accessibility/audio, default campaign E2E, browser FPS, real GPU, macOS and remote Phase3 CI were not executed in this scope. Phase2 limitations/QA waiver do not become Phase3 acceptance. Existing Phase2 browser/CI drivers need the approved Phase3 migration in later workstreams; do not run them as unchanged Phase3 acceptance.

## Evidence and Git

Final commands/logs/results: docs/proof/phase-3/core/implementation-2026-11-21T11-18-23-448Z/final-2026-11-21T12-36-29-316Z/regression-results.json and sibling files. Extra CLI edges: docs/proof/phase-3/core/edge-scenarios-2026-11-21T12-28-41-396Z/additional-cli-results.json. Earlier attempts remain under docs/proof/phase-3/core/. Protected before/after hashes: docs/proof/phase-3/core/implementation-2026-11-21T11-18-23-448Z/preservation-before.json and preservation-after.json.

HEAD remains f18e4837b3abbc4ed094073238c96822040e2f6a. Phase1/2 tag objects and 1196 protected files (requirements, historical Phase1/2 proof, map data, lockfile) are unchanged. No commit/push/tag, dependency upgrade or requirement edit. Git status/file manifest is recorded in docs/proof/phase-3/core/implementation-2026-11-21T11-18-23-448Z/workspace-final-audit.json.

The earlier PHASE3_CORE_REPORT.md and its 158-test run are retained as a real intermediate checkpoint. This final report supersedes that checkpoint; the added four parameterized cases preserve the original capacity-10 event assertions while verifying capacity 12/20 independently.
