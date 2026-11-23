# Phase 4 Requirements Traceability Matrix

Source: TICKET-04; inherited requirements remain active unless explicitly replaced. WS1/WS2 status reflects commands actually executed; all unstarted work remains NOT RUN. IDs are local trace labels, not contract IDs. New evidence belongs under `docs/proof/phase-4/`; historical proof stays unchanged.

| Requirement ID | Expected / measurable acceptance | Test IDs | Evidence planned | Status | Severity |
|---|---|---|---|---|---|
| P4-BEN-01 | Windowed app viewport and drawing buffer1280×720; actual OS/renderer reported; VSYNC status truthful | BEN-01/02 | benchmark JSON + window metadata | PASS | BLOCKER |
| P4-BEN-02 | Exact initial scene:200 Shades wander,100 motes,L1–L3 fuel100, player origin and stationary; no input/pickup/damage/fuel change/spawn/end | BEN-03…08 | read-only Core snapshot | PASS | BLOCKER |
| P4-BEN-03 | Full standard Night1 visual quality; wander logic active; camera origin-target/radius/Y/start/orientation/15s orbit correct | BEN-09…12 | camera checkpoints/screenshots | PASS | MAJOR |
| P4-BEN-04 | 3s warm-up excluded, exact requested sample; avg/P1 formulas correct; P95 method fixed; load_ms process-start to rendered frame; RSS or honest null | BEN-13…20 | unit vectors + bench.json | PASS | BLOCKER |
| P4-BEN-05 | Strict flags/schema; valid command exits0 and output parses | BEN-21…25 | CLI run | PASS | BLOCKER |
| P4-SOAK-01 | 10 sequential requested Nights in same PID, order1/2/3 repeated, seed base+i; results only for completed Nights | SOAK-01…06 | PID trace, soak.json | PASS | BLOCKER |
| P4-SOAK-02 | Heading changes every30 ticks; per-tick action probabilities5/3/2/10%; deterministic PRNG and Core rising-edge semantics | SOAK-07…12 | RNG vectors and replay trace | PASS | MAJOR |
| P4-SOAK-03 | Full reset; RSS at Ticket points, bytes→MiB; crashes0; end RSS≤1.2×start; valid result cardinality/schema | SOAK-13…20 | same-process evidence | FAIL | BLOCKER |
| P4-LB-01 | Validate name3–12 `[A-Za-z0-9_]`, score from won Nights, wins0–3, zoned ISO8601 and exact seed | LB-01…08 | validation tests | NOT RUN | BLOCKER |
| P4-LB-02 | Save after Night3 Dawn/any loss; data survives restart and same CLI reads it | LB-09…14 | browser + disk + CLI | NOT RUN | BLOCKER |
| P4-LB-03 | Top10; score descending; score ties earlier achieved_at first; exact ties stable; export exact root `{entries:[...]}` | LB-15…21 | comparator/export tests | NOT RUN | BLOCKER |
| P4-ACC-01 | All nine actions remappable; conflicts rejected/announced; defaults reset; mapping persists | ACC-01…12 | keyboard browser E2E | NOT RUN | MAJOR |
| P4-ACC-02 | Shade spawn/offscreen arrow, wind, last10s and fuel<30 have visible/text/assistive cues and no per-frame replay | ACC-13…20 | DOM/screenshot/a11y checks | NOT RUN | MAJOR |
| P4-ACC-03 | Reduced motion disables camera shake/screen flashes; low-fuel still clear; fonts≥18px at1280×720; large text×1.25 | ACC-21…29 | computed style + preference E2E | NOT RUN | MAJOR |
| P4-C13-01 | Manifest `contract_version:"1.3"`; bench_cmd/soak_cmd resolve from source and extracted release roots | CTR-01…06 | manifest/clean package | PARTIAL | BLOCKER |
| P4-C13-02 | All active v1.0–v1.2 fields/events/validation and gameplay rules retained | CTR-07…12 | v1.2→v1.3 diff/regression | PARTIAL | BLOCKER |
| P4-PKG-01 | Clean Windows/Linux clone installs, builds, starts/plays in≤3 documented commands; no private paths | PKG-01…08 | fresh checkout logs | NOT RUN | BLOCKER |
| P4-PKG-02 | Release bundle executes out of workspace; browser and CLI share leaderboard data | PKG-09…14 | extracted artifact smoke | NOT RUN | BLOCKER |
| P4-DOC-01 | README has overview/image, requirements, install, controls, tests, headless, bench, soak, export;≤3 commands | DOC-01…04 | docs checklist | NOT RUN | MAJOR |
| P4-DOC-02 | Changelog all4 phases; Credits accurate for assets/audio/AI/dependencies; current license scope/rights reviewed | DOC-05…10 | attribution audit | NOT RUN | MAJOR |
| P4-RETRO-01 | 1–2 page/four phase evaluation, AI errors/detection/harness, sourced or explicitly assumed cost/token estimate, redo plan | RET-01…08 | retro evidence review | NOT RUN | MAJOR |
| P4-DEMO-01 | Authentic MP4<300s shows gameplay + real test/headless + benchmark output; reviewed and attached/referenced | DEMO-01…06 | media metadata/playback | NOT RUN | MAJOR |
| P4-REL-01 | Public repo, immutable phase tags; v1.0.0 release runnable artifact+guide+demo; all applicable hidden/regression gates pass | REL-01…12 | exact-SHA CI/release evidence | NOT RUN | BLOCKER |

## Inherited status

Phase 3 RTM's 23 PASS / 2 PARTIAL is historical and does not transfer as Phase 4 evidence. Phase 1–3 gameplay tuning, 60Hz/12-step pipeline, maps, score, scenarios, CLI, and known v1.2 fields/events remain mandatory regression scope. The official v1.0 base schema remains NOT VERIFIED until supplied and executed against; internal `game.contract.json` cannot promote that item to PASS.

## WS1/WS2 actual status (2026-11-22)

Benchmark requirements P4-BEN-01..05 passed the current-runner checks; see `docs/proof/phase-4/bench.json` and its scene trace. Soak P4-SOAK-01/02 passed ten-night same-process execution, ordered night/seed trace and seeded input tests. P4-SOAK-03 is FAIL/BLOCKER because actual end RSS 62.996 MiB exceeds 1.2� start RSS 49.641 MiB despite zero crashes and ten results. P4-C13-01/02 remain PARTIAL: known internal v1.3 additions and regressions are exercised, but extracted-package resolution and the official v1.0 schema are outside this workstream/unverified. All WS2 leaderboard/accessibility and WS3/WS4 requirements remain NOT RUN.

## Soak remediation audit

P4-SOAK-01 and P4-SOAK-02 remain PASS: ten outcomes, seeds 7-16, rotation 1/2/3, one PID, seeded input and no crash. P4-SOAK-03 remains FAIL/BLOCKER: official RSS 35.2734 -> 47.9414 MiB, ceiling 42.3281 MiB; three fresh repeats also FAIL. Benchmark requirements remain PASS after a new 30-second run. Contract v1.3 known command delta is unchanged; official v1.0 base remains NOT VERIFIED.

## Round 2 memory audit (2026-11-23)

P4-SOAK-03 remains **FAIL / BLOCKER**. Four new fresh-process 10-Night runs measured RSS ratios 1.3396, 1.3107, 1.3603 and 1.3179; all exceed 1.20. All had ten outcomes, no crashes, seeds 7–16 and rotation 1/2/3. Diagnostic 1/3/10/20-Night runs show RSS approaching a plateau, with stable external memory and no growing event/listener count. A terrain allocation experiment was reverted after no RSS benefit. Benchmark and regression remain PASS. See `docs/proof/phase-4/soak-remediation/round-2/`. No WS3 readiness is claimed.

## WS3 implementation audit (2026-11-23)

| Requirement | Status | Evidence | Remaining limit |
|---|---|---|---|
| P4-LB-01 | PASS | WS3 validation/ranking tests, browser result form | Local client can alter submitted won-score map |
| P4-LB-02 | PASS | WS3 real-input loss submission, default-state Dawn form, server JSON persistence, CLI same-file export | Browser/server restart tested; cross-OS not run |
| P4-LB-03 | PASS | Top-ten/tie/duplicate/export tests and menu browser E2E | Stable exact tie order follows insertion |
| P4-ACC-01 | PASS | All nine remaps, conflict/reset, reload persistence and held-key blur cleanup in Chromium | KeyboardEvent.code supported set is explicit |
| P4-ACC-02 | PASS | Controlled Chromium Shade/wind/countdown/low-fuel cues; offscreen arrow visibly updates after camera rotation; screenshots and aria-live DOM | Screen-reader announcement quality not directly listened to |
| P4-ACC-03 | PASS | Chromium reduced-motion, static low-fuel cue, settings/HUD font >=18px, 1.25× and no HUD overlap at 1280×720 | Other responsive sizes and assistive technology not separately audited |

P4-SOAK-03 remains **FAIL / BLOCKER**. Known v1.3 command delta remains PARTIAL without the official v1.0 base schema and extracted-package checks. WS3 evidence is under `docs/proof/phase-4/ws3/` and is not release acceptance.

## WS4 packaging and handover audit

| Requirement | WS4 status | Evidence and limit |
|---|---|---|
| P4-PKG-01 | PARTIAL | Independent Windows extracted source copy passed `npm ci`, build and server; actual post-commit clean clone and Linux are not verified |
| P4-PKG-02 | PASS on Windows | Preview ZIP extracted outside workspace; page HTTP 200, leaderboard API and CLI export work from the extracted root; macOS/Linux not verified |
| P4-DOC-01 | PASS | Current README includes gameplay image, three-command install, controls, tests, headless, benchmark, soak, leaderboard export and limitations |
| P4-DOC-02 | PASS | Four-phase CHANGELOG, revised CREDITS and existing scoped MIT LICENSE reviewed |
| P4-RETRO-01 | PASS | Evidence-based `docs/notes/PHASE4_RETROSPECTIVE.md`; no numeric AI cost fabricated without telemetry |
| P4-DEMO-01 | PARTIAL | Playable 42.61-second MP4 shows live Night 1 and labeled archived WS3 captures plus actual benchmark/Soak values; live Night 2/3 and terminal capture not shown |
| P4-C13-01 | PARTIAL | Manifest commands resolve in extracted preview for server/headless; rendered benchmark needs npm dependencies; official baseline unverified |
| P4-SOAK-03 | FAIL / BLOCKER | 35.27→47.94 MiB, limit 42.33 MiB; four Round 2 fresh runs also failed |
| P4-REL-01 | NOT VERIFIED | No commit, Phase 4 tag, exact-SHA CI or GitHub Release in this workstream |

WS4 Windows regression: unit 205/205, cross-check 15/15, verify 8/8, build and default-input three-Night browser campaign PASS (score 3759). These results do not clear the Soak blocker.

## Final release gate

P4-DEMO-01 is **PASS for Ticket-04 scope** after recording a 123.85-second MP4 with live Night 1 gameplay and actual test, headless, benchmark and Soak subprocess execution. P4-BEN-01..05 remain PASS on the standalone Windows run (640.63 average FPS, P1 166.08 FPS, load 5874 ms); the video-capture benchmark is separately labeled and not used as gate evidence. P4-SOAK-03 remains **FAIL/BLOCKER** after another independent 10-Night run: 35.296875→46.50390625 MiB, ceiling 42.35625 MiB. P4-PKG-01 remains PARTIAL pending a post-commit clean Git clone and Linux check; P4-C13-01/02 remain PARTIAL without the official v1.0 base. P4-REL-01 remains NOT VERIFIED because the blocker prevented commit, CI, tag and Release.

## Owner-approved publication exception

The project owner subsequently approved publishing v1.0.0 as a **Pre-release** with explicit disclosure of the unresolved RSS limit. This does not alter acceptance: **P4-SOAK-03 remains FAIL/BLOCKER**, and full Ticket-04 DoD is not met. The prior final-gate and Round 2 failed traces remain historical evidence. Current release-publication Soak samples started at higher RSS and individually met 1.20x; this variability does not close the repeated failure. The clean Windows Git clone was subsequently validated; Linux/macOS, official contract v1.0, grader GPU, direct audio listening and independent Phase 4 QA remain unverified. See `docs/proof/phase-4/PHASE4_FINAL_REPORT.md` and `RELEASE_NOTES_v1.0.0.md`.
