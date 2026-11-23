---
name: verify-game
description: Verify the shared game core and headless adapter across phases while preserving historical evidence and distinguishing internal schemas from official contracts.
---

Read `AGENTS.md`, the active phase's full Ticket, notes/RTM/ADR/test plan and inherited requirements. Keep PRD/Tickets and historical proof immutable. Only explicit replacements override earlier rules; additions also apply. The Phase 3 Final Verification & Release Gate is completed at annotated tag `phase-3`; it grants no Phase 4 release actions. Current authorization is a local Phase 4 checkpoint on `phase4/release-candidate` only. P4-SOAK-03 remains FAIL/BLOCKER; no speculative runner or RSS measurement changes. No push, `phase-4` tag or GitHub Release. Preserve Phase 1–3 gameplay rules and immutable history.

Historical Phase 3 release verification compared identical seeds/nights/inputs/ticks and initial states across Node/Chromium. Do not use those gates as Phase 4 implementation authorization. Do not claim independent QA or official base compatibility from Phase 3 results.

## Historical Phase 4 analysis scope (completed)

Ticket-04 is the source of truth for release v1.0.0 and Test Contract v1.3. The completed analysis established the architecture. WS1 Benchmark passed locally; WS2 Soak RSS remains FAIL and is paused by owner decision. WS3 Leaderboard/Accessibility and WS4 packaging/documentation were completed within their recorded limits. Official v1.0 base compatibility remains unverified unless its schema is supplied.

## Historical Phase 3 Browser integration verification (completed)

Those Phase 3 procedures were completed for the tagged release and are retained as historical guidance, not active Phase 4 instructions. Phase 4 proof must use new paths and actual test results.

## Historical Phase 3 Core-only scope (superseded by current Final Verification authorization above)

The analysis/Core-only instructions below describe prior Phase 3 turns. The Phase 3 release gate is completed; they are not current Phase 4 authorization. Keep all requirements/evidence/tags immutable.

Core/Headless implementation is now approved. Verify integer/tick-based fuel boundaries 0/30/100, aggregate drain and cadence, refuel eligibility/ceil/tie, first/partial/relight/out, safe-zone reactivation, dynamic capacity/scenario prelit, changed scores and dawn/no-flames precedence. Keep 12-step order: fuel+drain at 2, out immediately after 2, interaction 5, safe 6, pulse 7, AI 8, end 11. Test pause versus respawn, same-tick conflicts, payload cardinality and deterministic replay. The owner approved ADR A1–A9 and the explicit Core/Headless semantics; missing official v1.0 schema stays unverified.

Map old assertion→replaced clause→new assertion. Preserve the historical 42 QA source and evidence; create a Phase 3 suite rather than silently skipping outdated expectations. Keep unaffected physics/Drifter/Charm/CLI assertions, updating only valid fixture setup when necessary. Full Phase 3 Night 3 is 18,000 active ticks; a 21,600 input-tick run includes a terminal tail and is not 21,600 active simulation ticks. Keep the inherited <=30s headless budget; measure real browser performance with native clocks and record actual renderer. Test persisted accessibility and actual outline/eyes/silhouette/fuelbar, including instanced paths; no fake headless settings fields or fabricated browser wins. New proof goes only to docs/proof/phase-3/core/ and browser/. Do not carry the Phase 2 QA waiver into Phase 3.

## Historical Phase 2 verification procedure

For Phase 2 Core verification, cover canonical tuning/maps, terrain support and walls, exact 60 Hz/12-step order, input edges, countdown/cooldown/TTL boundaries, fall/respawn, deposit/pulse/safe zones, shade/drifter/charm/wind states, pause, terminal precedence, campaign score and retry. Add real headless CLI scenarios for gameplay behavior; scenario overrides are valid setup, never edit state mid-run to force outcomes.

Run `npm test`, `npm run test:independent`, `npm run build`, `npm run verify`, and `git diff --check`. Run CLI scenarios for each night and a full 21,600-tick worst-case benchmark with deterministic replay. Save new real inputs/outputs/logs under `docs/proof/phase-2/core/`. Inspect and retain failures; do not write into Phase 1 proof directories.

Validate the exact known v1.1 delta fields/events and strict malformed/null/type/range checks in `src/headless/adapter.js`; its internal schema is not proof of official compliance. Keep `TEST_CONTRACT_SPEC.md` draft status and v1.0 unknowns explicit.

For browser integration, run actual Chromium/Playwright against Vite at 1280×720. Test real menu/campaign/input/pause/settings and map rendering; save screenshots, action traces, console/WebGL/audio observations and performance metadata only under `docs/proof/phase-2/browser/`. Keep browser state observations read-only; do not set inventory, lanterns, timers, or terminal state to manufacture journeys. Distinguish smoke from full E2E and default-state campaign wins from scenario fixtures. Measure gameplay FPS for all nights and record browser, OS and renderer/GPU; SwiftShader is not hardware evidence. A build/CLI pass does not verify browser behavior. Linux/macOS are NOT VERIFIED unless actually run there. Do not claim external independent QA unless an external suite ran unchanged.

After relevant edits, inspect `docs/proof/phase-2/core/verification.json`, benchmark and CLI JSON, report RTM PASS/PARTIAL/FAIL/NOT VERIFIED accurately, and preserve every historical artifact.
