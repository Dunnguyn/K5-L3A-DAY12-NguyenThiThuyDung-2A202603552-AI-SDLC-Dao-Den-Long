# WS3 verification notes

Initial WS3 Chromium E2E found a 10px settings eyebrow despite the general 18px rule. A specific CSS override raised it to the required size. A later large-text HUD check found the pause button overlapping the right HUD; its placement was corrected and the final computed-rectangle check passed. The result form is inside the scrollable results panel; the user can reach and submit it at 1280×720. Final screenshots show the input and save button together.

The first inherited browser regression failed because the Phase 3 fixture harness searched for an exact import sequence changed by the earlier benchmark integration. The app imports were split without changing behavior. The full default-state campaign then passed with real Playwright keyboard input. A final run adds a Dawn leaderboard-form assertion and is tracked in the latest campaign evidence. No failed test was disabled.

Soak RSS was not edited or remeasured for WS3. Round 1 and Round 2 FAIL evidence remains the release blocker. The previously overwritten untracked Round 1 `memory-trace-before.json` could not be recovered; this is documented in Round 2 evidence.
