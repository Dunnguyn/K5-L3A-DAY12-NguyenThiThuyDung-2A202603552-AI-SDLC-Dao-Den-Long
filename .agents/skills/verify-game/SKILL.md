---
name: verify-game
description: Verify the shared game core and headless adapter across phases while preserving historical evidence and distinguishing internal schemas from official contracts.
---

Read `AGENTS.md`, Phase 2 notes/RTM and the complete Ticket-02. Keep PRD, Ticket and historical Phase 1 proof immutable. Ticket clauses replace Phase 1 rules only where explicit.

For Phase 2 Core verification, cover canonical tuning/maps, terrain support and walls, exact 60 Hz/12-step order, input edges, countdown/cooldown/TTL boundaries, fall/respawn, deposit/pulse/safe zones, shade/drifter/charm/wind states, pause, terminal precedence, campaign score and retry. Add real headless CLI scenarios for gameplay behavior; scenario overrides are valid setup, never edit state mid-run to force outcomes.

Run `npm test`, `npm run test:independent`, `npm run build`, `npm run verify`, and `git diff --check`. Run CLI scenarios for each night and a full 21,600-tick worst-case benchmark with deterministic replay. Save new real inputs/outputs/logs under `docs/proof/phase-2/core/`. Inspect and retain failures; do not write into Phase 1 proof directories.

Validate the exact known v1.1 delta fields/events and strict malformed/null/type/range checks in `src/headless/adapter.js`; its internal schema is not proof of official compliance. Keep `TEST_CONTRACT_SPEC.md` draft status and v1.0 unknowns explicit.

For browser integration, run actual Chromium/Playwright against Vite at 1280×720. Test real menu/campaign/input/pause/settings and map rendering; save screenshots, action traces, console/WebGL/audio observations and performance metadata only under `docs/proof/phase-2/browser/`. Keep browser state observations read-only; do not set inventory, lanterns, timers, or terminal state to manufacture journeys. Distinguish smoke from full E2E and default-state campaign wins from scenario fixtures. Measure gameplay FPS for all nights and record browser, OS and renderer/GPU; SwiftShader is not hardware evidence. A build/CLI pass does not verify browser behavior. Linux/macOS are NOT VERIFIED unless actually run there. Do not claim external independent QA unless an external suite ran unchanged.

After relevant edits, inspect `docs/proof/phase-2/core/verification.json`, benchmark and CLI JSON, report RTM PASS/PARTIAL/FAIL/NOT VERIFIED accurately, and preserve every historical artifact.
