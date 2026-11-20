# Independent Phase 1 headless audit

**OFFICIAL CONTRACT NOT VERIFIED.** Review date: 2026-11-20. The [official repository](https://github.com/VinUni-AI20k/K5-L3-LAB-Day12-AI-SDLC) and [GUIDE §8](https://github.com/VinUni-AI20k/K5-L3-LAB-Day12-AI-SDLC/blob/main/GUIDE.md) require headless compliance and point to the Lab Board. Accessing [Lab Board](https://claude.ai/artifact/Q1RYyv1dxjUczzCbd2ZnoW) through the web tool returned “not accessible”. No official schema was obtained. This is an acceptance dependency, not proof the implementation violates an unseen schema.

| Item | Internal implementation / observed evidence | Result |
|---|---|---|
| Manifest | `game.contract.json` explicitly labels internal-draft-1 and official NOT VERIFIED; generated from config | PASS internal; official NOT VERIFIED |
| CLI | `node scripts/headless.mjs scenario.json`; exactly one file argument | PASS internal |
| Input | Version/actions only; unknown keys rejected; <=10000 actions, <=360000 ticks; integer positive ticks; finite movement [-1,1]; boolean buttons | PASS independent malformed-input matrix |
| Success | Exit 0, single JSON stdout, empty stderr; default win/loss replayed | PASS, `command-results.json` |
| Errors | Missing args/file, extra args, malformed version/actions: exit 1, empty stdout, JSON error stderr | PASS, `test-results.json` |
| Output | Full state wrapper; finite player fields, status, tick, five lamps checked | PARTIAL: enemy/firefly contents not checked |
| Validator defect | `validateOutput` accepts `enemies:[null]` and `fireflies:[null]`; independent assertion fails | MINOR QA-01; no actual runner corruption observed |
| Determinism | Fixed layout, no RNG or seed support. Identical action streams produce identical state | PASS internal; official seed requirements unknown |
| Time | Core increments integer ticks; browser accumulator and headless both call same step at 60 Hz | PASS source + tests |
| Buttons | First tick per headless action; browser keydown edge | PASS internal; held input is not repeated button presses |
| Core | Only config/layout imports; no DOM/Three.js/clock/process dependency | PASS source review |
| Mapping isolation | Parsing/validation in src/headless/adapter.js; rendering/input in src/browser/main.js | PASS source review |
| Default win/loss | CLI consumes generated real movement win route and idle loss; no fixture overrides | PASS internal, command-results.json |
| Official field-by-field mapping | Required fields, enums, units, rounding, seed, CLI, errors unavailable | NOT VERIFIED for every official field; none invented |

Fix QA-01 by documenting the internal output shape and validating entity records and relevant invariants. Keep this separate from eventual official contract mapping. Obtain official v1.0, then compare every field and run its actual harness before release. Do not relabel the draft to obtain acceptance.

`npm run headless -- ...` includes npm banner text in stdout; README's JSON-only statement applies to the direct Node CLI. Use the direct command for machine consumption or `npm --silent run headless -- ...`. Official invocation requirements remain unknown.
