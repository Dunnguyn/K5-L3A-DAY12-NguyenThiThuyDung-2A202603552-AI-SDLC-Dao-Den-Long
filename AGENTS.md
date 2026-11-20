# Đảo Đèn Lồng

- Read `docs/notes/phase-1.md` and PRD-0 before changes. PRD-0 is immutable.
- Current authorization: final Phase 1 documentation/verification and Git release on main, commit/push and annotated phase-1 tag approved. No Phase 2 or further feature/refactor work; never overwrite/move an existing tag or force-push.
- `TEST_CONTRACT_SPEC.md` is a local DRAFT. Internal schema/CLI authorized; never claim official compatibility. Keep mapping isolated in headless adapter.
- Future core: plain ESM, no DOM/Three.js/clock dependencies. Browser and headless share the same rules.
- Keep gameplay constants in one config; world layout in data; no general engine/plugin framework.
- Use `.agents/skills/verify-game/SKILL.md` for verification. Run `npm run verify` after relevant edits.
- Preserve failures and record actual evidence. Initialization PASS never means gameplay PASS.
- No secrets, fake outputs, scope expansion, disabled failing tests, or unrequested tags/pushes.
- Update AI usage and traceability honestly; no fabricated token measurements.
