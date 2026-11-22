# Phase 3 changelog - UNRELEASED, specification only

2026-11-21: prepared change analysis, ADR, RTM, acceptance criteria and migration plan from Ticket-03. **The original analysis entry is retained below; current Core implementation status is appended at the end.** These are planned changes, not delivered functionality.

## Planned breaking changes

| Area | Phase 2 expectation replaced | Phase 3 migration |
|---|---|---|
| Lantern lifecycle | Permanent light; lit interaction ignored | Fuel decay/drain/out; refuel; ever_lit/relit_count; first cost 10, relight 5; out clears partial deposit |
| Safe zones | Every lit lamp active | Active only at raw fuel>=30; reactivation evicts Shades |
| Shade FSM | Five states; wander by angle | Add drain; weak/off targets and exit guards; Drifter enum unchanged |
| Duration | 300/330/360 seconds | 240/270/300; 14,400/16,200/18,000 active ticks |
| Victory | Immediate all-lit; victory/all_lit | Dawn alive with ceil(60%) currently lit; dawn_survived; no_flames precedence |
| Capacity | Maximum 10 | 10+2 per successful ignition, capped 20; relights count, scenario pre-lit excluded; reset each night |
| Score | Deposit 10, light 100, pulse 5, time bonus | Deposit 5, first 100, relight 40, draining pulse total 15; dawn fuel/lamp/flame bonus; no time bonus |
| Contract | v1.1 records/events | v1.2 tuning, snapshot/scenario additions, drain enum and fuel events; relight/reason payload changes |
| Event consumers | Old payload expectations | Versioned streams; approved amount/cadence semantics; no duplicate audio consumption |
| Visual/settings | Existing lamp meshes and settings | Fuel bar, 1 Hz low blink, collapsed/torn off shape, persisted distinguishable palette and warning icon |
| Tests/tooling | Early-win routes; historical 42 assertions; 21,600 active-tick benchmark | Explicit migration ledger, new Phase 3 suite, dawn/refuel routes and 18,000 active-tick benchmark |

## Unchanged inheritance

Preserve canonical maps and positions, 60 Hz, the 12-step pipeline except specified fuel integration in step 2, movement/jump/dash/pad/wind tuning, pickup ranges, normal pulse cost/range/cooldown/stun/push, inherited Shade spawn/detect/abandon/contact rules, Drifter/Charm, Flames/fall/respawn/invulnerability, retry and campaign score aggregation, camera and existing settings. Fixtures touching replaced rules still need mapped updates.

## Pending decisions and preservation

[ADR A1-A9](../decisions/ADR-phase-3-lantern-fuel.md) distinguish proposals from official requirements. They cover refuel amount, drain cadence/order, fuel representation/defaults, lamp overrides, target fallback, accessibility details, local event mapping and the drain-chase/pulse design tension.

v1.1 inputs may remain syntactically usable while behavior changes. No implicit legacy mode or invented official v1.0 schema. Accessibility settings do not become headless fields.

Keep requirements, historical proof and both released tags unchanged. Phase 2's independent re-test waiver does not waive Phase 3 QA. Future evidence belongs under docs/proof/phase-3/ with actual commands, results and retained failures. No commit/push/tag in this analysis.

## Core/Headless implementation completed; browser pending

Implemented fuel/out/relight/refuel, safe threshold, drain FSM and cadence, dynamic inventory, new score/dawn outcome, v1.2 known-delta adapter/manifest, scenario validation and mapped regressions. Private time-bonus tuning was removed. The local CLI input budget remains21,600; full Night3 has18,000 active ticks. Position normalization copies only x/y/z to preserve the old scenario boundary.

162 unit,15 internal cross-checks,22 CLI groups and8 verify stages passed. All three declared dawn scenario input replays won. See [handover](../proof/phase-3/core/PHASE3_CORE_FINAL_REPORT.md) for exact evidence and benchmark. Planned browser changes in the earlier table are not implemented. No release/tag/commit/push.

## Browser integration delivered

Supersedes the previous browser-pending entry: browser fuel/out/refuel/relight/drain/safe visuals, dynamic HUD, dawn flow/score feedback, audio cues and persisted accessibility are implemented on shared Core. Minimal read-only selectors/current-tick projection and Core-computed dawn bonus replace browser access to internal mutable entities. Contract's default snapshot shape remains unchanged. Lantern/Shard instancing, pooled bars/drain lines and unique-resource cleanup reduce rendering cost without changing maps/tuning/palette.

Breaking browser migration: goal/help/intro/results now use dawn ratios240/270/300s; first/relight costs10/5, refuel prompts replace the old lit exclusion, slots grow to20, and time-bonus text is removed. Existing storage key gains optional `distinguishable:false`; old volume/sensitivity settings remain compatible. `npm run test:browser` selects the new Phase3 runner; Phase2 runner/evidence remain intact. Eight new projection tests; no obsolete assertion is silently skipped. Default campaign3813 and native software FPS are documented in the browser report. Cross-runtime exact replay, official schema, current CI/platform/hardware/listening limitations remain explicit. No commit/push/tag.


## Final release correction — safe boundary

Fixed a release-blocking one-ULP safe projection causing repeated evacuation timer resets and cross-runtime fuel/event/score differences. Replaced atan2→trig projection with radial normalization and machine-roundoff boundary classification; six-metre radius,30ticks and pipeline unchanged. Three new regression tests, none deleted/skipped/softened. Revalidated default campaign inputs; old journeys remain history. Migrated GitHub workflow to Verify Phase3, preserving replaced-test mapping and historical42 QA evidence. Known1.2 schema/validators unchanged; no dependency upgrades. See final report for actual release gates/limitations.
