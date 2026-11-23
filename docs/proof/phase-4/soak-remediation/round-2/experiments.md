# Round 2 controlled soak experiments

Windows 10.0.26300 x64, Node v24.13.0. Four separate diagnostic processes used base seed 7, unchanged Core input, 1/3/10/20 Nights. The diagnostic callback observes memory and entity counts; acceptance RSS points were not changed. Raw samples: `diagnostic-1.json`, `diagnostic-3.json`, `diagnostic-10.json`, `diagnostic-20.json`.

| Nights | Initial RSS MiB | Final RSS MiB | Final heapUsed MiB | Final heapTotal MiB | Final external MiB |
|---:|---:|---:|---:|---:|---:|
| 1 | 35.95 | 42.97 | 5.48 | 8.31 | 1.73 |
| 3 | 35.84 | 46.78 | 7.16 | 11.31 | 1.73 |
| 10 | 35.91 | 47.48 | 8.40 | 12.06 | 1.73 |
| 20 | 35.86 | 47.82 | 7.77 | 12.31 | 1.73 |

RSS grows mainly in the first three Nights and approaches a plateau by Night 20. Entity counts and event history reset per Night; process listener count stayed 5. A separate 20-Night diagnostic with post-run GC reduced heapUsed from 7.74 to 4.80 MiB while RSS rose from 48.55 to 49.13 MiB. This GC was **never** used in acceptance. Raw file: `diagnostic-gc-20.json`.

One focused experiment removed temporary `heights` and `support` arrays from `terrainHeight`. A 196-test run including terrain parity passed. A separate 10-Night diagnostic still measured 35.99 → 48.10 MiB (1.34×); the change was reverted because it did not improve the gate. Its diagnostic output is `memory-diagnostics.json`. The added parity test remains useful regression coverage; production terrain code is unchanged.

Four official 10-Night fresh processes after the revert all failed RSS. Each produced ten real `lost` outcomes, no crashes, seeds 7–16, rotation 1/2/3, and one PID per run. The original Round 1 FAIL `soak.json` was not replaced. See `soak-run-{1,2,3,4}.json` and trace files.
