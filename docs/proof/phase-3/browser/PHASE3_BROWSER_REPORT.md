# Phase 3 Browser Integration — handover

Date: 2026-11-21. Scope: Ticket-03 browser integration on the existing shared Core. Agent-run local verification; not independent QA, official contract acceptance or release. HEAD remains `f18e4837b3abbc4ed094073238c96822040e2f6a`. No commit/push/tag.

## Implementation

Integrated snapshot-driven fuel bars, sim-time 1 Hz low blink, active safe rings, collapsed off cages/torn-paper markers, correct partial/first10/relight5/refuel prompts, pooled per-Shade drain effects, dynamic10–20 capacity HUD, dawn ratios/results/bonus/campaign, single-consumption score feedback/audio, and persistent distinguishable palette. Cyan outline/eyes and white danger UI with warning symbol affect rendering only. Settings remain compatible with the existing storage key. No renderer-side fuel, AI, inventory, score or outcome rules.

Core changes for this integration only expose existing interaction/cost/refuel selectors, optional current-tick event snapshots and the already-computed dawn bonus. Default headless snapshot remains compatible with its internal schema. No tuning, maps, collision geometry or 12-step order changed. Eight new projection/settings tests preserve the162 Core tests. Shared cage/bulb/progress instancing, bars/particle pooling and resource cleanup reduce draw cost without recreating scenes each tick.

## Actual verification

Core regression directory: [browser-regression-2026-11-21T16-33-57-394Z](../core/browser-regression-2026-11-21T16-33-57-394Z/).

Local runtime observed: Node24.13.0/npm11.6.2. CI's npm11.19.1 pin was not executed in this Windows task; dependencies/lockfile were not upgraded.

| Command / check | Actual result |
|---|---|
| `npm test` | 170/170 PASS,7 test files |
| `npm run test:independent` | 15/15 PASS; internal cross-check, not external QA |
| `npm run verify` | 8/8 PASS: contract generation, CLI scenarios, dawn replay, cross-check, import, unit, benchmark, build |
| `npm run build` | PASS; bundle-size warning retained |
| Actual CLI | 22 groups including6 extra edge cases; all PASS |
| CLI dawn fixtures1/2/3 | dawn_survived; explicitly fixtures, not campaign evidence |
| Seeded replay | Node and Chromium each deterministic within their own runtime |
| Night3 input budget21600 | 18000 active +3600 terminal tail,9.514/9.424s |
| Separate21600 active updates | Two legal dense Night3 sessions,10.736/10.545s; under30s |
| `npm run test:browser` final rerun | PASS;20 browser boundary cases and complete default three-night campaign repeated |
| `git diff --check` | PASS after removing two whitespace-only lines; measured renderer preserved |

Browser run root: [run-2026-11-21T13-19-33-241Z](run-2026-11-21T13-19-33-241Z/). The root contains original failed/incomplete attempts, screenshots, inputs, logs, performance and timestamped audit reports. [First complete campaign](run-2026-11-21T13-19-33-241Z/e2e-2026-11-21T16-37-51-052Z/browser-e2e.json) and [20-case boundary run](run-2026-11-21T13-19-33-241Z/boundaries-2026-11-21T16-16-28-214Z/browser-boundaries.json) passed. A final full npm runner repeats both groups; its log is [npm-test-browser-final.log](run-2026-11-21T13-19-33-241Z/npm-test-browser-final.log).

## Browser E2E classification

| Case | Result | Evidence type |
|---|---|---|
| E2E-01 Menu → Night1 | PASS | Default browser UI |
| E2E-02 First light10 | PASS | Default collection/ignition plus controlled exact-boundary case |
| E2E-03 Refuel | PASS | Declared initial-state fixture, then real E input |
| E2E-04 Out | PASS | Default natural out plus exact59/60/61 fixture |
| E2E-05 Relight5/partial | PASS | Default relights plus controlled partial-deposit case |
| E2E-06 Safe low/recovery | PASS | Raw-threshold fixture, real refuel; eviction/no-hit observation |
| E2E-07 Drain/interruption | PASS | Declared single/multiple-Shade fixtures, actual Q input, effect cleanup |
| E2E-08 Capacity20 | PASS | Default successful ignitions and controlled HUD/reset assertion |
| E2E-09 All-lit no early win | PASS | Declared all-lit fixture |
| E2E-10 Dawn1/2/3 | PASS | Full default keyboard nights plus separate boundary fixtures |
| E2E-11 Insufficient-light dawn loss | PASS | Declared final-tick fixture |
| E2E-12 no_flames precedence | PASS | Declared same-final-tick fixture |
| E2E-13 Campaign → Bình Minh | PASS | Default state; no campaign interception/state injection |
| E2E-14 Lose/retry | PASS | Default input causes natural falls/death, retry reset checked |
| E2E-15 Persist palette | PASS | Real settings toggle/reload, storage/material/CSS probes |
| E2E-16 HUD/audio/pause/camera/FPS | PASS locally | Browser probes/screenshots/native performance; manual audio listening remains NOT VERIFIED |

Boundary fixture routing only seeds Core factories before play and observes ticks; it never edits state during a run. Such cases are not called full gameplay E2E. For the campaign, a fresh browser context has no fixture route or injected game state. Default navigation inputs are CLI-revalidated and replayed through real Playwright keyboard events. Snapshots/events are read-only; exact sim ticks and full ending player/lantern/Shade/mote/Drifter/wind/event output match a separate Core-only Chromium replay. Playwright virtual time accelerates this functional test and is excluded from FPS evidence.

| Default campaign | End tick | Lit | Flames | Score |
|---|---:|---:|---:|---:|
| Night1 | 14400 | 3/5 | 1 | 1062 |
| Night2 | 16200 | 4/6 | 2 | 1377 |
| Night3 | 18000 | 5/7 | 3 | 1374 |
| Bình Minh | — | — | — | **3813** |

Each campaign directory retains the RLE source input path, keyboard sequence, checkpoints, complete ending events and screenshots. Cumulative audio Core event counts match exactly for all three nights; render frames do not replay them. This checks event dispatch/Web Audio context, not perceived sound quality. Screenshots inspected include settings/HUD, off torn lamp, drain,20-slot capacity and dawn; this is screenshot review, not a claim of manual play.

## Native performance

Windows `win32 10.0.26300 x64`, Chromium159.0.8154.6,1280×720 drawing buffer/DPR1. Renderer: ANGLE Vulkan1.3 SwiftShader Device(Subzero), software only. Native RAF intervals and external wall time; real keyboard decisions about every95ms, no Playwright clock, screenshots/forced GC/competing tests during samples.

| Scene | Duration ms | Average FPS | Mean frame ms | Draw calls at end |
|---|---:|---:|---:|---:|
| Night1 default entry | 60014.9 | 37.77 | 26.47 | 28 |
| Night2 fresh entry | 60013.3 | 38.17 | 26.20 | 25 |
| Night3 fresh entry | 60018.3 | 34.19 | 29.25 | 24 |
| Night3 lit/enemy stress | 60003.9 | 32.26 | 30.99 | 29 |

Evidence: [Night1/Night3](run-2026-11-21T13-19-33-241Z/performance-2026-11-21T16-07-13-002Z/performance.json), [Night2 repeat](run-2026-11-21T13-19-33-241Z/performance-2026-11-21T16-13-04-814Z/performance.json). Nights2/3 fresh entry use a night-selection-only fixture; stress explicitly starts seven lit lamps,ten Shades,30 motes/capacity20. None is represented as a default campaign. All four valid samples stayed playing and had no console/WebGL errors. Six stress restarts showed26 geometries/0 textures and reported heap35.1MB each; short/coarse heap observations do not prove long-term leak freedom.

Retained pre-optimization stress sample28.51FPS failed the target. Cage/bulb/progress instancing then improved the measured scene to32.26. Earlier Night3/Night2 driver-loss samples were shorter than60s and are incomplete, never FPS PASS. Native reports include production source hashes; the audit verifies correspondence, permitting only separately evidenced trailing-whitespace cleanup if needed.

## Limitations and preservation

Node24.13 and Chromium159 do not produce bit-identical default replays. A separate Core-only diagnostic reproduces Night1 Node1072 vs Chromium1062, with identical final player. Night2/3 scores match but full snapshots differ. Within-runtime repeated outputs match; actual keyboard output matches Chromium Core. Cross-runtime exact parity is therefore **PARTIAL**, not silently treated as universal determinism or attributed conclusively to a specific math primitive. See [diagnostic](run-2026-11-21T13-19-33-241Z/cross-runtime-2026-11-21T16-36-45-533Z/comparison.json). The initial strict Node-score assertions and their failures remain. Jump driver semantics and virtual-clock scheduling were also corrected; no gameplay/tuning was changed to satisfy tests.

Official v1.0 base/hidden harness, real GPU, macOS, Phase3 remote CI, direct listening and exhaustive physics/leak coverage remain NOT VERIFIED. No clean Linux install/CI was run in this Windows task. Phase2 risk acceptance/QA waiver does not establish Phase3 acceptance. Bundle-size warning remains. RTM: **23 PASS / 2 PARTIAL / 0 FAIL / 0 NOT VERIFIED** across25 scoped rows; external limitations remain explicit in R01/R02 rather than being erased.

SHA256 audit protects1582 pre-existing files including requirements, old Phase1/2/3 Core proof, lockfile/maps. Before/after digest `7417084ffe051d5a0b548abb9b127dbee5cc85b1f1756d6586ca8a8158f2cc3f` matched. HEAD and phase1/2 tag object refs are unchanged. Working tree intentionally includes the pre-existing Core implementation plus browser source/test/docs/evidence changes. No reset/stash/revert/delete or commit/push/tag occurred.

Changed in browser scope: `src/browser/{app.js,app.css,renderer.js,audio.js,presentation.js}`, minimal `src/core/{game.js,fuel.js}` interfaces, package browser command,8 projection tests, browser test/navigation/diagnostic/audit scripts, README/Phase3 notes/RTM/test-plan/changelog/AI_USAGE and AGENTS/verify-game guidance. Earlier Core/config/contract/test modifications in Git predate this integration; do not attribute the whole diff to browser work.

## Final command receipt

All required local commands completed with exit0. [Command receipt](run-2026-11-21T13-19-33-241Z/command-receipt.json), [final browser runner](run-2026-11-21T13-19-33-241Z/e2e-2026-11-21T16-46-11-480Z/browser-e2e.json) and [final audit](run-2026-11-21T13-19-33-241Z/audit-2026-11-21T16-57-10-751Z.json) record actual outputs. Production rendering source differs from native measurements only by removal of trailing whitespace; the original file and exact normalized-byte equivalence are retained. Final build and whitespace check passed after cleanup.

**Verdict: READY FOR PHASE 3 FINAL VERIFICATION.** This is implementation handover with the stated limitations, not release/official/independent acceptance. Working tree remains modified/untracked on main; HEAD/tags unchanged. Stop before commit, push or tag.
