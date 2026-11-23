# Allocation profiling

Diagnostic-only Node V8 heap sampling used `--heap-prof --heap-prof-interval=1024` for ten Nights. Raw `.heapprofile` is retained in this directory. Sampled self sizes include Node runtime ~1.07 MiB, idle ~0.39 MiB, `Math.hypot` ~53 KiB, `core/game.js:step` ~38 KiB, `worlds.js` module initialization ~29 KiB, `Array.filter` ~17 KiB, `playerMove` ~14 KiB and `nextSoakInput` ~8 KiB. Sampling is not a complete allocation census and cannot by itself attribute the RSS delta. The Core still creates per-tick input/previous-state objects and terrain query arrays; the isolated terrain-array removal experiment did not improve RSS.

The profile and the 1/3/10/20 trend point to multiple small temporary allocations and runtime heap growth rather than one demonstrated retained collection. No speculative Core rewrite was retained.
