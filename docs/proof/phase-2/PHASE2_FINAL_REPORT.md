# Phase 2 final handover report

Recorded 2026-11-21T09:24:51.438Z. **Owner-authorized milestone release with documented limitations**, conditional on the Git gates below. This is not an independent QA acceptance of remediation and not full official contract compliance.

## Scope and quality decision

Phase 2 is implemented within the verified scope: all three canonical islands; Night 2 bridge/two launch pads/Drifter/Charm; Night 3 ramps/three tiers/tower/pad/wind; shared fixed 60Hz Core and 12-step pipeline; fireflies, partial lantern charge, safe zones, enemies, pulse, fall/respawn, scoring; full campaign/results/Bình Minh; correct-night retry; pause; HUD/camera; persistent settings and procedural audio. No Phase 3 work. PRD-0, Ticket-02, historical evidence and phase-1 are preserved.

The project owner explicitly waived an additional Independent QA Re-test and accepted the documented risks for this milestone. Codex repaired F01–F07 and reran the existing 42 independent assertions with their assertions unchanged, redirecting outputs to a new directory. **42/42 passed by Codex does not mean independent QA confirmed the fixes.** The original negative QA report remains unchanged.

| ID | Repair by Codex |
|---|---|
| F01 | Unit dash/facing direction independent of fractional run magnitude |
| F02 | Controlled motion separated from dash/pad/additive wind |
| F03 | Valid descending support crossing; bounded grounded ramp-lip contact |
| F04 | Deterministic nonzero Drifter flee fallback |
| F05 | Published v1.1 event payload validation and clear field errors |
| F06 | Dash visual lifecycle cleanup; visible subsequent wind; rendering/HUD cost reduction |
| F07 | Canonical unlit color retained during partial charge |

## Final local verification

Executor: Codex, Windows 10.0.26300, Node v24.13.0. All listed commands actually exited 0. Full logs and command arrays: [results](core/release-final/results.json).

| Check | Actual result |
|---|---|
| npm test | 79/79 PASS |
| npm run test:independent | 7/7 PASS |
| Original 42 QA assertions via node scripts/run-phase2-qa.mjs | 42 PASS / 0 FAIL, not independent acceptance |
| npm run build | PASS (nonblocking bundle-size warning retained) |
| npm run verify | 7/7 PASS; Night 1/2/3CLI exercised |
| npm run test:browser | PASS; full actual-input campaign, loss/retry, pause/settings/camera |
| npm run bench:headless | 2 x 21,600 sim ticks; 7.580s/7.476s ; deterministic; <=30s each |
| git diff --check | PASS before release documentation; repeated at staging gate |

## Browser campaign and performance

Browser 159.0.8154.6; 1280x720; renderer ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver). No direct game-state mutations were used to manufacture outcomes.

| Night | Lit lanterns | Score | Flames |
|---|---:|---:|---:|
| 1 | 5/5 | 1454 | 3 |
| 2 | 6/6 | 1629 | 3 |
| 3 | 7/7 | 1803 | 3 |

Bình Minh total **4886**. [Actual input trace, observations and scores](browser/release-final/browser-e2e.json).

| Night | Built-in FPS | Actual duration | Measurement completeness |
|---|---:|---:|---|
| night1 | 31.08 | 60.05s | complete / target30=true |
| night2 | 35.30 | 60.00s | complete / target30=true |
| night3 | 29.69 | 60.02s | complete / target30=false |

These built-in observations use the browser driver's resumed clock and RAF sampling; inspect raw completeness flags, not screenshot FPS labels. Remediation's separate native-render-timestamp measurements for Night 3 were 30.30/30.65 FPS over 60.59/60.63s, with 26 draw calls, versus retained earlier under-target samples. Software-renderer margins are narrow. These observations do not certify actual hardware-GPU performance or all platforms. No screenshots were taken during sampling.

## RTM and accepted limitations

**36 PASS / 4 PARTIAL / 0 FAIL / 3 NOT VERIFIED** retained; no status is upgraded merely because the owner waived re-test. [Release RTM](../../notes/phase-2-rtm.md), [machine RTM](core/release-final/rtm.json), [explicit risk acceptance](release-risk-acceptance.json).

The four PARTIAL rows are programmatic-versus-listening audio coverage, performance scope/margins, short lifecycle/memory sampling and UI-only versus headless DoD coverage. The three NOT VERIFIED rows are official contract, complete platform portability and actual-GPU verification. Official v1.0 base/schema/hidden regression, macOS and human listening are not verified. Ubuntu CI, after its gate succeeds, is automated coverage of this exact commit, not a manual cross-platform/GPU certificate. Risk acceptance is for the milestone only.

## Evidence and Git release identity

- [Historical Independent QA](qa/review.md) and [findings](qa/findings.json).
- [Remediation before/after and retained failed attempts](remediation/defect-resolution.md).
- [Fresh final verification](core/release-final/results.json); [unchanged QA assertions execution](core/release-final/qa42/execution.json); [benchmark](core/release-final/benchmark/benchmark-night3.json); [browser](browser/release-final/browser-e2e.json).
- [Inventory/secrets/build-artifact audit](core/release-final/workspace-audit.json). Generated bundles,node_modules,secrets and local env files are not release inputs.

Repository: [https://github.com/Dunnguyn/K5-L3A-DAY12-NguyenThiThuyDung-2A202603552-AI-SDLC-Dao-Den-Long](https://github.com/Dunnguyn/K5-L3A-DAY12-NguyenThiThuyDung-2A202603552-AI-SDLC-Dao-Den-Long). Starting commit: 9ced7a1ff98cdc4056626a9aa678e243d2d8cec6. Required release message: feat: complete phase 2 three-island campaign. Target branch: origin/main; normal push only. A remote-main change requires stopping to inspect; no force push.

The release commit is the commit containing this report, identified by **phase-2^{commit}** after the release gate completes. This avoids claiming a self-referential SHA before commit creation. The exact pushed SHA and same-SHA **Verify Phase 2** successful CI run URL are recorded in the annotated phase-2 tag message and final handover response. [Workflow](https://github.com/Dunnguyn/K5-L3A-DAY12-NguyenThiThuyDung-2A202603552-AI-SDLC-Dao-Den-Long/actions/workflows/verify.yml). At report creation, push/CI/tag are still pending; this report alone is not proof that those gates succeeded. Tag creation is authorized only after all local checks and the exact pushed commit's CI succeed and both local/remote tag names are absent.

phase-1 must remain at peeled commit 627ed7f92c59482bc902fba108c2936dc9481976. The annotated phase-2 tag is never overwritten. Final release verdict is PHASE2 RELEASED WITH DOCUMENTED LIMITATIONS only after those gates; otherwise RELEASE BLOCKED. Stop after tag success; do not implement Phase 3.

Raw proof files retain their original bytes, including CRLF, command-log trailing spaces and captured diff context. .gitattributes scopes -text/-whitespace to docs/proof/**; source/tests retain normal whitespace validation. This preserves historical evidence rather than rewriting it for a whitespace checker.
