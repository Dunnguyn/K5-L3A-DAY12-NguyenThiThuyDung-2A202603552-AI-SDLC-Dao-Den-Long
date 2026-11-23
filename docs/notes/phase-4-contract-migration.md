# Test Contract v1.2 → v1.3 Migration

**Status:** known internal v1.3 delta implemented for WS1/WS2 only; official base remains unverified. `docs/requirements/TEST_CONTRACT_SPEC.md` identifies the official v1.0 schema as DRAFT/unverified. This migration cannot claim official compatibility until that schema/harness is provided and tested.

| Manifest path/command | Current v1.2 | Ticket v1.3 | Compatibility and validation |
|---|---|---|---|
| `contract_version` | string `"1.2"` | string `"1.3"` | Intentional version bump; strict v1.2 manifest consumers may reject |
| `command` | `node scripts/headless.mjs --night 1 <scenario.json>` | Retain; add documented export form `node scripts/headless.mjs --export-leaderboard <out.json>` | Existing game input/output envelope and behavior remain where not replaced by earlier Ticket |
| `bench_cmd` | absent | `node scripts/bench-render.mjs` | New top-level base command; append `--seed`, `--duration`, `--out` |
| `soak_cmd` | absent | `node scripts/soak.mjs` | New top-level base command; append `--seed`, `--nights`, `--out` |
| v1.0–1.2 known fields/events/tuning | current manifest and adapter | retained unchanged | No old gameplay tuning, snapshot field, event or validator is removed/retyped by Phase 4 |

## Benchmark command and JSON

```sh
node scripts/bench-render.mjs --seed 42 --duration 30 --out bench.json
```

Required successful fields/types:

```json
{
  "contract_version": "1.3",
  "avg_fps": 0,
  "p1_low_fps": 0,
  "frame_ms_p95": 0,
  "frames": 1,
  "load_ms": 0,
  "peak_mem_mb": null,
  "vsync_off": false,
  "renderer": "actual browser/renderer description",
  "os": "actual OS description"
}
```

Numbers above are schema examples, **not measurements**. Successful `frames` is a positive integer; numeric measures finite and nonnegative; RSS is finite nonnegative or null with explanation; renderer/os are nonempty strings; vsync_off Boolean. `N=frames`, `avg_fps=1000*N/sum(dt_i)`. Let `k=max(1,ceil(.01*N))`; P1 low FPS is `1000/mean(k largest dt_i)`. `frame_ms_p95` is nearest-rank: sort frame deltas ascending and take one-based rank `ceil(.95*N)`. Warm-up3s is outside the requested monotonic wall-clock interval. `load_ms` runs from benchmark command process start to actual WebGL render/presentation opportunity. Peak memory means process RSS, not JS heap; browser RSS may be null if unavailable.

## Soak command and JSON

```sh
node scripts/soak.mjs --seed 7 --nights 10 --out soak.json
```

Output keys: `nights` (requested count), `crashes`, `results` (one `won`/`lost` for each Night actually completed), `mem_start_mb`, `mem_end_mb`, `duration_s`. A successful ten-Night run has ten results and crashes0; partial failure has fewer results, a counted exception and nonzero exit. Fatal process termination cannot be converted into fabricated JSON. RSS points and unit are fixed in TICKET-04 and test plan. For acceptance `crashes=0`, `mem_end_mb<=1.2*mem_start_mb`.

## CLI, resolution and migration tests

- Manifest commands resolve from repository root and extracted package root; imports resolve from `import.meta.url`, while `--out` resolves from caller working directory.
- Strict flags reject absent/duplicate/unknown values; seed nonnegative safe integer; duration positive integer; nights positive integer. An upper nights bound is not in Ticket and requires approval before adding.
- The benchmark/soak profile does not add gameplay snapshot fields or change normal Core outputs.
- The local leaderboard exporter validates/reads the same data file as browser persistence and writes exactly `{"entries":[...]}`; each entry has only `name,score,nights_won,achieved_at,seed`.
- Add a generated-manifest regression that compares v1.2 old keys/tuning/events/validation to v1.3, permitting only version and new command additions. Exercise old input fixtures unchanged.
- Keep scenario envelope `internal-draft-1` unless official specification says otherwise; contract version1.3 is not scenario-envelope version.
- Full official compliance remains NOT VERIFIED; do not reconstruct missing v1.0 schema from local adapter behavior.

## Unresolved contract interpretations to approve

1. `nights` is interpreted as requested count; `results.length` is completed count. Ticket example (`nights:10`, three results) supports this reading.
2. Benchmark JSON is kept to the displayed required fields; run duration and null-RSS explanation go in adjacent evidence/README, not invented keys.
3. Per-Night seed and input trace for soak are recorded as evidence sidecars, not new `soak.json` fields.
4. Whether official v1.3 allows descriptive manifest fields beyond the two required command keys is unknown until its schema is available.

## WS1 implementation status

`game.contract.json` now says `contract_version:"1.3"` and exposes `bench_cmd:"node scripts/bench-render.mjs"` plus `soak_cmd:"node scripts/soak.mjs"`; the writer retains existing v1.2 tuning/input/output fields. Both commands resolve from the repository root. The known internal delta is implemented only; official v1.0 base compliance remains NOT VERIFIED, and extracted-package command resolution is not tested in WS1/WS2.
