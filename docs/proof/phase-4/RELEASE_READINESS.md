# Phase 4 release readiness — preparation only

**Decision:** RELEASE BLOCKED. P4-SOAK-03 is FAIL/BLOCKER. No phase-4 tag or v1.0.0 GitHub Release was created.

| Area | Status | Evidence / limit |
|---|---|---|
| Render benchmark | PASS locally | Original `bench.json`: 760.77 average FPS, 258.76 P1, 2.40 ms P95, 4957 ms load. WS4 repeat: 585.43 average FPS, 133.24 P1, 3.40 ms P95, 6578 ms load; Windows Chromium AMD ANGLE, vsync-off unverified |
| Soak 10 Nights | FAIL / BLOCKER | Historical `soak.json`: 35.27→47.94 MiB RSS, ceiling 42.33; four Round 2 clean runs FAIL. Final independent gate: 35.30→46.50 MiB, ceiling 42.36, zero crashes |
| Leaderboard | PASS in WS3 browser/CLI checks | Single local JSON file, persisted after server restart; local submissions are not tamper proof |
| Accessibility | PASS in automated WS3 checks | Nine remaps, cues, reduced motion, large text; direct screen-reader review remains unverified |
| Packaging | PASS on Windows smoke | `ws4/dao-den-long-phase4-prep.zip` extracted to an independent temp directory; built page HTTP 200, Chromium clicked into Night 1 (tick 18), API/CLI export work; no node_modules or profile file bundled |
| Clean install | PASS on independent Windows source copy | `npm ci` and `npm run build` completed in extracted directory; `node scripts/start.mjs` served the built page. An actual post-commit clean Git clone, Linux and macOS remain NOT VERIFIED |
| Documentation | PASS for prepared content | README, four-phase changelog, credits/license review, 1–2-page retrospective |
| Demo | PASS for Ticket-04 scope | Real Chromium MP4, 123.85 s, 1280×720; live Night 1 keyboard gameplay and live unit/headless/benchmark/soak subprocess output. Archived WS3 images are labeled. The video distinguishes a single Soak run from the failing independent release gate; gameplay and final frames were inspected. It is a browser canvas recording of actual subprocess output, not a native terminal capture |
| Contract v1.3 | PARTIAL | Internal known delta, manifest commands included; official v1.0 base schema not available |
| Release/CI | BLOCKED | Soak failed the mandatory gate; no Phase 4 commit, CI run, tag or release was made |

Final gate regression: 205/205 unit tests, 15/15 cross-checks, eight verify gates, build and the default-input three-Night browser campaign (3759) passed. Standalone 30-second benchmark passed locally at 640.63 average FPS, P1 166.08 FPS and 5874 ms load. A fresh ten-Night Soak failed at 35.30→46.50 MiB RSS versus a 42.36 MiB ceiling. No justified Core fix was found in the existing profiles. See `final-gate/FINAL_GATE_REPORT.md`. Requirements and historical proof were preserved.

The packaging artifact is a **preview**, not a released build. It contains built web assets, source/core/headless/benchmark scripts, the loopback server, package metadata/lockfile, manifest, README, CHANGELOG, CREDITS, LICENSE and RUN.txt. It does not contain development node_modules, secrets or a user leaderboard. Node 24 can start the already built site directly. `npm ci` is required for rebuilding and the Playwright benchmark.

Before a future release gate: resolve the soak RSS ratio across repeated clean processes without measurement workarounds; verify a clean checkout from the release candidate commit and claimed OS platforms; rerun all mandatory checks; inspect the artifact and demo; check exact-SHA CI; then consider tag and GitHub Release only under separate authorization.
