# Phase 4 final release gate — blocked

**Verdict: RELEASE BLOCKED.** No Phase 4 commit, push, exact-SHA CI check, annotated `phase-4` tag or GitHub Release `v1.0.0` was performed. The mandatory P4-SOAK-03 RSS bound remains unmet. The source baseline is `483c527b7101c7177b10d9b816c681fe52d00f46` (`phase-3`); the Phase 4 working tree is uncommitted. Phase 1–3 tags were not moved.

## Soak technical assessment

The retained Round 1/2 profiles compare 1, 3, 10 and 20 Nights. RSS grows mainly in the first three Nights and approaches ~47–48 MiB. Diagnostic heap GC lowered live heap without a comparable RSS reduction; external/arrayBuffers and listener count remained stable. Per-Night entity/event references reset. Earlier read-only world query, snapshot-cache and Shade-target allocation reductions lowered absolute memory, but not the ratio. A separate terrain-array experiment did not improve RSS and was reverted. No single remaining retained collection or allocation site has been demonstrated by a reproducing test, so this gate made **no speculative Core or Soak change**.

The standard command `node scripts/soak.mjs --seed 7 --nights 10 --out docs/proof/phase-4/final-gate/soak.json` completed ten Nights with zero crashes but returned exit 1: **35.296875 → 46.50390625 MiB** RSS, versus **42.35625 MiB** allowed. All ten outcomes were actual losses; seeds and rotation follow the contract. Four prior fresh Round 2 runs also failed. A single Soak subprocess executed during MP4 capture measured a higher initial RSS (44.04 MiB) and passed its own ratio. That isolated sample is retained as evidence of measurement variability and **does not clear a gate with repeated clean-process failures**. No sampling point, threshold, workload, seed, V8 flag or forced GC was changed.

## Final regression

| Gate | Result |
|---|---|
| `npm test -- --reporter=dot` | 205/205 PASS |
| `npm run test:independent` | 15/15 PASS; agent-authored cross-check, not external QA |
| `npm run verify` | 8/8 PASS, including current three-Night world scenarios, dawn replay, CLI import and 21,600-update headless benchmark |
| `npm run build` | PASS |
| `npm run test:browser` | PASS: default-input Night 1/2/3 dawn victory, Bình Minh 3759 points; current browser proof directory is recorded in `verification-results.json` |
| Render benchmark, standalone 30 s | PASS locally: 640.63 average FPS, 166.08 P1 FPS, 2.80 ms P95, 5874 ms load; 1280×720 canvas, 200 Shades, 100 motes, AMD ANGLE D3D11, `vsync_off:false`, browser RSS unavailable |
| Soak, same process ten Nights | **FAIL/BLOCKER:** 35.30→46.50 MiB versus 42.36 MiB ceiling |
| `git diff --check` | PASS; line-ending warnings only |

The standalone benchmark is the gate evidence. A different benchmark run filmed concurrently with the demo was slower and had a >10-second load; the video labels it as concurrent capture. Its command exit 0 means execution completed, not that its performance threshold passed.

An optional historical `scripts/campaign-headless.mjs` run failed its obsolete Phase 2 assertion that every lantern is lit at victory. Ticket-03 replaced that rule with a 60% dawn threshold. The current `phase3-dawn-replay.mjs` and default-input browser campaign pass. The historical script and failure were not deleted or treated as a current acceptance oracle.

## Packaging, documentation and demo

The 93-entry Windows ZIP preview was extracted and run outside the workspace. It contains the built site, server, scripts/source, manifest/lockfile, README, changelog, credits, original-code LICENSE and the bundled Three.js MIT notice. It excludes development `node_modules`, user leaderboard and known private paths/secrets. The extracted server returned HTTP 200; Chromium entered Night 1 (tick 18). A temporary profile survived a server restart and CLI export returned the same leaderboard entry. An independent extracted source copy passed `npm ci`/build. An actual clean **Git clone of uncommitted Phase 4**, Linux and macOS remain NOT VERIFIED.

README, ADR, RTM, four-phase CHANGELOG, LICENSE/CREDITS, retrospective, actual `bench.json`/`soak.json` and the internal v1.3 manifest were audited. Official Test Contract v1.0 base schema remains unavailable; known v1.3 command deltas are implemented without a full compliance claim.

`docs/demo/demo.mp4` is a playable **123.85-second** 1280×720 Chromium MP4. It shows live Night 1 gameplay and live unit/headless/benchmark/Soak subprocess output, with archived WS3 screenshots labeled. It separately shows the actual standalone benchmark result and failing independent Soak gate. Playback frames were inspected. It is a browser canvas recording of actual process output rather than a native terminal window recording; it is not a substitute for the JSON evidence.

## Release decision

P4-SOAK-03 is the mandatory release blocker. P4-PKG-01 is PARTIAL pending a post-commit clean clone/Linux check; official contract v1.0, macOS, real grader GPU performance, manual audio listening and independent Phase 4 QA are NOT VERIFIED. The project owner may separately decide whether to accept an exception, but **no exception was granted in this gate**. Until then, do not tag or publish v1.0.0.
