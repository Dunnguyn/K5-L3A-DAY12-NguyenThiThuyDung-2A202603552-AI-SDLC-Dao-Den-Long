# Phase 4 release-candidate checkpoint — unreleased

This checkpoint preserves Phase 4 work on branch `phase4/release-candidate`. It is **not** a `phase-4` release, GitHub Release `v1.0.0`, independent QA acceptance or official Test Contract compliance claim. Resolve the local commit with `git rev-parse HEAD`; no push was requested.

## Included work

- Render benchmark: Playwright Chromium, Night 1 standard scene, 200 active wandering Shades, 100 motes, 1280×720 canvas, 30-second measured sample and internal v1.3 `bench_cmd`.
- Same-process deterministic Soak runner and memory diagnostics. The ten-Night runs complete without crashes; the RSS acceptance condition still fails repeatedly.
- Loopback Node server, file-backed top-ten leaderboard shared by browser and CLI export, keyboard remapping, accessibility cues, reduced motion and large text.
- Built-web distribution preview ZIP, README, four-phase CHANGELOG, CREDITS and license notices, retrospective, 123.85-second MP4 demo, RTM/ADR/test plan, actual benchmark and Soak JSON, and historical QA/evidence.

## Blocking result

`P4-SOAK-03 = FAIL/BLOCKER`. The final independent standard run used seed 7 for ten rotating Nights in one process: zero crashes, RSS **35.296875 → 46.50390625 MiB**, allowed end **42.35625 MiB**. Four Round 2 clean processes also failed. The memory investigation found early V8 heap/RSS expansion approaching a plateau, with stable external memory and no demonstrated retained old-Night Core collection. Prior targeted allocation changes did not meet the ratio; no further speculative optimization is part of this checkpoint. A single pass during simultaneous MP4 capture had a higher starting RSS and does not overturn repeated clean failures. Raw outputs and profiles remain under `docs/proof/phase-4/`.

## Verification and limits

Final gate: unit **205/205**, agent-authored independent cross-check **15/15**, harness **8/8**, build and real-input browser campaign PASS (Bình Minh **3759**). Standalone local rendered benchmark: **640.63 average FPS**, **166.08 P1 FPS**, load **5874 ms**; local hardware is not the lecturer's grading machine. `git diff --check` passed. The preview ZIP was extracted on Windows; built server/browser gameplay, leaderboard restart and CLI export worked. An independent extracted source copy passed `npm ci` and build. A clean Git clone of this unpushed checkpoint, Linux, macOS, real grader GPU, direct audio listening and the official v1.0 contract schema remain **NOT VERIFIED**. The known internal v1.3 command delta is implemented.

The old `scripts/campaign-headless.mjs` still asserts the replaced Phase 2 all-lantern victory condition and fails under Ticket-03; the current dawn replay and browser campaign pass. Its failure was retained and explained in `final-gate/FINAL_GATE_REPORT.md`, rather than hidden or altered to pass.

## Conditions before any release

1. Close P4-SOAK-03 with a justified, tested fix and repeated standard clean-process runs meeting RSS ≤1.20×, or obtain a **separate explicit owner decision** accepting an exception. Do not relabel current evidence PASS.
2. Re-run the full mandatory regression and benchmark on the release candidate; verify a clean clone and distributable on each platform claimed. Keep unverified platforms and official base-contract compatibility explicit.
3. Audit staged files and release assets, then push a reviewed commit. Verify CI SUCCESS on that exact SHA before considering annotated tag `phase-4` and GitHub Release `v1.0.0` with ZIP and demo. Do not move `phase-1`, `phase-2` or `phase-3`.

Evidence: [final gate](final-gate/FINAL_GATE_REPORT.md), [RTM](../../notes/phase-4-rtm.md), [memory investigation](soak-remediation/round-2/root-cause-confirmation.md), [packaging preview](ws4/packaging-validation.json).
