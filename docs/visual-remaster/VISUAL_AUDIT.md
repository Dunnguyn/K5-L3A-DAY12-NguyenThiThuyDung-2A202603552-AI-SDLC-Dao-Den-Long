# Visual remaster audit

## Baseline inspection

At release SHA `ee3dca74fd8a2d8b61bbc091c6ae2d421c913855`, `src/browser/renderer.js` built the world from disk/rect/annulus/ramp descriptors, instanced a few trees/clouds, reused GPU instances for Night 3 Shades and lanterns, and read a Core-derived `browserView`. It rendered Mây from a small capsule, sphere and cone; the flat grass top and dark cloud polyhedra dominated the camera. The Night 3 tower and Night 2 bridge were mechanically readable but visually sparse. `app.css` already supplied the 18 px accessibility floor; panels and HUD lacked stronger material hierarchy. The scene had no external runtime asset loader; Web Audio was synthesized in code. `clearWorld` disposed world geometry/materials on Night changes, while static meshes were merged only in Night 3.

Actual 1280×720 Chromium screenshots are in [`before/`](../proof/visual-remaster/before/): menu, settings, leaderboard, Night 1 HUD/pause and render-only initial-Core views for Nights 1–3. The static Night views use no scenario mutation and are **visual fixtures, not gameplay E2E**. Mây close-ups and particular fuel/Shade states were not captured before implementation; no fabricated baseline images were added.

| Static initial-Core view | Before FPS / P1 | Before calls | After FPS / P1 | After calls |
|---|---:|---:|---:|---:|
| Night 1 | 17.97 / 10.00 | 25 | 13.30 / 10.00 | 44 |
| Night 2 | 18.38 / 12.00 | 49 | 13.30 / 10.00 | 41 |
| Night 3 | 16.73 / 10.00 | 28 | 12.88 / 11.99 | 47 |

The table is a roughly five-second **headless SwiftShader render-only** sample for each view, measured using requestAnimationFrame timestamps. Before samples did not record the WebGL renderer string; the after samples report `ANGLE Vulkan SwiftShader`. These numbers show a real software-rendering regression and do not establish the 30 FPS gameplay target. Before/after screenshots used the same 1280×720 camera and initial Core state for each Night. Draw calls and geometry counts are from `renderer.info`; detailed arrays are in `before/audit.json` and `after/audit.json`. JavaScript heap/resource lifetime across prolonged transitions has not been fully profiled.

The standard 30-second Night 1 benchmark after the final optimization measured **719.90 average FPS**, **185.54 P1-low**, **2.30 ms P95** and **4440 ms load** on local Windows/Chromium AMD ANGLE D3D11. The first remaster run measured 756.07/178.01 FPS. The historical release benchmark measured 760.77/258.76 FPS and 4957 ms load on the same named renderer, with high run-to-run variation (other Phase 4 samples include 640.63 and 1041.33 average FPS). The benchmark retained 200 moving Shades, 100 motes and 1280×720 canvas. `vsync_off:false`, browser RSS unavailable; instructor hardware is unverified. See [`performance/bench-optimized.json`](../proof/visual-remaster/performance/bench-optimized.json).

## Visual review and open work

The new art improves Mây's silhouette and gives each Night some distinct props, but screenshot review still shows flat terrain, sparse near-field detail and dark Night 3 surfaces. The scene does not yet meet the approved premium art quality. Close-up screenshot evidence exists for Mây after implementation only. Visual-only lantern and Shade boundary screenshots are stored under `after/boundaries/` and explicitly use controlled fixtures.

Four **60-second native-clock gameplay** samples on Windows Chromium 159 SwiftShader after optimization were 29.78 FPS (Night 1), 27.66 (Night 2), 26.21 (Night 3), and 25.68 (Night 3 lit stress). All are below the 30 FPS gameplay target; see [`performance.json`](../proof/visual-remaster/performance/performance-2026-11-24T05-05-02-780Z/performance.json). The first remaster samples were 28.94/27.45/26.23/23.97 FPS respectively. These are real software-rendering results, not GPU claims. Browser process RSS was not reliably available; restart geometry counts were bounded in the measured Night 3 stress run. The first attempted optimization measurement was interrupted by a Vite reload and is retained as invalid evidence, never counted as a passing run.
