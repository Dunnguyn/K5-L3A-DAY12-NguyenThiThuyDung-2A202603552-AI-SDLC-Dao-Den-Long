# Phase 4 — TICKET-04 Change Analysis & Implementation Readiness

**Status:** analysis only; no Phase 4 production implementation or release verification has occurred. TICKET-04 is the source of truth; inherited PRD-0/TICKET-02/TICKET-03 clauses remain active unless explicitly replaced. Baseline: commit/tag `483c527b7101c7177b10d9b816c681fe52d00f46` / `phase-3`. Preserve all Phase 1–3 tags and evidence.

## Existing state

The app is Node 24 ESM + Vite/Three.js, with shared deterministic JS Core and browser UI. The internal headless adapter is `internal-draft-1`; `game.contract.json` is v1.2. `scripts/bench-headless.mjs` measures Core throughput, not rendered FPS. Browser settings (volume, sensitivity, distinguishable palette) persist via localStorage; no local server, keyboard remapping, leaderboard, render benchmark, soak runner or packaged app exists. CI is Ubuntu only. README still contains Phase 2-era instructions/results; LICENSE and CREDITS already exist. Phase 3's report/results are historical baseline only.

## Change Impact Matrix

| Requirement ID | Requirement | Existing capability | Gap | Impacted modules | Tests | Risk | Priority |
|---|---|---|---|---|---|---|---|
| P4-BEN | Standard 1280×720 Night1 render benchmark, 200 Shades/100 motes, camera orbit and measured JSON | Headless Core throughput; browser RAF/render counters | No standard scene profile, timed window, formulas/output CLI | Core benchmark-only entry; browser app/renderer; new `scripts/bench-render.mjs`; manifest/package | Math/parser/schema unit; scene integration; headed run | Fake load or benchmark mutations contaminate scene | P0 |
| P4-SOAK | Ten rotating Nights, same process, deterministic random controls, RSS bound | Core `createGame`/`step`/`startNight`, seeded game RNG | No soak driver, input PRNG, RSS sampling/reset/output | new `scripts/soak.mjs`, Core reuse only, manifest/package | RNG/probability/rising-edge tests; same-PID 10-night integration | Retained state/event references; RSS noise | P0 |
| P4-LB | Local top10; browser write, survives restart; same data exported by CLI | localStorage for settings only | No persistent score service or export | new local server/store modules; browser results/menu; CLI export; package | entry validation/rank; disk/server; browser restart/export | Browser storage not accessible to CLI; bad file writes | P0 architecture |
| P4-ACC-1 | Remap all nine controls, conflicts, reset and persistence | Fixed keyboard map | No mapping editor/conflict validation | new controls helper; app/settings/CSS | action-by-action browser tests, duplicate/reset/reload | Key aliases/layout mismatch | P1 |
| P4-ACC-2 | Shade spawn/offscreen arrow, wind, last10s and low-fuel cues | Existing wind/low-fuel; lantern objective arrow | Shade cue and accessible labels/text/dedup | app, renderer, CSS | event cue/readout tests, arrow direction | Cue overload, replayed events | P1 |
| P4-ACC-3 | Reduced motion, ≥18px fonts at1280×720 and ×1.25 option | No corresponding settings | Persisted options, static substitute for fuel blink under reduced motion | settings, app, renderer, CSS | persistence, no-shake/no-flash, computed style | Ticket03 1Hz low-fuel blink vs flash reduction | P1 |
| P4-C13 | Contract v1.3 adds `bench_cmd`/`soak_cmd`, retains old fields/rules | Manifest generator v1.2, strict headless adapter | Commands/output schemas/version and invocation need update | `scripts/write-contract.mjs`, manifest, runner tests | manifest snapshot/diff, CLI flags/purity/errors | Official v1.0 schema unavailable | P0 |
| P4-PKG | Clean clone playable ≤3 commands; runnable release artifact | Vite dev/build | No production local server/API or portable bundle | local server, package scripts, README, CI | clean Windows/Linux install and artifact execution | Node24 dependency, local port/data paths | P0 |
| P4-DOC | README, four-phase changelog, credits/license audit | Stale README, existing CREDITS/LICENSE | Rewrite and verify against delivered state | README, CHANGELOG, CREDITS, LICENSE only if rights review approves | content/link/attribution checklist | Lab IP not covered by code license | P1 |
| P4-RETRO | 1–2 page evaluation of four phases, AI/harness, token/cost estimate | phase notes/AI_USAGE | Synthesis and telemetry source not established | proposed `docs/notes/retro.md` | length/content/evidence audit | Fabricated costs | P1 |
| P4-DEMO | Authentic MP4 <5min with gameplay, tests/headless, benchmark | Browser E2E evidence; no video confirmed | Record/review/attach video | `docs/demo/`, README/Release | duration metadata + human playback/content checklist | Implied fake test/performance evidence | P1 |
| P4-REL | Public repo; tag phase-4 and v1.0.0 Release with runnable artifact/video | Phase3 tag/CI | Final full regression, cross-platform and release gate | CI/release workflow and GitHub Release | exact-SHA CI; clean clone/artifact per OS; immutable ref audit | Hidden official schema, release permission | P2 after gates |

## Chosen architecture

### Render benchmark

Command: `node scripts/bench-render.mjs --seed 42 --duration 30 --out bench.json` (manifest `bench_cmd` is the base command). A Node Playwright orchestrator serves the production bundle through a proposed local server and launches a **headed Chromium app-mode window**, windowed, CSS viewport/WebGL drawing buffer 1280×720. Assert viewport and report actual browser/backend/OS. Request `--disable-frame-rate-limit` and `--disable-gpu-vsync`; `vsync_off` is true only when this mode is supported/requested, otherwise false and explained. Keep all ordinary Night1 geometry, lighting, shadows and visual effects. A benchmark-only Core profile initializes exactly 200 Shades in `wander`, 100 motes, L1–L3 lit/fuel100, player at origin/stationary/no input; seeded uniform-area entity placement. It suppresses only pickup, damage, fuel decay/drain, future spawn and terminal transition; normal shared Shade Wander updates continue. No object freezing, quality reduction or omitted scene objects.

Camera targets origin, horizontal radius30m and Y=15m, starts (30,15,0), CCW viewed from above, one revolution/15s. Warm-up is3s and excluded; capture ends at requested monotonic wall-clock duration. Record RAF timestamps/deltas; `frames=N`, average and P1 formulas plus nearest-rank P95 are specified in the contract migration. `load_ms` begins at runner process start and ends at first actual WebGL-rendered frame/presentation opportunity. `peak_mem_mb` is RSS only; null with explanation if browser process RSS cannot be reliably measured. Never substitute JS heap.

### Soak

Command: `node scripts/soak.mjs --seed 7 --nights 10 --out soak.json`. Import shared Core and call `step` in one Node process. Night order rotates1,2,3; zero-based night i uses seed7+i for Core and an independent input PRNG. Proposed reproducible PRNG is the same LCG shape as Core (`state=(imul(state,1664525)+1013904223)>>>0`, zero normalized to1, output `state/2^32`), but a separate stream so input draws cannot perturb Core randomness. Proposed direction domain is uniform 8-way cardinal/diagonal; change every30 ticks. Each tick draw independent Boolean levels at probabilities jump.05/dash.03/pulse.02/interact.10 and pass unchanged to Core; rising-edge semantics remain Core-owned. Run until terminal or that night's normal time limit. Replace all Night state before next; retain compact outcomes only. `process.memoryUsage.rss()/1024²` at: after first initialized game before tick1; after final result and final Night reset. Do not force GC or report heapUsed. `nights` means requested count; results has one string per Night actually completed. A caught per-Night error increments crashes, preserves partial results and exits nonzero; fatal process exit is not fabricated into JSON.

### Leaderboard and persistence

Choose **local Node server + one JSON file**. Browser submits same-origin to local API; CLI export reads the exact same file. Bind only `127.0.0.1`; validate Origin/body/fields, normalize static file paths under `dist`, use atomic temp-file+rename. One server is the writer; CLI is read-only. Default data location: Windows `%LOCALAPPDATA%/DaoDenLong/leaderboard.json`; macOS `~/Library/Application Support/DaoDenLong/leaderboard.json`; Linux `$XDG_DATA_HOME/dao-den-long/leaderboard.json`, fallback `~/.local/share/dao-den-long/leaderboard.json`; `DAO_DATA_DIR` for tests/portable usage. Browser settings remain localStorage. Store exact fields `name,score,nights_won,achieved_at,seed`. Accept required ASCII name grammar; score is Core campaign sum of won-night scores only, wins count0..3, seed preserved, UTC ISO timestamp generated on server. Rank score desc then earlier achieved_at; exact ties preserve prior file order; trim top10. Export `{ "entries": [...] }` with same order. Use `node scripts/headless.mjs --export-leaderboard out.json` from package root.

Rejected: localStorage-only cannot be read by CLI; desktop wrapper adds large/platform-specific builds; Docker requires an extra runtime and volume setup. The required package will be a portable ZIP of built static site + small Node24 server/scripts/manifest/guide, no absolute paths and no node_modules. Clean clone commands: `npm ci`, `npm run build`, `npm run start` (three). This is a local/offline product, not a leaderboard anti-cheat service.

## Workstreams

| WS | Dependencies/files | Tests/evidence | Exit criteria |
|---|---|---|---|
| WS1 Benchmark & Soak | Settle benchmark-only Core policy; Core shared AI; new render/soak scripts; browser bench entry; manifest | formula/parser/schema units; exact scene & camera; same-PID soak/RSS; real `bench.json`/`soak.json` | Exact counts/clock/seed/output; soak crash0 and RSS≤1.2×; normal Core regressions pass |
| WS2 Leaderboard & Accessibility | Local server/storage first; controls/prefs then UI | disk+CLI shared export; browser persist; 9 remaps; cues/reduced-motion/font assertions | One dataset; rank/validation/top10; all user cues/options persist and work |
| WS3 Package, Docs, Retro, Demo | WS1/WS2 and actual results; rights audit before license changes | clean Windows/Linux install/artifact; docs checklist; evidence-based 1–2 page retro; authentic MP4 | ≤3 README commands; artifact runs outside workspace; no unsupported claims |
| WS4 Verification, CI, Release | WS1–3 complete; official schema decision; all evidence | inherited + new tests; OS matrix; clean artifact; exact-SHA CI | no mandatory failures; immutable history; release only after separate authorization |

## Platform verification matrix

| Platform | Required checks | Current evidence/status |
|---|---|---|
| Windows x64 | `npm ci`/build/start from clean clone; loopback file persistence/export; headed benchmark viewport/renderer; soak RSS; extracted ZIP | Phase 3 environment has Windows/SwiftShader evidence; Phase 4 clean install/extracted ZIP not run; headed benchmark completed and ten-night soak RSS threshold failed |
| Ubuntu Linux x64 | CI clean install + inherited/new tests; local server/CLI paths; Playwright browser suite; headed benchmark under display/Xvfb if supported | Existing Phase 3 workflow runs Ubuntu; Phase 4 workflow and checks not implemented/run |
| macOS | Same clean install/artifact/browser checks on actual macOS; record renderer and RSS limitations | NOT VERIFIED; no environment available in this analysis |

CI should use Windows and Ubuntu matrix jobs for clean install, Core regressions, contract, soak/export and build. Run the headed render benchmark only where a real display/window can be established; CI smoke does not decide lecturer-machine FPS thresholds. Add macOS only when runner capacity permits; never infer it from Linux.

## Assumptions needing approval before coding

1. 200 Shades must start in `wander`; ordinary shared AI may transition them during the sample. Keeping all 200 in wander forever would require suppressing AI and is not assumed.
2. 1280×720 means app viewport/drawing buffer; OS title/decorations are additional. App mode is accepted as the executable window.
3. Vsync reporting follows supported/requested backend mode; browser RSS is null if reliable process RSS is unavailable.
4. Soak direction is uniform among 8 headings; input booleans are independent Bernoulli level states; `nights` is requested count (Ticket sample supports this).
5. Node24 loopback server + portable ZIP is acceptable; game is launched through local server, not GitHub Pages or `file://`.
6. Accented Vietnamese names are optional; strict ASCII grammar is sufficient. Timestamp is server-generated UTC. Exact score/time ties retain insertion order.
7. Under reduced motion, normal 1Hz low-fuel blink is disabled and replaced by static pattern/icon/text. This keeps the warning and honors reduced-motion.
8. Retro costs use actual retained logs where present; absent telemetry is stated, with only explicitly labeled assumption estimates.
9. `TEST_CONTRACT_SPEC.md` remains draft. Implement known v1.3 delta only and mark official v1.0 compatibility unverified absent actual schema.

Architecture is implementable; approve assumptions that affect the test oracle/package before production implementation. See [RTM](phase-4-rtm.md), [test plan](phase-4-test-plan.md), [contract migration](phase-4-contract-migration.md), [ADR](../decisions/ADR-phase-4-release-architecture.md).

## WS1/WS2 implementation update

Owner-approved A1�A4 now govern the implementation and supersede the earlier prospective assumptions above: 1280�720 means viewport plus drawing buffer (outer size is recorded); the benchmark keeps exactly 200 Shades in `wander` while executing shared Wander movement and suppressing only campaign transitions; soak uses eight normalized directions, seed `base+i`, rotating Nights, independent per-tick button levels and one Node PID; timings are monotonic and P95 uses nearest-rank. The approved browser runner and Core benchmark profile are now implemented. The complete ten-Night soak produced ten real outcomes and zero crashes, but RSS growth exceeded the required 20% ceiling; WS1 is not complete until that acceptance passes. WS2 is not started.

## Soak RSS remediation (2026-11-23)

The original FAIL was preserved at `docs/proof/phase-4/soak-remediation/soak-before.json`. Per-Night diagnostics identified repeated full-world deep clones and unobserved periodic snapshots as avoidable allocations; read-only world access and a soak-only snapshot-cache opt-out reduce churn without changing gameplay. Shade target selection now preserves distance/ID priority without per-Shade filtered/sorted arrays. Unit 195/195, cross-check 15/15, verify 8/8 and build passed; the 30-second browser benchmark still passed with the exact scene. The official ten-Night soak remains FAIL: 35.27 -> 47.94 MiB RSS (limit 42.33). Three more clean-process runs also failed. V8 heap capacity/RSS growth persists despite no evidence of a retained old-Night state. See `docs/proof/phase-4/soak-remediation/root-cause.md`.

## Soak RSS remediation round 2 (2026-11-23)
Separate 1/3/10/20-Night diagnostics show RSS rising mainly in early Nights and approaching a plateau. Four fresh official 10-Night runs remained FAIL at ratios 1.340, 1.311, 1.360 and 1.318, with ten outcomes and zero crashes each. A terrain allocation experiment was reverted because it did not improve RSS. Regression and the 30-second browser benchmark passed. P4-SOAK-03 remains a blocker; WS3 is not ready. Detailed measurements are under docs/proof/phase-4/soak-remediation/round-2/.

## WS3 leaderboard and accessibility

The approved loopback Node server serves `dist/` and one file-backed leaderboard API. The server computes score and `nights_won` from the browser's won-Night score map, stamps UTC time, orders top ten and atomically replaces the JSON file. `node scripts/headless.mjs --export-leaderboard out.json` reads the same path. A UUID for each terminal result prevents accidental duplicate submission; local browser data is not cryptographically authenticated. The browser offers a result form and menu leaderboard.

Settings now persist nine `KeyboardEvent.code` mappings, conflict rejection/reset, reduced motion and 1.25× large text alongside the Phase 3 palette. A Shade spawn subtitle/offscreen arrow, wind subtitle, last-ten-seconds subtitle and static low-fuel warning consume Core events or snapshot state. The current renderer has no camera shake; reduced motion also suppresses screen flashes and low-fuel blinking. Browser checks include real-input loss and controlled initial-state cue fixtures. Accessibility manual review remains PARTIAL. The soak RSS blocker is unchanged; see WS3 evidence and RTM for current status.

WS3's Ticket-04 leaderboard and accessibility rows now have automated browser evidence and are marked PASS in the RTM. Direct screen-reader listening and other responsive sizes remain observations for WS4 review. This does not lift P4-SOAK-03 FAIL/BLOCKER or establish Phase 4 release readiness.

## WS4 packaging and handover preparation

A Node 24 distribution preview ZIP now contains the built site, loopback server, Core/CLI scripts, source needed for later rebuild and benchmark, lockfile, contract manifest and README/CREDITS/LICENSE/CHANGELOG. It excludes development node_modules and a user's leaderboard. The extracted package served HTTP 200 and its CLI exported the same empty local profile; an independent extracted source copy passed `npm ci` and `npm run build` on Windows. This is not a committed clean Git clone or a Linux/macOS test.

README, four-phase changelog, revised credits, scoped license review and evidence-based retrospective are prepared. A 44.06-second Chromium MP4 contains live Night 1 keyboard gameplay, labeled WS3 screenshots and actual benchmark/Soak values; broader demo coverage remains PARTIAL. Playback frames at 9, 15 and 36 seconds were inspected. WS4 regression passed 205 unit tests, 15 cross-checks, eight verify gates, build and the default-input three-Night browser campaign (3759). P4-SOAK-03 remains **FAIL/BLOCKER**; no Phase 4 tag or v1.0.0 release was made. See `docs/proof/phase-4/ws4/` and `docs/proof/phase-4/RELEASE_READINESS.md`.

## Final release gate assessment

Existing 1/3/10/20-Night memory profiles show early V8 heap/RSS expansion approaching a plateau, stable external memory and no demonstrated retained Core object. Previous targeted allocation reductions and a reverted terrain experiment did not meet the criterion. There is no newly proven, testable root cause for another safe Core edit. A fresh independent ten-Night Soak still failed: RSS 35.296875→46.50390625 MiB against 42.35625 MiB allowed, with ten outcomes and zero crashes. During the video capture a separate single sample passed because its initial RSS was around 44 MiB; it does not overturn the repeated clean failures. The video now explicitly labels this distinction.

Current unit, independent cross-check, verify harness, build and three-Night browser campaign passed. A standalone 30-second benchmark passed locally at 640.63 average FPS, P1 166.08 FPS and load 5874 ms. The demo was completed as a 123.85-second MP4 with live gameplay and actual test/headless/benchmark/soak subprocess output. No commit, push, CI, tag or GitHub Release was made because P4-SOAK-03 remains FAIL/BLOCKER. See `docs/proof/phase-4/final-gate/FINAL_GATE_REPORT.md`.
