# Phase 4 final report — v1.0.0 documented exception

> **Phase 4 published with documented exceptions. P4-SOAK-03 remains FAIL. This release does not satisfy the full Ticket-04 Definition of Done.**

## Executive summary and implementation

The project owner explicitly accepted publication despite the unresolved Soak RSS requirement. This is a risk acceptance, not a test pass or independent QA sign-off. Phase 4 delivers a Playwright Chromium render benchmark using the shared Core, a same-process ten-Night Soak runner, a loopback Node server with one file-backed leaderboard used by browser and CLI export, nine remappable controls, visual accessibility cues, reduced motion, large text, a Windows-tested distributable ZIP, documentation and a real MP4 demo. Phase 1–3 gameplay tuning and the 12-step pipeline remain in place.

## Benchmark

The release-gate command `node scripts/bench-render.mjs --seed 42 --duration 30 --out docs/proof/phase-4/release-publication/bench.json` completed on Windows/Chromium with an AMD ANGLE D3D11 renderer, 1280×720 canvas, 200 Core-updated wandering Shades and 100 motes. Average FPS **1041.33**, P1 low **290.03**, frame P95 **1.70 ms**, first-render load **4438 ms**. This passes the local numeric thresholds. `vsync_off` is **false** because disabling it was not verified; browser RSS is `null` because reliable process RSS was unavailable. This machine does not represent the lecturer's grading machine. The earlier standalone final-gate run measured 640.63 average FPS, 166.08 P1, 2.80 ms P95 and 5874 ms load.

## Soak failure and memory analysis

**P4-SOAK-03 remains FAIL/BLOCKER in the RTM.** The final-gate ten-Night, one-process run had zero crashes but RSS **35.296875 → 46.50390625 MiB**, exceeding **42.35625 MiB** (1.317× versus the 1.20× limit). Four earlier fresh Round 2 runs also failed. Profiles found early RSS/V8 expansion tending toward a plateau, while external memory and old-Night event/entity references stayed stable; no further proven minimal fix was found. The measurement points, workload, seeds and threshold were not altered.

For transparency, this publication run measured **48.69921875 → 57.5 MiB** (1.181×) and three further fresh Node processes measured 1.1844×, 1.1834× and 1.1738×. Those higher starting RSS samples pass individually but do **not** resolve the repeated clean-process failures or promote P4-SOAK-03 to PASS. Raw JSON and logs are retained alongside the earlier failures.

## Leaderboard, accessibility and packaging

The top-ten leaderboard validates names, scores, win count, timestamp and seed; browser submissions and CLI export use one user-data JSON file. The local service is loopback-only. Client-side score submission does not provide strong anti-cheat authentication. Remapping covers nine actions with conflict rejection and persistence. Shade, wind, last-ten-second and low-fuel cues, reduced motion, color-distinguishable palette and large text were browser-tested.

The 93-entry ZIP at `docs/proof/phase-4/ws4/dao-den-long-phase4-prep.zip` was extracted and started on Windows. Its local server returned HTTP 200, Chromium entered gameplay, and leaderboard persistence plus CLI export agreed after restart. A clean Git clone of the checkpoint passed `npm ci`, build and start on Windows. README starts the source game in three commands: `npm ci`, `npm run build`, `npm run start`. The ZIP contains a built web bundle, server, scripts, package metadata, README, changelog, credits and license notices. Linux and macOS distribution runs are unverified.

## Regression and browser evidence

On the release candidate, `npm test` passed **205/205**, `npm run test:independent` passed **15/15** (agent-authored cross-check), `npm run verify` passed **8/8**, build passed, and `npm run test:browser` passed its default-input three-Night campaign to Bình Minh for **3759 points**. The verify harness covers current dawn scenarios, deterministic replay, CLI and 21,600-update headless performance. Browser outputs and command logs are under `release-publication/`; test output generated under Phase 3 default paths was moved there without changing content. `git diff --check` passed. The historical Phase 2 all-lantern script asserts a rule replaced by Ticket-03 and is not a current acceptance gate.

The playable `docs/demo/demo.mp4` is **123.85 seconds** and shows actual Night 1 gameplay, test/headless/benchmark/Soak execution and the Soak failure. It is not evidence of every platform or independent QA.

## Contract, RTM and known limitations

`game.contract.json` declares internal Test Contract **v1.3** and runnable `bench_cmd`/`soak_cmd` while retaining known earlier fields. The official v1.0 base schema was not supplied or verified, so full official compliance is **NOT VERIFIED**. RTM retains P4-SOAK-03 **FAIL/BLOCKER**; contract baseline and cross-platform items remain PARTIAL/NOT VERIFIED. The owner approved publication with this exception, not a change to the requirement.

Additional limitations: lecturer-machine GPU and benchmark result, macOS, direct listening to audio quality, and independent Phase 4 QA are unverified. Local FPS is reference evidence only. Historical failed evidence and tags `phase-1`, `phase-2`, `phase-3` are preserved.

## Git release information and reproducibility

The release SHA is the commit containing this report, reachable from both annotated tags `phase-4` and `v1.0.0`; inspect with `git rev-parse 'v1.0.0^{commit}'`. The GitHub Release is marked **Pre-release** and uses `RELEASE_NOTES_v1.0.0.md`. Exact SHA CI must succeed before tag publication. The original validated checkpoint remains in history at `31c7e73c55a1fd5172866412b2cd05a09a26f916`.

From a clean clone with Node.js 24:

```sh
npm ci
npm run build
npm run start
npm test
npm run test:independent
npm run verify
npm run test:browser
node scripts/bench-render.mjs --seed 42 --duration 30 --out bench.json
node scripts/soak.mjs --seed 7 --nights 10 --out soak.json
```

The Soak exit code reflects the individual run; inspect RSS against `1.2 * mem_start_mb` and the retained failed runs before claiming requirement status. See [release notes](../../../RELEASE_NOTES_v1.0.0.md), [RTM](../../notes/phase-4-rtm.md), [prior final gate](final-gate/FINAL_GATE_REPORT.md), [memory investigation](soak-remediation/round-2/root-cause-confirmation.md), and [release-gate outputs](release-publication/).
