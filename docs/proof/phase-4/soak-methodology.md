# Phase 4 Soak Methodology — WS1

Command: `npm run soak -- --seed 7 --nights 10 --out docs/proof/phase-4/soak.json`. The runner imports Shared Core and executes all Nights sequentially in one Node process. Night order and seeds are recorded in [soak.json.trace.json](soak.json.trace.json), including one PID, actual result, tick count, and diagnostic per-Night RSS. Direction changes every30 ticks among eight normalized headings; each tick draws four seeded Bernoulli button levels at .05/.03/.02/.10 and passes them to Core unchanged for Core-owned rising-edge behavior.

RSS is `process.memoryUsage().rss / 1024 / 1024` MiB. Start is measured after the first game state has been created and before its first tick. End is sampled after the final Night result, reset, and release of retained event-history arrays. No heapUsed, child processes, or forced garbage collection is used. Duration uses `process.hrtime.bigint()`.

Actual ten-Night result: crashes0, ten actual outcomes (all lost), one PID, 4.26 s; RSS rose from 41.37 MiB to 63.00 MiB. Required ceiling is 49.64 MiB (1.2× start), so the memory-growth acceptance **FAILS**. Releasing Night state/event references and yielding naturally between Nights did not bring RSS under the limit. No passing claim is made; investigate allocator/retained allocations before WS1 exit.
