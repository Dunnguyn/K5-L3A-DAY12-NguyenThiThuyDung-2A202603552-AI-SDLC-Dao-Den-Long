# Phase 3 — Đèn cạn dầu: change analysis

Ngày 2026-11-21. **Analysis baseline below; current approved Core/Headless results are appended at the end.** Source of truth: [Ticket-03](../requirements/TICKET-03.md), Ticket-02 và PRD-0 ở phần không bị thay. Các lựa chọn A1–A9 trong [ADR](../decisions/ADR-phase-3-lantern-fuel.md) là **đề xuất chờ duyệt**, không phải nội dung Ticket.

## Baseline đã kiểm tra

- HEAD và peeled tag `phase-2`: `f18e4837b3abbc4ed094073238c96822040e2f6a`; annotated tag object `cb8c014da9fe749232be4ae5dfce7bcbc6c31435`.
- `phase-1`: `627ed7f92c59482bc902fba108c2936dc9481976`.
- Baseline release: unit 79/79, cross-check 7/7, 42/42 QA assertions **do Codex chạy lại**, CI SUCCESS. Không phải QA độc lập xác nhận remediation; chủ dự án đã miễn re-test.
- RTM Phase 2: 36 PASS / 4 PARTIAL / 0 FAIL / 3 NOT VERIFIED. Official v1.0 base/schema, actual GPU, macOS và nghe audio trực tiếp chưa xác minh. Ubuntu CI tự động đã chạy; không đồng nghĩa chứng nhận manual Linux/GPU.
- [Final report Phase 2](../proof/phase-2/PHASE2_FINAL_REPORT.md): campaign cuối 4.886 điểm; SwiftShader Night 3 có mẫu 29,69 FPS, native-clock remediation 30,30/30,65 FPS. Performance vẫn PARTIAL, không đặt baseline thành toàn bộ DoD PASS.
- Khi bắt đầu chỉ có `docs/requirements/TICKET-03.md` untracked; giữ nguyên file do người dùng cung cấp. Không sửa source/tests/manifest, requirements hoặc evidence cũ.

## Change Impact Matrix

Modules: C=`src/config/game.js`; G=`src/core/game.js`; W=`src/data/worlds.js`; H=`src/headless/adapter.js`; M=`game.contract.json` + `scripts/write-contract.mjs`; B=`src/browser/app.js`, `app.css`, `renderer.js`, `audio.js`; V=verification/scenario/benchmark/CI và input drivers. U=`tests/game.test.js`; HV=`tests/headless.test.js`, `validation.test.js`; R=`tests/remediation.test.js`; Q=42 tests lịch sử trong `docs/proof/phase-2/qa/independent-core.mjs`.

| Requirement ID / clause | Phase 2 actual | Phase 3 expected | Change Type | Impacted Modules | Tests to Update | New Tests | Risk |
|---|---|---|---|---|---|---|---|
| P3-F01 §1 | Lit vĩnh viễn, không fuel | Max 100; mỗi lit/relit đặt 100; decay 1/s | NEW | C,G,H,B,M | Fixture lit=true phải có fuel hợp lệ | F01–F03 | Sai số/cạn lệch tick |
| P3-F02 §1 | Chỉ nạp đèn tắt | Lit nhận `min(bag,ceil((100-fuel)/10))`, cap 100 | REPLACED | G,H,B | U lamp no-recharge; Q-LAMP | F04–F06 | Mất mote do nhầm ceil/round |
| P3-F03 §1 | Nearest unlit trong 2m, tie ID | Nearest **nhận được**, loại lit-full; giữ radius/metric cũ | MODIFIED | G,B | U lamp tie; route arrow/prompt | F05,F06 | Chọn full gần hơn che đèn khác |
| P3-F04 §1 | Không out/ever-lit | Fuel≤0: off, deposited=0, ever_lit=true, một lantern_out | NEW | G,H,B | Safe/terminal fixtures | F02,F07 | Event lặp; mất lịch sử |
| P3-F05 §1 | Mọi lần cost10 | Lần đầu 10, relight 5; cho nạp nhiều lần | MODIFIED | C,G,H,B | U partial deposit; Q-LAMP | F07,F08 | Đếm nhầm partial/relight |
| P3-F06 §2 | Mọi lit lamp bảo vệ | Active iff lit và fuel≥30; đúng30 active | REPLACED | G,B | U safe; Q-SAFE/DRIFTER fixtures | F03,A04 | Chỉ sửa safe() nhưng bỏ sót ai()/contacts() |
| P3-A01 §2 | wander theo wander_deg; chase detect12/abandon18 | wander ưu tiên lit fuel<30 gần nhất, rồi off gần nhất; chase không đổi mục tiêu | MODIFIED | G | AI fixtures, cross-check | A01,A02 | “như trước” khác implementation thực tế |
| P3-A02 §2 | Không drain | XZ≤2 tới target → drain đứng yên, +5 fuel/s/Shade | NEW | G,H,B,C | Shade enum validators, Q-DELTA | A02,A03 | Drain đặt sai bước hoặc double count |
| P3-A03 §2 | stun/recoil/spawning/wander/chase | Drain exits khi player trong6m, pulse, invalid/off target, fuel≥30 hoặc XZ>2; hết stun→wander | MODIFIED | G,H,B | Pulse/safe/order tests | A04–A07 | Đồng thời nhiều guards; pulse bonus |
| P3-W01 §3 | 300/330/360s | 240/270/300s = 14.400/16.200/18.000 ticks | REPLACED | C,G,M,V,B | Q-TUNING/RESET; cross-check; benchmark | W01 | Đo 21.600 “sim ticks” sai nghĩa mới |
| P3-W02 §3 | All-lit thắng sớm | Chỉ dawn, alive và ≥ceil(.6N):3/5,4/6,5/7 | REPLACED | G,B,H,V | U early-clear; Q-CLEAR-TIMEOUT; win drivers | W02–W05 | Route cũ dừng khi all-lit rồi cạn dầu |
| P3-W03 §3 | no_flames > clear > dawn | no_flames > dawn-survival threshold > dawn-loss; reason dawn_survived | MODIFIED | G,H,B | U priority/score, Q-DEATH-CLEAR | W04,W05,C05 | Fall short-circuit bỏ game_over |
| P3-I01 §4 | Capacity10 hardcoded | 10+2*successful_lights, cap20; relights count; reset/night; scenario prelit excluded | REPLACED | C,G,H,B | U pickup/reset; Q-PICKUP; validators | I01–I03 | Drop/theft payload carried/lost vẫn giới hạn10 |
| P3-S01 §5 | Deposit10/mote, light100 | Deposit5/mote kể cả refuel/relight; first100, relight40 | REPLACED | C,G,M,V | U lamp/same-tick exact score, Q-LAMP | S01 | Scoring hai lần trên refuel/ignite |
| P3-S02 §5 | Pulse5 mọi Shade | 15 **tổng** nếu state ngay trước hit là drain; khác5 | MODIFIED | G | Pulse fixtures/R F05 vẫn giữ payload cases | S02,A05 | Không phải 5+15; phân loại sau stun sai |
| P3-S03 §5 | Time bonus + flames | Win dawn: Σlit(50+floor(fuel))+50*flames; bỏ time bonus | REPLACED | C,G,M,B,V | U clear score; Q-RESET/END; campaign | S03,W04 | Floor từ snapshot làm tròn sẽ sai điểm |
| P3-U01 §1 | Progress ring, lit bulb | Fuel bar; low fuel<30 blink1Hz; ambient giảm khi out | NEW | B,G snapshot | Palette/material observers | U01,U03 | Render dùng rounded fuel; per-frame allocation |
| P3-U02 §6 | Volume/sensitivity persisted | Thêm bảng màu dễ phân biệt, lưu; edge/eyes cyan, warning white+⚠ | NEW | B | Settings reload/camera/audio regression | U02 | Eyes hiện đang #FFE58A; không chỉ sửa palette constant |
| P3-U03 §6 | Off cage khác màu | Phân biệt không cần màu: xẹp20%, giấy rách; low-fuel blink | NEW | B | Material/visual screenshots | U03 | Trục scale/phạm vi bật setting chưa rõ |
| P3-C01 §7 | Manifest1.1 | 1.2,8 tuning additions +3 duration replacements | MODIFIED | C,M,H | Q-TUNING; cross-check | C01 | Không tự điền base schema |
| P3-C02 §7 | progress/lit; player.light≤10 | Lamp fuel/ever_lit/relit_count; player.capacity; Shade drain | ADDITIVE+BREAKING | G,H | HV required arrays/enums/ranges | C01,C02 | Snapshot làm tròn30.0 che safe=false |
| P3-C03 §7 | Không lamp overrides; không successful_lights/target | Lamp lit/fuel/ever_lit; player.successful_lights; shade target_lantern_id; lit-without-fuel default100 | NEW | H,G | HV allowlists/null/defaults | C03 | Merge vs replace; defaults chưa công bố |
| P3-C04 §7 | lantern_lit chỉ ID; không fuel events | refuel/out/drain; lantern_lit.relight; game_over.reason | NEW+MODIFIED | G,H,B,V | R F05/Q-EVENT-VALIDATION extend | C04,C05 | amount/cadence/envelope chưa chốt |
| P3-R01 §3,§5 & inherited | Maps/physics/Drifter/Charm/controls | Giữ số liệu/map/AI không bị thay; sửa fixtures khi cần | PRESERVED | W,C,G,H,B,V | 79 tests phân loại, không skip âm thầm | R01,R02 | Vô tình đổi Drifter về drain hoặc geometry |
| P3-R02 DoD | Historical suites/evidence/tag | ADR,changelog,migration,unaffected regression,Phase3 proof mới | NEW | Docs,V,CI | Phase2 runner không dùng unchanged làm gate Phase3 | R02 | Xóa assertion chỉ để xanh |

IDs tests ở [test plan](phase-3-test-plan.md). Tất cả trạng thái Phase 3 hiện là PLANNED/NOT RUN hoặc BLOCKED-CLARIFICATION, không phải PASS.

## Phát hiện quan trọng từ source

1. Safe-zone predicate bị lặp ở `safe`, `ai` và `contacts`: phải dùng cùng điều kiện fuel≥30; chỉ sửa một nơi sẽ còn vùng an toàn giả. Drifter vẫn không bị safe-zone chặn.
2. `end()` thắng sớm và cộng time bonus; `fall()` có đường đặt lost trước khi `end()` được gọi. Contract mới cần `game_over` đúng một lần cả death-by-fall, không chỉ đổi tên reason.
3. `gameSnapshot` không có fuel/capacity; adapter whitelist chưa có lantern scenario. `progress` là field nội bộ hiện tại, còn Ticket gọi business `deposited`; chưa có chỉ thị đổi tên snapshot progress.
4. Capacity10 có ở pickups, scenario/output validators, hit.lost và drifter_steal.carried validators, HUD10 slots; phải migration đồng bộ, giữ theft≤3.
5. Wander thực tế đi theo góc, không đi tới đèn tắt. Implement fallback nearest off theo câu rõ ràng của Ticket-03; không ghi baseline “đã có”.
6. Snapshot fuel làm tròn1decimal không đủ phân biệt F60=1799 và1800; cả hai có thể hiển thị30.0, nhưng safe-zone khác nhau. Core không được suy luật từ snapshot rounded.
7. Lit100 ở **đầu tick** sẽ còn99+59/60 tại bước5: tương tác khi có mote dùng1 theo ceil. “Full không nhận” phải kiểm tra tại bước5, không tạo grace period trái pipeline.
8. Pulse radius5 và drain→chase radius6 khiến bonus drain khó đạt khi tiếp cận thông thường; scenario hoặc tương tác cùng tick có thể khác. Không tự đổi radius để làm E2E dễ hơn; xem A9.
9. Shade eyes hiện dùng halo `#FFE58A`, edge là emissive, chưa có outline riêng. Cần kiểm tra vật liệu/mesh thực cả nhánh Night1/2 và Night3 instancing, không chỉ đổi constants.

## Implementation plan và dependencies

| Thứ tự | Workstream | Module/order đề xuất | Deliverables / exit gate | Rủi ro |
|---|---|---|---|---|
| 0 | Chốt semantics | Duyệt A1–A9; chốt ledger old→new và numeric scenario policy | Không còn blocker làm oracle khác nhau | Không code theo giả định chưa duyệt |
| 1 | Core | C constants → fresh lamp/counters → fuel stage2/out → interaction/refuel → shared safe predicate → Shade target/drain → pulse score → dawn evaluation/reset | Unit theo n−1/n/n+1, score oracle và event order; G vẫn ESM không DOM/clock | Float/priority/capacity/early-terminal |
| 2 | Contract/tests | H scenario normalization/validation → snapshot → known events/game_over → M generator/manifest → CLI scenarios/replay → mapped old tests/new Phase3 suite | v1.2 known delta + malformed matrix; v1.0 vẫn NOT VERIFIED | Không đoán official envelope; CI chuyển suite rõ ràng |
| 3 | Browser | Nhận fuel/capacity → prompt/arrow/HUD/help/intro/results → fuel bars/low blink/out shape → persisted accessibility → actual material paths/instancing → existing SFX wiring | Actual-input dawn campaigns/retry; storage reload; geometry/material probes + screenshots | Outline/bars thêm draw calls; FPS Phase2 vốn PARTIAL |
| 4 | Verification/release | Feature CLI, unchanged regression, 18k full-night benchmark, native FPS≥60s/night, Ubuntu CI, real-GPU/macOS/listening nếu có; cập nhật RTM | Không giả PASS; stage release cần authorization riêng | CI đang hardcode Phase2 wrappers; không tạo Phase3 tag lượt này |

Workstream2 phụ thuộc model/semantics của1; tests của2 phải được viết cùng hoặc trước logic tương ứng của1. Workstream3 phụ thuộc snapshot/capacity1–2; verification từng phần chạy trong các workstream, không dồn đến cuối. Tạo helper nhỏ cho fuel arithmetic/safe predicate nếu cần; không viết lại Core/ECS hoặc cả renderer. Không nâng dependencies tùy tiện.

## Risks / readiness

| Risk | Mức | Kiểm soát |
|---|---|---|
| Event semantics và scenario defaults khác official grader | MAJOR | Chốt A1,A2,A4,A5,A8; tách known delta khỏi unverified base |
| Drain/out/refuel/pulse/death cùng tick | MAJOR | Stage2 aggregate, bước6 safe, bước7 pulse, bước8 AI, bước11 end; trace tests theo ADR |
| Snapshot round ảnh hưởng safe/score | MAJOR | Dùng internal fuel, chỉ round ở adapter/render text |
| Capacity làm validators từ chối output hợp lệ | MAJOR | Test bag11..20, theft carried17, fall lost20; không đổi theft amount3 |
| Legacy tests xanh nhờ bỏ assertions | MAJOR | Test migration ledger bắt buộc, giữ historical42; không skip |
| Performance/accessibility tăng geometry/layout | MAJOR | Geometry/material reuse, instancing, pool fuel bars; native counters; không hạ resolution để giả PASS |
| Điều kiện60% bị hiểu thành duy trì liên tục | MAJOR | Chỉ kiểm tra tick dawn theo Ticket; không tự thêm thời lượng giữ sáng |
| Phase2 risk acceptance bị dùng như QA sign-off Phase3 | MAJOR | Baseline lịch sử, không chuyển PASS hoặc waiver sang Phase3 |

**Verdict: BLOCKED BY UNRESOLVED REQUIREMENTS.** Hồ sơ thiết kế/test plan đã chuẩn bị; cần duyệt A1–A9 (có phương án đề xuất trong ADR) trước implementation. Thiếu v1.0 base tiếp tục giới hạn official compliance, không phải lý do tự phát minh schema. Dừng ở phân tích; không sửa production, không commit/push/tag.

## Current Core/Headless handover — 2026-11-21

The owner approved the analysis and ADR A1-A9. Core/Headless implementation and local verification are complete; the earlier analysis BLOCKED verdict is superseded for this approved scope. See [actual Core handover](../proof/phase-3/core/PHASE3_CORE_FINAL_REPORT.md).

162/162 unit tests,15/15 internal cross-checks,build,8/8 verify stages and22 actual CLI groups passed. Dawn fixture wins: Night1 3/5,606 points; Night2 4/6,775; Night3 5/7,973. These are declared scenario fixtures with valid inputs and matching CLI replay, not default campaign/browser wins. Night3 completes18,000 active ticks; separate21,600-active-update throughput stays below30s. RTM19PASS/3PARTIAL/0FAIL/3NOT VERIFIED.

READY FOR PHASE 3 BROWSER INTEGRATION. Browser visuals/accessibility/E2E/FPS,remote CI and release remain outside this work. Official v1.0 compliance remains NOT VERIFIED. Requirements/maps/lockfile,Phase1/2 evidence and both tags are byte/reference-preserved. No commit/push/tag.

## Browser integration handover — 2026-11-21

The owner subsequently authorized Browser Integration & E2E; the Core-only scope above is historical. Browser now consumes a lightweight Core projection and shared read-only interaction/safe selectors. Fuel bars, 1 Hz low blink, 20% collapsed/torn off cages, pooled drain effects, safe rings, exact first/refuel/relight prompts, dynamic capacity20 HUD, dawn thresholds/results/bonus, score feedback, audio cues and persisted distinguishable palette are integrated. Default/off/partial palette is retained; enabled Shade outline/eyes are cyan and danger UI is white with a warning symbol.

Core integration changes only expose the existing selection/cost/refuel helpers, optional current-tick snapshot events and the already-calculated dawn bonus. No rules, tuning, maps, collision or 12-step order changed. Eight projection/settings tests bring units to170. Local15 cross-checks,8 harness stages,22 CLI groups plus6 edge scenarios and Node replay passed. Night3 completes18000 ticks;21600 active-update samples measured10.736/10.545s. Browser boundary suite20/20 and a default-state keyboard campaign passed: Night1 3/5,1062 points,1 Flame; Night2 4/6,1377,2 Flames; Night3 5/7,1374,3 Flames; Bình Minh3813. Full RLE inputs/checkpoints/events/screenshots are retained. Playwright virtual time accelerates the campaign; it is not a performance measurement.

Native SwiftShader 1280x720 samples, each>=60s: Night1 37.77 FPS, Night2 38.17, Night3 34.19 and dense lit Night3 32.26. An earlier28.51FPS stress sample prompted cage/bulb/progress instancing with unchanged geometry/palette; failed/incomplete samples remain. Six restart observations had stable geometry counts, but do not prove absence of long-term leaks.

Cross-runtime diagnostic: the same default input in Core-only Chromium produces1062 vs Node1072 on Night1, while final player matches; other nights have matching scores but not bit-exact snapshots. Two replays within each runtime match, and real keyboard replay matches the separate Chromium Core output. This is a documented cross-runtime parity limitation, not evidence of official compatibility. Manual listening, real GPU, macOS and current remote CI remain NOT VERIFIED; the Phase2 QA waiver does not apply to Phase3.

RTM now23PASS/2PARTIAL/0FAIL/0NOT VERIFIED for its25 scoped rows. Remaining limitations are explicit in R01/R02 and the [browser report](../proof/phase-3/browser/PHASE3_BROWSER_REPORT.md). No commit/push/tag or release. Final-verification readiness is distinct from release acceptance.


## Final verification and release gate — 2026-11-22

Owner authorized normal commit/push and annotated phase-3 only after exact-SHA CI SUCCESS. Original MAJOR safe-boundary timer divergence was reproduced/fixed (radial projection + machine-roundoff guard;3 regressions). Final local173unit/15cross-check/8harness/22CLI/20browser-boundary checks and default keyboard campaign3759 pass. Same-input Node/Chromium gameplay parity is verified; remaining two Night3 mote coordinates differ only by<=7.11e-15m. RTM remains23PASS/2PARTIAL; performance retains below30 historical samples and hardware/platform/listening/official/independent-QA limits. Release identity and exact CI URL are in the annotated tag, created only after SUCCESS. See docs/proof/phase-3/PHASE3_FINAL_REPORT.md. Earlier handovers remain historical, not overwritten. No Phase4.
