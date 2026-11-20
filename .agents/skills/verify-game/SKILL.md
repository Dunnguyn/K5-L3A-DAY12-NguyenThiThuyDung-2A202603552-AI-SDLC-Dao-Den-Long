---
name: verify-game
description: Verify this repository and record real evidence, distinguishing initialization checks from future gameplay and official contract checks.
---

Read `AGENTS.md` and the traceability table in `docs/notes/phase-1.md`.
Run `npm ci` if dependencies are absent, then `npm run verify`.
Inspect exit status and `docs/proof/phase-1/verification.json`; report each failure and fix its cause within scope, then rerun.
The suite checks shared core, internal headless scenarios, Node imports and build. Run `npm run test:browser` for actual WebGL/input screenshots. Official TC-15 compatibility remains NOT VERIFIED; internal validation passing does not change that.
After gameplay is authorized, add scenarios with input, expected, actual and command; test win, loss, resource boundaries and restart using the shared core. Add browser evidence for camera/HUD/art direction. Do not invent official headless fields while the contract remains unverified.
CI is the automatic verification gate on pushes/PRs; local verify writes evidence and exits nonzero on failure. Neither implies a configured editor hook.
