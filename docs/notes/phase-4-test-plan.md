# Phase 4 Acceptance Criteria & Test Plan

Prospective only; no item is evidence/PASS until run. Preserve all Phase 1–3 assertions, correcting fixtures only when explicitly required and documenting mapping. Store new evidence under `docs/proof/phase-4/`.

## Benchmark — unit, integration and target-machine run

| ID | Given / When | Expected |
|---|---|---|
| BEN-01 | `node scripts/bench-render.mjs --seed 42 --duration 30 --out bench.json` | Strict parser accepts exact valid values; missing, duplicate, unknown, negative, fractional flags fail nonzero and do not produce successful JSON |
| BEN-02 | Launch scene | Headed, windowed Chromium app; inner viewport/drawing buffer1280×720; actual OS/browser/renderer captured; VSYNC state reported without GPU inference |
| BEN-03 | Build benchmark state seed42 | Exactly200 unique Shades initially `wander`, exactly100 motes; deterministic seeded spread on Night1 island |
| BEN-04 | Inspect before first simulation update | L1/L2/L3 lit with raw fuel100; other lamps canonical; player=(0,0,0), velocity zero; no input |
| BEN-05 | During measurement | No pickup, damage, fuel decay/drain, spawned entities, terminal outcome or Night transition; Shade Wander movement uses shared Core rule and is not frozen |
| BEN-06 | Inspect rendered scene | Standard Night1 environment, lighting, shadows/effects retained; no quality/resolution/object removal to inflate FPS |
| BEN-07 | Observe camera at start and quarter turns | Look-at origin, horizontal radius30±.01, Y15±.01, start(30,15,0)±.01; CCW from above; full circle15s |
| BEN-08 | Repeat seed | Initial entity counts/positions/snapshot and camera checkpoints identical; different seed changes deterministic placement, never counts |
| BEN-09 | Measure load | Monotonic runner-process start to first WebGL render frame with a browser presentation opportunity; not DOM ready/canvas/RAF-only |
| BEN-10 | Measure sample | 3.000s warm-up excluded; then exact requested wall-clock duration; separate clean browser context |
| BEN-11 | Known dt array | `avg_fps=1000*N/sum(dt_i)`; preserve precision until serialization |
| BEN-12 | Known dt array | `k=max(1,ceil(.01*N))`; `p1_low_fps=1000/mean(k largest dt)` |
| BEN-13 | Known dt array | P95 nearest rank: sort ascending, choose 1-based rank `ceil(.95*N)`; test N=1,20,100, ties and edge rank |
| BEN-14 | RSS unavailable in browser sandbox | `peak_mem_mb=null`, explanation in renderer metadata/adjacent evidence; no JS heap substitution |
| BEN-15 | Vsync unsupported or unknown | `vsync_off=false` with backend details; true only when off mode is actually supported/requested by selected runner/backend |
| BEN-16 | Validate successful result | Required output fields/types match v1.3; `frames` positive integer, finite values, memory number≥0 or null, nonempty renderer/os |
| BEN-17 | Compare score thresholds | On lecturer's disclosed machine only: avg≥60, P1-low≥30, load≤10000ms. Local numbers are reference evidence, not lecturer-machine PASS |

## Soak — deterministic unit/integration and RSS

| ID | Given / When | Expected |
|---|---|---|
| SOAK-01 | `node scripts/soak.mjs --seed 7 --nights 10 --out soak.json` | All requested Nights run under one Node PID; no child process per Night |
| SOAK-02 | Record each Night | Order1,2,3 repeating; zero-based index i has Core/input seed `7+i` |
| SOAK-03 | Generate direction | Change at sim ticks1,31,61… then held30 ticks; seeded domain/distribution declared and replayable |
| SOAK-04 | Generate buttons | Each tick draws independent jump5%, dash3%, pulse2%, interact10%; no uncontrolled `Math.random`; unit tests use fixed PRNG vectors/probability-count sanity without flaky statistical thresholds |
| SOAK-05 | Consecutive true values | Pass boolean levels to Core; only false→true activates edge actions; do not synthesize extra presses |
| SOAK-06 | Simulate Night | Run until terminal or normal configured time limit; append one `won`/`lost` only after a completed Night |
| SOAK-07 | Reset next Night | Restore normal map, player/flames/inventory, lamps/fuel, entities, timers, previous input and events; retain no previous full state |
| SOAK-08 | RSS samples | Capture process RSS after first world initialized/before first tick, and after final outcome plus final Night reset; bytes/1024²; never heapUsed |
| SOAK-09 | Normal success | `nights` requested count; `results.length=10`; crashes0; output schema valid; end RSS≤1.2×start RSS |
| SOAK-10 | Per-Night simulation exception | Count actual exception, retain partial outcomes, output partial evidence and nonzero exit; do not convert error into game loss |
| SOAK-11 | Replay twice | Seed/night/input/action trace and results match exactly; duration and RSS are excluded from determinism comparison |

## Leaderboard

| ID | Test | Expected |
|---|---|---|
| LB-01 | Name boundaries | Accept3/12 ASCII letters/digits/underscore; reject2/13, spaces, punctuation and Unicode unless separately approved |
| LB-02 | Numeric fields | Score is safe integer≥0; nights_won integer0..3; seed nonnegative safe integer; reject null/fraction/negative/overflow |
| LB-03 | Timestamp | Require ISO8601 with `Z` or explicit ±HH:MM; reject timezone-less/malformed/impossible values; compare instants |
| LB-04 | Outcome scoring | Save campaign sum of won-Night scores only; loss-Night score excluded; win count and original seed read from Core campaign |
| LB-05 | Sort | Higher score first; score tie earlier timestamp first; equal score/time retains existing insertion order |
| LB-06 | Top limit | After add/remove/reload exactly top10 in identical browser and export order |
| LB-07 | Disk persistence | Browser POST through same-origin loopback API; server/browser restart preserves data; leaderboard is not localStorage-only |
| LB-08 | Export | `node scripts/headless.mjs --export-leaderboard out.json` reads same OS file and writes root exactly `{ "entries": [...] }` |
| LB-09 | Failure handling | Invalid entry/Origin/JSON/path or disk failure returns error, never corrupts last good JSON; atomic temp+rename |
| LB-10 | Empty/concurrent reads | Missing store exports empty list; simultaneous CLI read sees complete old or new file; single server writer |
| LB-11 | Browser flow | Form appears after Night3 Dawn or any loss, not after Night1/2 intermediate win; duplicate click does not double submit |
| LB-12 | E2E shared dataset | Saved name appears after game restart; CLI export matches exact saved fields/order |

## Accessibility

Test all nine actions: four directions, jump, dash, interact, pulse, pause.

| ID | Expected |
|---|---|
| ACC-01…09 | Each action independently remaps by `KeyboardEvent.code`, the mapped real key produces that action exactly once |
| ACC-10 | Duplicate key rejected; old mapping stays, conflicting action named in visible/aria-live error |
| ACC-11 | Escape cancels capture; key repeat cannot double-commit; unsupported/reserved key behavior explicit |
| ACC-12 | Reset restores defaults; reload persists; corrupt/old settings migrate while preserving volume/sensitivity/palette |
| ACC-13 | Shade spawn has text/symbol cue; offscreen Shade arrow points at projected direction and differs from lantern objective arrow |
| ACC-14…17 | Wind, last10s and fuel<30 have visible + accessible labels; event cues are consumed once, not replayed per frame |
| ACC-18 | Reduced motion preference persists and disables camera shake and screen-wide flashes |
| ACC-19 | Low fuel still clear in reduced motion via static pattern/text/icon; normal mode keeps Ticket03 1Hz blink |
| ACC-20 | Every UI font computes≥18 CSS px at1280×720 |
| ACC-21 | Large text factor exactly1.25; no collisions/clipping at1280×720 and responsive smoke size |
| ACC-22 | Keyboard-only focus, visible focus, labels, conflict/status announcements and contrast reviewed with DOM checks + manual checklist |

Suggested defaults to approve before coding: arrows for direction, Space jump, ShiftLeft dash, E interact, Q pulse, P pause. Key aliases (existing WASD) should be removed or declared non-configurable; otherwise key conflicts are ambiguous.

## Contract, packaging, documentation, demo, regression

- **CTR:** manifest version string1.3; `bench_cmd`/`soak_cmd` execute from repo root and extracted ZIP root. Compare generated manifest to v1.2: retain every older field, event, validator, gameplay rule and CLI behavior. Test malformed/missing/duplicate flags, JSON purity, exit code and output schema. Do not claim official v1.0 compatibility absent schema.
- **PKG:** clean Windows and Ubuntu clones: `npm ci`, `npm run build`, `npm run start`, open loopback page. Extracted ZIP works outside workspace with Node24, no absolute/private paths, same leaderboard file for browser/export. macOS is PASS only after execution.
- **DOC:** README has required sections/image, ≤3 setup/play commands; changelog all4 phases; Credits checks assets/audio/AI/dependencies; current MIT license scope and lab-IP boundary reviewed; retro 1–2 pages with sourced estimates or labeled assumptions.
- **DEMO:** uninterrupted authentic MP4 <300s; shows actual gameplay and actual test/headless/benchmark runs; inspect metadata/playback/audio/text and confirm no synthetic test output.
- **REGRESSION:** retain `npm test`, `npm run test:independent`, `npm run build`, `npm run verify`, `npm run test:browser`, CLI, replay, three dawn scenarios, headless benchmark, `git diff --check`. Add runner/store/accessibility/package tests. Preserve failures. Run clean CI on Windows/Linux; macOS only if available.

Evidence planned under `docs/proof/phase-4/{benchmark,soak,leaderboard,accessibility,packaging,ci}/`. Commit `bench.json` and `soak.json` only when produced by real final runners.

## WS1 actual test record

The new runner unit tests cover strict flag parsing, scene counts/seed reproducibility, shared Wander movement, camera origin/radius/height/direction/period, warm-up clipping/exact sample interval, formula vectors including N=1 and uneven deltas, output schema, soak PRNG, eight normalized directions, 30-tick direction cadence, button-level semantics, rotation/seeds, and one-process results. The real 30-second headed run is recorded under `docs/proof/phase-4/`. Ten-Night soak tests have 10 completed results and zero crashes but fail the RSS ceiling; preserve as a blocker, not a skipped check. No WS2 checks were run.

## WS3 executed coverage

`tests/phase4-ws3.test.js` checks LB-01..10: name/score/time validation, won-score derivation, order and stable ties, top-ten trim, same-file CLI export, missing/corrupt file, duplicate result and loopback Origin rejection. It also checks all nine remappable actions, conflicts, defaults, persistence normalization and mapped input. `scripts/phase4-ws3-browser.mjs` exercises the menu, all remaps, conflict/reset, toggles/reload, font size, a lost Night reached through real keyboard movement, result submission, same-file CLI export and menu reload. `scripts/phase4-ws3-cues.mjs` labels its controlled initial-state fixtures and checks Shade spawn, wind warning, final ten seconds and reduced-motion low-fuel cues. Screenshots and JSON are under `docs/proof/phase-4/ws3/`. Manual assistive-technology and offscreen-arrow direction checks remain pending; the soak blocker remains FAIL.
