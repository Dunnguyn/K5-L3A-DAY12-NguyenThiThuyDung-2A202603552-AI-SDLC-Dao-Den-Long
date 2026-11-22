# Phase 3 — Final Verification, Release & Handover

Generated 2026-11-22T10:14:47.755Z. Agent-run verification, not independent QA acceptance.

## 1. Executive summary

Ticket-03 fuel/dawn gameplay and browser integration are implemented. Final local gates passed:173 unit tests,15 internal cross-checks,8 harness stages,22 CLI groups,20 browser boundaries and a full default-state keyboard campaign. The release-blocking Node/Chromium safe-zone divergence was reproduced and fixed. Local release gate PASS with the non-blocking limits below; publication requires exact-SHA CI SUCCESS and the annotated phase-3 tag. No Phase4.

## 2. Ticket-03 changes

Fuel100, natural decay1/s, refuel10/mote, first10/relight5 with partial deposits/out/ever_lit; weak-lamp Shade drain5/s; safe threshold raw30; capacity10+2*successful_lights capped20;240/270/300s dawn evaluation at3/5,4/6,5/7 with no_flames precedence; replaced scoring/no time bonus; persisted distinguishable palette and non-color off/low cues.

## 3. Architecture and implementation

Shared ESM Core drives both CLI and browser. Integer1/60 fuel arithmetic, fixed60Hz/12-step pipeline; rendering/audio only consume projections/events. Shared read-only interaction selectors prevent parallel rules. Browser uses pooled bars/drain particles and instanced geometry/materials. No dependencies, gameplay tuning, map geometry or pipeline changes in this release gate.

## 4. ADR

[Approved A1–A9](../../decisions/ADR-phase-3-lantern-fuel.md) define mote-count refuel.amount, per-actor60-tick drain events/reset/pause, scenario defaults/lattice policy, same-tick guards and numeric output. Release correction D1 documents safe-boundary numerical robustness. No requirement document is edited; implementation policies are not called official base schema.

## 5. Breaking changes

[Changelog](../../notes/phase-3-changelog.md): permanent-lit/early all_lit/time bonus replaced by fuel/dawn rules, new capacity and contract1.2 fields/events/drain enum. Settings key remains compatible; optional palette flag defaultsfalse. Browser runner now tests Phase3; historical Phase2 runner/evidence remain intact.

## 6. Test migration

[Migration ledger/test plan](../../notes/phase-3-test-plan.md) maps every replaced assertion to Ticket03. Original79 unit assertions are retained/mapped,83 Phase3 cases and8 browser projection tests added before this gate;3 safe-boundary regressions are new. Historical42 QA assertions/source/evidence remain immutable, not claimed unchanged under replaced rules. No tests skipped or deleted. The old Core report's carried/lost11→21 sentence is a historical wording error: original remediation assertions are unchanged; current ledger clarifies this.

## 7. Contract1.2 audit

Manifest generation and strict tests verify the eight new tuning fields, three durations, snapshot fuel/ever_lit/relit_count/capacity, drain state, scenario defaults/target references and refuel/out/drain/relight/game_over payloads. Actual CLI stdout JSON purity, exit codes, malformed values and seeded replay are tested. fuel is numeric rounded1decimal; off fuel0. No all_lit win or time-bonus rule remains. OFFICIAL CONTRACT COMPLIANCE NOT VERIFIED: official v1.0 base/schema and hidden harness are unavailable; internal-draft-1 is not that schema. [Known-delta migration](../../notes/phase-3-contract-migration.md).

## 8. Final regression

Actual [command report](release-2026-11-21T17-05-13-125Z/regression-1795281787198/results.json): npm test173/173; npm run test:independent15/15; npm run verify8/8; npm run build; CLI22 groups including6 edge groups; npm run test:browser all PASS. Harness includes real CLI dawn scenarios1/2/3, deterministic replay, malformed output/input and benchmark. Build's bundle-size warning remains. Final diff/staging audits are mandatory before commit.

## 9. Browser acceptance

[20 boundary cases](release-2026-11-21T17-05-13-125Z/browser/boundaries-2026-11-21T17-24-42-725Z/browser-boundaries.json) cover fuel0/30/100, full exclusion, first/refuel/out59/60/61/partial-relight, safe reactivation, single/multiple drain and pulse cleanup, capacity20, no early win, three dawn boundaries, dawn/no_flames losses, natural default loss/retry, palette reload, HUD/audio/pause/camera,1Hz blink freeze and Dash/wind lifecycle. Initial fixtures are labelled; they are not default gameplay journeys. Manual audio listening remains NOT VERIFIED.

## 10. Full default campaign

[Actual browser replay](release-2026-11-21T17-05-13-125Z/browser/e2e-2026-11-21T17-24-42-070Z/browser-e2e.json): real keyboard inputs, fresh default state, no fixture route or inventory/fuel/timer/HP/end-state injection. Input files are revalidated through CLI; ending snapshot/events match a separate Chromium Core replay. Playwright time acceleration is used for functional tests, never FPS. Core campaign total **3759**; all nights reach dawn_survived and final Bình Minh.

| Night | Active ticks | Lit | Flames | Score |
|---|---:|---:|---:|---:|
| Night1 | 14400 | 3/5 | 2 | 1055 |
| Night2 | 16200 | 4/6 | 1 | 1430 |
| Night3 | 18000 | 5/7 | 1 | 1274 |

The historical3813 input journey predates the bug fix; successful release inputs were regenerated/revalidated without changing gameplay. Source selection and failed legal-input pilots are retained. E2E-01–16 are covered by the campaign and explicitly classified boundary cases; they are not all claimed to be default-state boundary encounters.

## 11. Performance

Headless [benchmark](release-2026-11-21T17-05-13-125Z/regression-1795281787198/core/benchmark-night3.json):21600 active updates across legal18000+3600 Night3 sessions in 6.095/5.920s; both below30s, deterministic. Separate21600 CLI inputs include18000 active plus3600 terminal ticks, not21600 active in one night.

Native1280×720/DPR1, Windows10.0.26300, Chromium159.0.8154.6, actual SwiftShader renderer. RAF intervals plus external wall time, each complete sample>=60s, real keyboard, no virtual clock/screenshots/competing tests during timing. [Fresh performance](release-2026-11-21T17-05-13-125Z/browser/performance-2026-11-21T17-35-50-847Z/performance.json) records source hashes including the fixed Core, scene fixtures, frame times, errors/draw calls/restart observations.

| Scene | Duration ms | Average FPS | Mean frame ms | Sample status |
|---|---:|---:|---:|---|
| night1-default-entry | 60015.8 | 44.70 | 22.37 | PASS for this sample |
| night2-fresh-entry | 60018.3 | 44.34 | 22.55 | PASS for this sample |
| night3-fresh-entry | 60003.8 | 38.63 | 25.89 | PASS for this sample |
| night3-lit-stress | 60008.0 | 36.66 | 27.28 | PASS for this sample |

Overall performance remains PARTIAL: retained pre-optimization28.51FPS and incomplete samples are not erased or counted as PASS; real GPU is unverified. Sampled restart counts do not prove long-term leak freedom. Night-selection/stress fixtures are explicit, not campaign proof.

## 12. RTM and PARTIAL audit

[RTM](../../notes/phase-3-rtm.md):23PASS/2PARTIAL/0FAIL across25 scoped rows; no automatic promotion. P3-R01 expects inherited physics/maps/timers/pause/Drifter/Charm and determinism. Implementation/regressions and cross-runtime gameplay parity are verified; residual coordinate representation/platform coverage remains PARTIAL, OBSERVATION, non-blocking. P3-R02 expects full DoD/CLI/browser/CI/performance. ADR/changelog/migration/known1.2 delta/gameplay evidence are present; performance/hardware/platform/listening/external QA limits remain PARTIAL, MINOR verification limitation for milestone release. CI is a mandatory blocker until exact-SHA SUCCESS, regardless of this row's retained status.

## 13. Divergence finding and known limitations

[Before/after tick comparisons](release-2026-11-21T17-05-13-125Z/divergence-1795341843481/comparison.json). Original first exact difference: Night1 tick6321,Shade.x differs one ULP after atan2→sin/cos safe-boundary projection; first gameplay divergence6322 resets eviction29 vs28. This cascaded into fuel/events/score1072 vs1062: categoryA MAJOR, release blocker. Reproduced unit1FAIL/2PASS; after radial normalization and a16*EPSILON*r² roundoff guard,3/3PASS. Six-metre radius and30-tick policy unchanged. Every tick of all three release winning inputs now has matching gameplay/events/fuel/capacity/score/outcome on Node/Chromium.

Night1/2 full observations match exactly. Night3 has only two polar-generated mote coordinates differing by3.55e-15 and7.11e-15m, beginning in initial state; the identical-initial diagnostic fixture also has no gameplay divergence. Subsequent map spawns reproduce those representational differences. Final differences are only these two mote positions, not fuel/AI/player/score/events/outcome. CategoryB numeric representation for the observed runs; no invented rounding or contract tolerance, no general bit-exact cross-platform claim. Published fuel1decimal precision is unchanged; unspecified official coordinate schema remains unverified.

Other NOT VERIFIED: official base/hidden harness, real GPU,macOS,subjective audio quality and independent Phase3 QA. Local Windows and exact-release Ubuntu CI are distinct; Linux is verified only when that workflow actually succeeds. The Phase2 QA waiver is not carried into Phase3.

## 14. Risk acceptance

The owner authorized Final Verification & Release Gate and documented-limitation handover. Only non-blocking observed numeric representation, sampled software performance and unavailable external verification remain; no failing mandatory test/gameplay blocker is accepted. This is agent verification, not independent acceptance or full official compliance. If CI fails/unavailable, remote history changes, or phase-3 already exists, stop before tag. No Phase4 work.

## 15. Git release information

Repository: [GitHub](https://github.com/Dunnguyn/K5-L3A-DAY12-NguyenThiThuyDung-2A202603552-AI-SDLC-Dao-Den-Long); source branch main; baseline f18e4837b3abbc4ed094073238c96822040e2f6a. Commit message: feat: complete phase 3 lantern fuel and dawn survival. Release identity is the commit containing this versioned report, resolved by annotated tag [phase-3](https://github.com/Dunnguyn/K5-L3A-DAY12-NguyenThiThuyDung-2A202603552-AI-SDLC-Dao-Den-Long/tree/phase-3). Its annotation records the exact release SHA and verified CI run URL after SUCCESS. [CI workflow](https://github.com/Dunnguyn/K5-L3A-DAY12-NguyenThiThuyDung-2A202603552-AI-SDLC-Dao-Den-Long/actions/workflows/verify.yml) is Verify Phase3 on the same pushed SHA, not Phase2 evidence. [Versioned final report](https://github.com/Dunnguyn/K5-L3A-DAY12-NguyenThiThuyDung-2A202603552-AI-SDLC-Dao-Den-Long/blob/phase-3/docs/proof/phase-3/PHASE3_FINAL_REPORT.md).

Preflight inventories modified/untracked Phase3 files, scans secrets/artifacts/size and hashes1986 immutable requirements/history/map/lockfile paths. No historical evidence/requirements or tags phase1/2 are changed. git diff --check and staged audit must pass. Normal push only; no reset/stash/revert/force or tag overwrite. Post-push API evidence and the tag are verified before reporting release; the working tree must be clean.

## 16. Reproducibility

Node24.x; local24.13.0/npm11.6.2, CI24.13.0/npm11.19.1 and clean npm ci; lockfile unchanged. Run npm test; npm run test:independent; npm run verify; npm run build; node scripts/phase3-edge-scenarios.mjs; npm run test:browser; npm run bench:headless; git diff --check. Use fresh PROOF_DIR/BROWSER_PROOF_DIR to retain prior outputs. For runtime comparison set RELEASE_DIR to a fresh output folder and REQUIRE_GAMEPLAY_PARITY=1, then node scripts/phase3-divergence.mjs; optionally DIVERGENCE_INPUT_DIR points to the release inputs directory. Native FPS: node scripts/phase3-browser-performance.mjs without Playwright clock. CLI: node scripts/headless.mjs --night 1|2|3 path/to/input.json.
