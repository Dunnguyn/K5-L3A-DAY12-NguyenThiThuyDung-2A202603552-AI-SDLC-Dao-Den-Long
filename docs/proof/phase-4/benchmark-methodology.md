# Phase 4 Benchmark Methodology — WS1

Run: `npm run bench:render -- --seed 42 --duration 30 --out docs/proof/phase-4/bench.json` (headed Playwright Chromium, one browser context). Command process uptime was sampled at the browser's first rendered-frame marker; browser performance timestamps bracketed a 3.000 s warm-up and a 30.000 s sample. Sampled RAF intervals are clipped to the requested monotonic interval; no warm-up intervals enter the metrics.

Viewport and drawing buffer were both 1280×720; outer window was 1296×808, non-fullscreen. Chromium was 159.0.8154.6 on Windows_NT 10.0.26300 x64. WebGL reported Google ANGLE / AMD Radeon(TM) 860M via Direct3D11. This renderer string is the browser's report, not an independent hardware certification. Vsync disable flags were requested but not verified (`vsync_off:false`). Browser process RSS could not be reliably read (`peak_mem_mb:null`); renderer text explains this and no JS heap substitute was used.

The runner validates 200 Shades in `wander`, 100 available motes, L1–L3 lit at fuel100, stationary player at origin, non-fullscreen view, exact buffer size, and camera initial pose/orbit checkpoints. Benchmark-only Core updates call the ordinary shared Wander AI and omit campaign-only transitions, pickups, damage, fuel, spawning and terminal checks. Standard Night 1 scene/rendering remains in place.

Measured output is in [bench.json](bench.json); actual scene/timing trace is in [bench.json.scene.json](bench.json.scene.json). Latest real run after final scene adjustment: average 760.77 FPS; P1-low 258.76 FPS; frame-time P95 2.40 ms (nearest-rank); 22,823 sampled frame intervals; load 4,957.13 ms. Local thresholds (avg>=60, P1>=30, load<=10,000 ms) pass on this machine only. Lecturer-machine performance remains unverified.

Formulas: `avg_fps=1000*N/sum(dt_i)`, `k=max(1,ceil(.01*N))`, P1=`1000/mean(k largest dt_i)`, P95=`sorted[ceil(.95*N)-1]`. The JSON records the required metrics. Outer dimensions are evidence only; the accepted 1280×720 requirement is the app viewport/drawing buffer.
