# Phase 2 independent QA acceptance review

**Verdict: NOT READY TO TAG.** Existing green suites and a complete campaign were reproduced, but independent tests expose4 MAJOR and3 MINOR issues. No production fixes, requirement edits, commits, pushes or tag operations were performed. This review targets the dirty working-tree snapshot recorded in workspace-before.json, not HEAD9ced7a1 alone.

Existing tests after actual Windows clean install:44/44; delivery cross-check7/7; harness7/7; build and production browser E2E PASS. Independent tests: **36 PASS / 6 FAIL** across42 cases. The six failures represent five Core/validator root causes; two additional browser findings give seven unique product findings.

RTM: **30 PASS / 3 PARTIAL / 7 FAIL / 3 NOT VERIFIED**. See rtm.md for complete Expected/Actual/Test/Evidence/Status/Severity mapping.

| ID | Severity | Finding | Actual | Prioritized correction |
|---|---|---|---|---|
| F01 | MAJOR | Dash direction is not normalized for fractional inputs or remembered facing | moveX=0.5 travels 1.4m in 12 ticks (7m/s), including idle dash after partial movement; expected 2.8m | P1: normalize nonzero dash/facing direction separately from analogue run magnitude; retain speed/duration/cooldown constants |
| F02 | MAJOR | Unlisted post-dash velocity tail exceeds normal movement/stop requirement | After12 dash ticks and6 released-input ticks, speed is8m/s; first normal tick is13m/s | P1: define/reset controlled run velocity at dash completion and test return-to-run/stop; also regress pad landing without changing standard tuning |
| F03 | MAJOR | Returning below island surface teleports the player upward through terrain | Default-input Core trajectory tick425 jumps fromY=-1.2833 atX40.05 toY0 atX39.95. Native browser observations also jump fromY=-1.8056 to0 without jump/respawn | P1: use previous-to-current vertical crossing/contact direction when choosing support; cover outer boundaries and raised-platform undersides |
| F04 | MINOR | Coincident chasing Drifter does not move after pulse changes it to flee | D1 remains(0,0,0) for60ticks after pulse, instead of moving7m | P2: choose a stable unit fallback flee direction at coincidence, as the contact path already does |
| F05 | MINOR | Output validator accepts malformed known-v1.1 event payloads | Accepts charm_picked with no payload, negative theft/string carried, night4 and fall hit without lost | P2: validate the published per-event fields/types/ranges; keep unknown v1.0 base explicitly unverified |
| F06 | MAJOR | Dash FX class permanently hides later wind-warning/gust feedback | Night3 tick1705: class="dash warning", opacity0, animation="dashfx" while toast says wind warning. Dash class is added and never expired; forwards animation wins over wind/pulse/hurt | P1: expire/reset dash class or separate independently composited FX layers; regress dash -> warning/gust/pulse/hurt |
| F07 | MINOR | Partially charged but unlit lantern violates canonical unlit base color | Actual renderer material for L2 at3/10 is#FFE58A. Per-channel absolute differences are164,134,28, exceeding tolerance | P2: retain canonical unlit cage color and show partial charge through the existing progress indicator |

Source locations and reproductions are in findings.json. Core negative assertions remain failing; no expected numbers were adjusted to make production pass. TTL attempt1 was contaminated by later player death; attempt2 selected a live array that gained random spawns. Both code/results/logs are retained. Final TTL assertions use a fresh isolated fixture and a fixed dropped-only reference set, retaining the same479/480 expectations. The initial native warp detector examined only within-loop pairs and missed an inter-loop transition; analysis of all recorded observations recovers the upward jump. Original raw data/false pair detector flag remain unchanged.

Browser evidence categories:

- Unchanged production build/actual-input E2E rerun: PASS, campaign score **4929**. Screenshots/inputs/trace are under existing-browser/. FPS was explicitly skipped in this regression command and measured independently instead.
- Separate instrumented QA build: read-only native clocks/render counts/camera/material/master-gain observations; production Core/input/tuning unchanged. Navigation utility from the delivery was audited and reused only to produce legal input. Independent oracles checked values and exposed F06/F07. Full campaign **4793**, night scores **1417 / 1640 / 1736**; Binh Minh and arithmetic sum confirmed.
- Automated browser checks include menu/intro, persisted range keyboard settings, actual camera quaternion changes, pause freeze/resume, real master gain/mute/autoplay, partial charging, all-night wins, bridge/charm/drifter/tier/gust observations. Existing E2E additionally reran both-island pad/landing, natural fall loss and correct-night retry with previous score retained. Boundary rerun confirmed red/blinking00:30,10slots/offscreen arrow, readable countdown, ten cues and natural dawn loss.
- Screenshot visual inspection covered partial lantern/hint, invisible wind feedback and the actual Binh Minh screen. This is not a claim of human manual full-game play. Subjective audio quality is NOT VERIFIED; WebAudio graph/event checks are not listening. Footer FPS in virtual-clock screenshots is not a benchmark.

Performance: Windows 10.0.26300, Nodev24.13.0, Chromium159.0.8154.6, viewport1280x720, renderer **ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver)**. Original native clocks/RAF were captured before clock installation; Node wall duration and render-call timestamps were used. No screenshots, explicit clock advances, GC or other test workloads occurred during valid samples. N1 supplemental sample did not install a Playwright clock at all. N2/N3 used the test clock resumed in real time; report this measurement context rather than claiming an untouched-hardware certificate.

| Night / iteration | seconds | actual render FPS | native RAF FPS | mean frame ms | p95 frame ms |
|---|---:|---:|---:|---:|---:|
| 1 / native-safe-zone | 60.59 | 34.81 | 34.81 | 28.73 | 33.80 |
| 2 / 1 | 60.57 | 37.11 | 43.44 | 26.94 | 49.70 |
| 3 / 1 | 60.59 | 32.15 | 38.29 | 31.09 | 63.50 |
| 3 / 2 | 60.54 | 31.44 | 37.45 | 31.80 | 66.40 |
| 3 / 3 | 60.62 | 32.37 | 38.04 | 30.89 | 63.60 |

All valid software-renderer samples met30 average FPS. First Night1 circle sample ended after47.86s when the player lost; it is retained as invalid and excluded, not converted into a60s PASS. N1 supplemental scene used one lamp earned through actual collection/deposit and movement inside its safe zone. Night3 repeated3 times; observed frame-time tails still warrant usability review. Six UI restarts with forced GC had geometry24 every cycle and heap5614756 -> 5801904 bytes (~3.33%). That short trend is not proof of absence or presence of leaks. Runtime errors:0; console warnings are screenshot ReadPixels GPU stalls, not shader compile failures.

Headless high-load benchmark: two actual21,600-tick replays, **5.409 / 5.308 seconds**, identical output, real dawn loss at21600 and pure JSON stdout. The documented initial invulnerability/base-center/enemy-cap scenario is a benchmark fixture, not default browser victory.

Cross-platform: Windows npm ci --offline succeeded using the repaired lockfile. Linux/macOS and current remote Ubuntu CI were not executed; WSL capability probe did not produce a Linux run, Docker binary was not available. No large runtime/tool installation was attempted. GPU evidence is SwiftShader only. Official base schema/hidden harness remain unavailable after fresh source checks: see contract-audit.md.

Coverage assessment: existing44 tests correctly cover many cardinal movement/timer/map rules, but omit fractional/remembered-facing dash, post-dash release, below-island re-entry, coincident Drifter flee, required event payload validation and runtime FX/color interactions. Constants-only palette checks cannot prove actual state-dependent materials. The delivery camera check merely sent drag input; QA added an actual quaternion assertion. All new simulation features now have actual CLI fixtures under scenarios/; UI-only settings/audio/HUD/palette do not have headless CLI equivalents and remain explicitly browser-scoped.

Git/preservation: HEAD9ced7a1ff98cdc4056626a9aa678e243d2d8cec6; phase-1627ed7f92c59482bc902fba108c2936dc9481976; main and the local origin/main tracking ref currently match (behind0/ahead0), differing from the reported ahead1 baseline; there are the same pre-existing21 tracked modifications and original untracked delivery work. **392 pre-QA files match their original SHA256**, tracked diff identical. Only QA artifacts were added; generated node_modules/dist are excluded from source preservation. Current Git status is in workspace-after.json. A tag on current HEAD would not include the uncommitted delivery fixes/helpers.

Before acceptance: resolve P1 findings F01/F02/F03/F06, then P2 F04/F05/F07; rerun these unchanged independent assertions and production E2E at the intended committed candidate. Obtain the official schema/harness and actual target-platform/hardware evidence for official/release certification. This QA does not authorize a tag and does not claim official contract compliance.

Commit audit:9ced7a1 changes51files (+2456/-244), adding the shared three-world Core/data, browser app/renderer/audio/CSS, headless adapter/manifest/scripts, tests, requirements/notes and early evidence. The current delivery also depends on21 modified tracked files and untracked recovery helpers/evidence outside HEAD; therefore HEAD alone does not preserve the reviewed completed candidate. Requirements and historical evidence are unchanged during this QA, as verified by baseline hashes. See git-final-check.json for the full commit stat and actual behind0/ahead0 tracking-ref result. No fetch/push was performed.

E2E-01 through E2E-12 are individually mapped in browser-e2e-review.md/json, including the partial Drifter browser oracle and audio listening limitation. git diff --check exited0; line-ending warnings are preserved in git-final-check.json.
