# Browser E2E acceptance mapping

Automated actual-input browser runs; headless fixture tests are identified separately. No direct state mutation creates a win/loss. PASS applies to the stated observations, not all related systems.

| Case | Status | Observed scope / limitation | Evidence |
|---|---|---|---|
| E2E-01 | PASS | Menu and night intro | existing-browser/browser-e2e.json |
| E2E-02 | PASS | Default Night1 win:5/5,1417points; production rerun also won | browser-independent.json |
| E2E-03 | PARTIAL | Default Night2 win:6/6,1640; bridge/pads/charm exercised; no dedicated browser theft/drop oracle for every Drifter transition (Core fixtures cover FSM) | browser-independent.json; existing-browser/browser-e2e.json |
| E2E-04 | FAIL | Default Night3 win:7/7,1736; tiers/slopes/wind traversed, but wind warning hidden after dash F06; bell collision assertions are Core-scoped | browser-independent.json; independent-results-final.json |
| E2E-05 | PASS | Actual-input full campaign and Binh Minh4793; arithmetic verified | browser-independent.json; screenshots/qa-full-campaign-dawn.png |
| E2E-06 | PASS | Natural failure and correct-night retry reproduced; repeated Night3 UI restart sampled; no direct outcome mutation | existing-browser/browser-e2e.json; boundaries/boundaries.json; browser-independent.json |
| E2E-07 | PASS | Pause freezes sim/time; resume works; respawn/dash/charm/stun timer freeze separately asserted in Core | browser-independent.json; independent-results-final.json |
| E2E-08 | PASS | Keyboard settings changes persist through reload | browser-independent.json |
| E2E-09 | PASS | HUD bag/cooldown/offscreen arrow, countdown red/blink/readability | existing-browser/browser-e2e.json; boundaries/boundaries.json |
| E2E-10 | PARTIAL | Audio unlock/master gain/volume/mute/events/countdown checked programmatically; subjective listening NOT VERIFIED | browser-independent.json; boundaries/boundaries.json |
| E2E-11 | FAIL | Camera quaternion and ordinary jump/dash/fall/respawn tested; underside snap F03 and dash tail F02 remain | native-underside-analysis.json; independent-results-final.json; browser-independent.json |
| E2E-12 | FAIL | Ambient formula/environment/character constants inspected and actual campaign screenshots; partial unlit lamp material fails palette F07 | browser-independent.json; screenshots/qa-partial-charge.png |
