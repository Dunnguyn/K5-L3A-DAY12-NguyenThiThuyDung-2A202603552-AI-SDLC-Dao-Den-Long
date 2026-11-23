# ADR — Phase 4 Benchmark, Soak, Leaderboard and Release Architecture

- **Status:** Proposed; owner approval required before implementation
- **Date:** 2026-11-22
- **Context:** TICKET-04 requires measured rendered performance, a ten-Night same-process stability run, local leaderboard visible to both browser and CLI, accessibility, v1.3 commands and runnable v1.0.0 package. Current app is Vite/Three.js + shared ESM Core + Node24 headless. No local server/leaderboard/soak/render benchmark exists. Phase 1–3 sources/evidence/tags are immutable.

## Decisions

### D1 — Render benchmark uses a real headed Chromium window

Use Node Playwright to launch app-mode Chromium window, windowed/non-fullscreen, viewport and drawing buffer1280×720. Serve built Vite app locally. Report actual OS/browser/WebGL renderer/GPU string only when exposed. Request Chromium `--disable-frame-rate-limit` and `--disable-gpu-vsync`; set `vsync_off=true` only when supported/requested, otherwise false and explain. Preserve all standard Night1 visuals, lights, shadows and effects.

The benchmark-only Core profile sets exactly200 seeded Shades initially in `wander`,100 seeded motes, L1–L3 lit/fuel100, player at origin/stationary/no input. It freezes only pickup, damage, fuel decay/drain, spawn and terminal outcome as Ticket requires; it continues the shared normal Shade Wander update. It does not freeze entities, remove objects, lower rendering quality or substitute synthetic renderer geometry. Camera targets origin, horizontal radius30m/Y15m, starts (30,15,0), CCW as seen from above, revolution15s. Warm-up3s; exact monotonic requested sample. Formula/P95 definition is in [contract migration](../notes/phase-4-contract-migration.md). `load_ms` starts before runner setup and stops at first actually rendered WebGL frame/presentation opportunity. Report RSS only if safely measurable for actual process; else null, never JS heap.

**Reason:** current Core's gameplay fuel/spawn/damage/end rules and normal spawn caps conflict with the benchmark's fixed scene. A dedicated explicit benchmark policy separates measurement from gameplay while keeping shared rendering and AI behavior. Test fixture entry points must not leak into player gameplay.

### D2 — Soak runs shared Core directly in one process

`scripts/soak.mjs` imports `createGame`, `step`, and reset helpers; no per-Night subprocess. Rotate1/2/3; Night index i uses seed `base+i`. A separate seeded LCG input stream (`state=(imul(state,1664525)+1013904223)>>>0`, zero normalized to1, output `state/2^32`) drives an 8-way direction selection every30 ticks and independent per-tick button level draws. Raw Boolean levels go to Core; rising edges remain Core's own behavior. At Night completion replace all Night-owned state; keep compact outcome only. Read `process.memoryUsage.rss()` at Ticket's two points and divide bytes/1024²; do not force GC or use heapUsed.

**Reason:** this exercises actual Core lifecycle/reset and process memory while keeping input reproducible without perturbing Core's RNG stream. RNG algorithm and 8-way direction distribution are implementation assumptions, not Ticket rules.

### D3 — One loopback server and one authoritative JSON file

Choose local server + file storage (Ticket option C). Node24 server binds only `127.0.0.1`, serves static bundle and same-origin leaderboard API. Browser writes one file in OS user-data directory; CLI export reads that exact file. `DAO_DATA_DIR` supports isolated tests. Use request validation, body size cap, Origin check, static path normalization, temp-file+atomic-rename. One server process is writer; export is read-only. Top10 sort score descending, earlier zoned timestamp first, stable insertion order for exact tie. Server stamps UTC ISO time. Entry has only the five Ticket fields. Browser uses Core campaign sum of won-Night scores and seed; no local anti-cheat claim.

Default paths: Windows `%LOCALAPPDATA%/DaoDenLong/leaderboard.json`; macOS `~/Library/Application Support/DaoDenLong/leaderboard.json`; Linux `$XDG_DATA_HOME/dao-den-long/leaderboard.json`, fallback `~/.local/share/dao-den-long/leaderboard.json`.

**Alternatives:** static+localStorage cannot share with CLI; desktop wrapper is larger/platform-specific than needed; Docker requires extra install/volume and is less suitable for grading. One local service is the single source of truth.

### D4 — Portable runnable ZIP

Release a platform-independent ZIP of `dist/`, minimal server, needed scripts/Core, manifest and short guide; no node_modules or developer absolute paths. Node24 is required. Clean clone play path: `npm ci`, `npm run build`, `npm run start`. Native executable is deferred; Docker is optional only if separately approved and does not replace the portable artifact.

### D5 — Add only known v1.3 delta

Set manifest `contract_version` to string1.3; add `bench_cmd` and `soak_cmd`; preserve existing v1.0–v1.2 known keys/events/validators/gameplay. Keep headless command and add its export form. Do not infer official v1.0 base or call internal manifest official compliance.

### D6 — Persist keyboard/accessibility preferences

Map the nine controls to `KeyboardEvent.code`; reject conflicts, retain previous mapping, announce error and offer defaults. Preserve current versioned settings values when migrating. Persist reduced motion and large-text×1.25 options. Reduced motion suppresses camera shake and screen flash; the Ticket03 low-fuel blink is replaced in reduced mode by a static pattern/icon/text warning, and remains 1Hz in normal mode. Require≥18 CSS px at1280×720.

## Rejected alternatives

| Option | Why not selected |
|---|---|
| Browser localStorage leaderboard | CLI cannot safely/reliably read origin-specific browser profile |
| Desktop wrapper | Adds platform build/signing burden and large package without solving more than local server |
| Docker-only | Adds Docker requirement/volume handling and less direct clean-laptop launch |
| Node headless FPS | Measures Core throughput, not actual rendered browser FPS |
| Frozen Shades | Contradicts explicit normal Wander update and understates load |

## Approval assumptions and consequences

See A1–A9 in [phase-4 analysis](../notes/phase-4.md). Highest-impact choices needing owner confirmation: Shades may transition from wander after initialization; 1280×720 means app viewport/drawing buffer (OS chrome is outside); soak uses uniform 8-way directions and `nights` means requested count; Node24 local server/ZIP; ASCII-only leaderboard names; reduced-motion replaces low-fuel blink with static cue. If owner rejects an assumption, update the test oracle before implementation.

Consequences: benchmark requires a dedicated Core-only setup/update path with regression guards; renderer benchmark can be run on grading machine but local results do not certify it. RSS may be null for browser benchmark. Server introduces port/origin/file-path behavior requiring Windows/Linux tests. macOS is NOT VERIFIED until executed. The current MIT license covers implementation code only; lab characters/premise and external asset rights need separate review. Retro token/cost estimates require logs or explicit assumption labels. Official v1.0 contract compliance remains NOT VERIFIED.

## Owner approval and WS1 implementation decision

The owner explicitly approved benchmark/soak semantics A1�A4 in the WS1/WS2 authorization. The earlier prospective concerns are therefore resolved for this workstream: window target means viewport and drawing buffer; 200 Shades remain in `wander` through benchmark-only transition guards while shared AI movement runs; soak uses eight normalized headings, base seed plus zero-based Night index and one process; P95 is nearest-rank. The renderer camera starts at (30,15,0), orbits CCW over 15 seconds, and keeps the origin targeted. The official v1.0 schema and release packaging remain outside this decision and unverified.
