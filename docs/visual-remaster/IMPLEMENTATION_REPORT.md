# Visual remaster implementation report

## Scope and result

This is an **in-progress visual workstream**, not a new release. The branch `feat/premium-visual-remaster` starts at the v1.0.0 release commit `ee3dca74fd8a2d8b61bbc091c6ae2d421c913855`. No Core, world descriptor, tuning, headless adapter, Test Contract, benchmark definition, soak definition, or historical tag was intentionally changed. Nothing was committed or pushed.

The implemented procedural art gives Night 1 stilt huts and a landing, Night 2 bamboo and bridge decoration, and Night 3 tower details and terraces. Mây now has a nón lá, cream tunic, red scarf, satchel, belt lantern and snapshot-driven idle/walk/air/dash motion. Lanterns have paper texture and bamboo details; Shades have an instanced ink wisp; Drifters have ribbons. The existing Core-derived fuel, safe zone, drain and accessibility visuals remain. CSS gives menus and HUD paper/brass styling with the existing 18 px floor and large-text mode.

All added scene geometry is visual only. Repeated props are instanced, static compatible meshes are merged and resources are disposed at world transitions. The visual preview and audit scripts capture real Chromium frames from initial Core states; those views are **render-only fixtures**, not gameplay E2E. No external art assets were downloaded. See [asset inventory](ASSET_INVENTORY.md) for rights and runtime sources.

## Evidence and verification

| Check | Actual result | Evidence |
|---|---|---|
| Unit | 205/205 PASS | `../proof/visual-remaster/regression/unit-final.log` |
| Independent Core cross-check | 15/15 PASS | `../proof/visual-remaster/regression/independent-final.log` |
| Build | PASS, existing bundle size warning | `../proof/visual-remaster/regression/build-final.log` |
| Verify harness, CLI, replay | PASS | `../proof/visual-remaster/regression/verify-final.log` |
| Browser boundary fixtures | 20/20 PASS after correcting distinguishable danger clock CSS | `../proof/visual-remaster/after/boundaries/` |
| Browser full campaign on final code | PASS, input-only Nights 1–3 and Bình Minh, 3759 points (1055/1430/1274) | `../proof/visual-remaster/regression/browser-final.log` and `../proof/visual-remaster/regression/browser-final/` |
| Soak | 10 Nights, zero crashes, RSS 35.32 → 48.39 MiB: **FAIL** 1.20× threshold | `../proof/visual-remaster/regression/soak.json` |
| Standard render benchmark | 719.90 avg FPS, 185.54 P1-low, 2.30 ms P95, load 4440 ms; local PASS | `../proof/visual-remaster/performance/bench-optimized.json` |
| Native gameplay 1280×720, SwiftShader | 29.78 / 27.66 / 26.21 / 25.68 FPS for Nights 1/2/3/3 stress: **FAIL** 30 FPS target | `../proof/visual-remaster/performance/performance-2026-11-24T05-05-02-780Z/performance.json` |

Baseline and final paired screenshots are in `../proof/visual-remaster/before/` and `../proof/visual-remaster/after/`. Captures cover menu, settings, leaderboard, Night 1 HUD and pause, render-only Night 1–3, and final Mây front/back/side. The boundary fixture folder includes lantern and Shade states. Actual image review confirms Mây and props visible and gameplay guidance unobstructed in these captures; it also confirms that terrain remains flat and Night 3 lacks premium visual depth. A specific pre-remaster close-up of Mây and pre-remaster lantern/drain states was not captured.

Changed source: `src/browser/renderer.js`, `src/browser/decor.js`, `src/browser/character.js`, `src/browser/app.css`; evidence tooling: `scripts/visual-audit.mjs`, `scripts/visual-preview.html`; documentation: `README.md`, `CREDITS.md`, and this `docs/visual-remaster/` folder. `git diff --check` exited 0. The Core, config, world descriptors, manifest and historical proof have no tracked changes.

## Open work and limits

- The 30 FPS SwiftShader gameplay gate fails on all four final samples. Draw calls, scene complexity and software rendering still need measured optimization; do not treat the fast standard benchmark as a substitute for the gameplay samples.
- The premium art direction is only partially realized. Terrain variation, richer culturally specific materials, cinematic but readable lighting, fuller character/creature animation states, more natural Mây proportions, and stronger UI identity remain. No licensed external model or texture was integrated; the procedural fallback is documented.
- Baseline memory trend was not recorded; current Night 3 restart geometry counts were bounded, but prolonged GPU resource profiling remains unverified. Manual audio quality and screen-reader review were not performed.
- P4-SOAK-03 remains FAIL/BLOCKER. This visual branch did not change or remediate soak behavior. The local benchmark does not establish instructor-hardware performance or official v1.0 contract compliance.

**Verdict: VISUAL REMASTER PARTIAL / NOT READY.**
