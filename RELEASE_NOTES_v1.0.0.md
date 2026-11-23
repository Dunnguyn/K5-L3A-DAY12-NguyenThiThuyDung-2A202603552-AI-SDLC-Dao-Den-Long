# Đảo Đèn Lồng v1.0.0 — Known Limitations

> **Phase 4 published with documented exceptions. P4-SOAK-03 remains FAIL. This release does not satisfy the full Ticket-04 Definition of Done.**

This **Pre-release** packages the three-Night campaign, fuel and dawn survival, a local leaderboard, keyboard remapping and accessibility cues. It includes the internal Test Contract v1.3 command delta, render benchmark, ten-Night Soak runner, documentation and a real demo video.

## Accepted release exception: Soak RSS

The standard ten-Night run completed with **0 crashes**, but a final-gate clean process measured **35.30 → 46.50 MiB RSS**, above the **42.36 MiB** limit (1.317× versus required ≤1.20×). Four other clean Round 2 runs failed. New release-gate runs happened to start at higher RSS and individually met the ratio; this variability does not erase the repeated failures. **P4-SOAK-03 remains FAIL/BLOCKER in the RTM.** The project owner explicitly accepted this risk for publication. No threshold or result was changed.

## Local verification

- Unit **205/205**, agent-authored cross-check **15/15**, verification harness **8/8**, build and browser E2E PASS.
- Default-input browser campaign completed Night 1–3 and Bình Minh with **3759 points**.
- Windows/Chromium local 30-second benchmark: **1041.33 average FPS**, **290.03 P1 low FPS**, **1.70 ms P95**, **4438 ms load** at 1280×720. `vsync_off:false`; browser RSS unavailable. These numbers do not predict performance on the lecturer's machine.
- Clean Windows Git clone and extracted ZIP were run; the local server, gameplay, leaderboard restart and CLI export worked.

## Other limits

The official Test Contract v1.0 base schema, lecturer-machine GPU, macOS, direct audio listening and independent Phase 4 QA remain unverified. Linux distribution behavior is also unverified. CI success, if present, does not imply the Soak RSS threshold passed or that full Ticket-04 DoD was met.

## Assets and use

- `dao-den-long-phase4-prep.zip`: built game, loopback server, source/scripts and instructions. Requires Node.js 24; see bundled README.
- `demo.mp4`: 123.85-second real gameplay and verification demo.
- `bench.json` and `soak.json`: original run outputs, including the failing Soak evidence. Additional failures and current reruns remain in the repository proof tree.

To play from source: `npm ci`, `npm run build`, `npm run start`. Full commands, limits and evidence are in [the Phase 4 final report](docs/proof/phase-4/PHASE4_FINAL_REPORT.md).
