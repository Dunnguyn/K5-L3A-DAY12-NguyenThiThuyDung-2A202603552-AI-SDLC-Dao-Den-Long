# Independent Phase 1 QA & acceptance review

**Verdict: NOT READY TO TAG.** Ngày review 2026-11-20. Gameplay browser thắng đã được kiểm chứng; chưa thể nghiệm thu official contract hoặc nền tảng macOS/Linux. Không sửa production code, PRD-0, không commit/push/tag. Các thay đổi giới hạn ở QA/evidence và AI_USAGE.

Tổng matrix: 32 dòng (yêu cầu PRD và tiêu chí QA/harness): **PASS 24 · NOT VERIFIED 4 · PARTIAL 3 · FAIL 1**. FAIL hiện tại là validator nội bộ, không phải khẳng định vi phạm schema official chưa biết. Không phát hiện MAJOR gameplay trong phạm vi đã chạy. Hai BLOCKER là cùng một phụ thuộc nghiệm thu: chưa lấy được official v1.0.

## Requirement traceability / acceptance matrix

Đường dẫn source tính từ repository root; tên evidence ngắn tính từ thư mục QA.

| Requirement ID | Expected | Actual | Evidence | Severity | Status |
|---|---|---|---|---|---|
| BR-01 | Một màn Đêm 1 – Đảo Bến; đảo tròn; đúng 5 đèn | Đúng layout 5 đèn, mesh tròn, tên đúng | src/data/night-1.js; browser-start.png; browser-results.json | — | PASS |
| BR-02 | Di chuyển/chéo/nhảy/tiếp đất/biên | 8 hướng đúng tốc độ, không tăng tốc chéo, nhảy lại trên không bị từ chối, rời biên được | independent.mjs; test-results.json | — | PASS |
| BR-03 | Thu đom đóm; không trùng; respawn/reset | +1 light/+10; ngưỡng 1; respawn đúng tick+900, reset sạch | test-results.json; browser-results.json | — | PASS |
| BR-04 | Nạp đủ/thiếu/xa/đã sáng/đang nhảy | Chi phí 5, phạm vi 2, không trừ/cộng trùng; đủ 5 đèn trong browser | test-results.json; browser-results.json | — | PASS |
| BR-05 | Bóng Mực xuất hiện và đuổi | 4 enemy mặc định; chase giảm khoảng cách | src/core/game.js; test-results.json; browser-loss.png | — | PASS |
| BR-06 | Tiếp xúc gây mất HP | 10 damage; cooldown toàn cục 60 tick; nhiều quái một hit | test-results.json; browser-results.json | — | PASS |
| BR-07 | Tỏa sáng tiêu tài nguyên và xua quái | Chi phí 2, radius 6, cooldown 60 tick; input Q thành công | test-results.json; browser-glow.png; browser-results.json | — | PASS |
| BR-08 | Quái sợ đèn đã sáng | Đèn sáng xua, bảo vệ Mây; đèn tắt không bảo vệ | test-results.json; src/core/game.js | — | PASS |
| BR-09 | Đèn thứ 5 kích hoạt thắng | Browser thắng hợp lệ; 5/5, điểm 1330 ở route nghiệm thu | browser-win.png; browser-results.json | — | PASS |
| BR-10 | HP hết thì thua; ưu tiên tie đã chốt | HP chặn 0; lethal contact trước đèn cuối; màn thua | test-results.json; browser-loss.png; browser-results.json | — | PASS |
| BR-11 | Điểm đúng, không cộng trùng | 10/pickup +100/lamp +500/win; route thắng kiểm công thức bảo toàn light | test-results.json; browser-results.json | — | PASS |
| BR-12 | Restart sau thắng và thua | Reset HP/light/score/lamps/flies/timers/enemies; state còn tick di chuyển hợp lệ sau restart | browser-restart.png; browser-results.json; test-results.json | — | PASS |
| UI-01 | Camera 3D điều khiển được | Camera kéo chuột đổi yaw; góc thứ ba rõ ở ảnh | src/browser/main.js; browser-camera.png; browser-results.json | — | PASS |
| UI-02 | HUD/thông báo/hướng dẫn/start/end | HUD rõ HP/light/đèn/điểm; nút start/win/loss/restart hoạt động | browser-start.png; browser-win.png; browser-loss.png; browser-restart.png | — | PASS |
| ART-01 | Mây nón lá treo đèn nhỏ | Ảnh xác nhận nón hình nón và đèn nhỏ bên phải | browser-restart.png; src/browser/main.js | — | PASS |
| ART-02 | Đêm cổ tích, ánh vàng cam, nguy hiểm tím đen | Màu sắc và biển mây phù hợp; hình procedural đơn giản | browser-one-lantern.png; browser-glow.png | — | PASS |
| ART-03 | Đảo sáng dần | Ambient tăng 1.3 → 2.3, bước .2; màu nền và đèn thay đổi; chụp mốc 1 đèn và thắng | browser-results.json E2E-01 progress; src/browser/main.js | — | PASS |
| ART-04 | Không máu me/bạo lực | Quái tròn stylized, phản hồi HP bằng chữ; không thấy máu me | source review; browser screenshots | — | PASS |
| ENV-01 | Chạy laptop macOS/Linux | Có web build và workflow Ubuntu; chưa chạy OS mục tiêu | README.md; .github/workflows/verify.yml | — | NOT VERIFIED |
| DOC-01 | README chạy <=3 lệnh, điều khiển và điểm | Chạy 2 lệnh; có controls/score. Headless wrapper stdout cần chú thích (QA-03) | README.md; npm-headless.stdout.txt | MINOR | PARTIAL |
| CON-01 | game.contract theo official v1.0 | Chỉ internal-draft-1; nguồn official chưa truy cập | contract-audit.md | BLOCKER (acceptance dependency) | NOT VERIFIED |
| CON-02 | Headless theo official v1.0 | CLI nội bộ chạy đúng; không có schema official để đối chiếu | contract-audit.md; command-results.json | BLOCKER (acceptance dependency) | NOT VERIFIED |
| EVI-01 | Evidence gameplay thật | Unit + route headless + browser input win/loss/glow/reset; giữ attempts lỗi | test-results.json; command-results.json; browser-results.json | — | PASS |
| NOT-01 | Ghi giả định và AI usage minh bạch | Notes ghi draft, giả định, token ước tính không phải telemetry; QA log bổ sung | docs/notes/phase-1.md; docs/notes/AI_USAGE.md | — | PASS |
| HAR-01 | AGENTS và skill dùng thực tế | Đã đọc skill và chạy verify; 5 checks PASS | command-results.json; ../verification.json | — | PASS |
| REL-01 | Repo public/tag tương ứng code | Chưa commit/tag/push theo lệnh; public repo cá nhân chưa xác minh | command-results.json git tracked files; git status | — | NOT VERIFIED |
| ARCH-01 | Plain ESM shared core | Browser/headless import cùng core; chỉ config/layout imports trong core | src/core/game.js; src/headless/adapter.js; src/browser/main.js | — | PASS |
| ARCH-02 | Gameplay constants một config | Browser lặp 1/60, island mesh 30, HUD health 100; core glow feedback 30 tick. Nguy cơ lệch khi đổi config | src/browser/main.js; src/core/game.js; src/config/game.js | MINOR | PARTIAL |
| QA-OUT | Internal output validate đầy đủ shape được công bố | Chấp nhận enemies:[null], fireflies:[null]; không phải yêu cầu official suy diễn | test-results.json output validator rejects malformed entities | MINOR | FAIL |
| OPS-01 | Install/tests/build/verify/browser/CLI | Clean dependency npm ci + suite workspace đều exit 0; CI chưa chạy | command-results.json | — | PASS |
| LEGAL-01 | LICENSE/CREDITS; không secret/build thừa trong Git | MIT/CREDITS có mặt; git tracked chỉ 6 tài liệu; quét pattern thông dụng không match | LICENSE; CREDITS.md; command-results.json git tracked files | — | PASS |
| PERF-01 | Số đo FPS/load/errors/restart memory thực | Có đo Chromium software rendering; chưa đo GPU máy người dùng; xem performance.json | performance.json | OBSERVATION | PARTIAL |

## Phát hiện và việc giao Codex

| Priority / ID | Severity | Finding / reproduction | Required action |
|---|---|---|---|
| P0 / QA-CON | BLOCKER nghiệm thu, không phải lỗi game đã xác nhận | Official contract không truy cập được; draft không chứng minh tương thích | Lấy bản v1.0 được giảng viên công bố, lập mapping từng field/CLI/unit/error/seed và chạy harness thật. Không đổi nhãn draft để nhận PASS. |
| P1 / QA-ENV | Chưa xác minh | Chưa chạy Ubuntu/macOS thực tế; workflow chỉ được đọc | Chạy clean install/verify/browser/direct CLI trên Ubuntu hoặc macOS, lưu logs và cấu hình. Không cần triển khai Phase 2. |
| P2 / QA-01 | MINOR | validateOutput nhận enemies/fireflies chứa null; independent test FAIL | Validate entity records và invariants của schema nội bộ; giữ regression test này. Không có output CLI thực tế bị hỏng được quan sát. |
| P2 / QA-02 | MINOR | Hằng số gameplay/browser lặp ngoài config | Đọc tickRate/islandRadius/maxHealth từ config; giữ thông số thuần mỹ thuật riêng và ghi rõ. Kiểm regression parity. |
| P2 / QA-03 | MINOR | README giới thiệu npm run headless, nhưng stdout có npm banners | Hướng dẫn direct node CLI hoặc npm --silent cho máy đọc JSON; giữ raw stdout evidence. Đây không phải kết luận về official CLI. |
| P3 / QA-04 | MINOR UX | Cột đèn/quái che một phần Mây khi đứng sát; cây có thể chồng hình vòng glow | Cân nhắc camera/occlusion hoặc trình bày mesh; không tự thêm collision làm đổi luật. Ảnh browser-one-lantern.png, browser-glow.png. |
| P3 / QA-05 | OBSERVATION | Thiếu đánh giá GPU thật và cảm giác điều khiển bởi người chơi | Đo lại browser có tăng tốc GPU và chơi thử camera; không dùng SwiftShader FPS để kết luận chất lượng máy người dùng. |
| P3 / QA-06 | OBSERVATION | Chunk 550.16 KB, gzip 138.31 KB và ReadPixels stalls | Giữ warning; chỉ tối ưu nếu đo được ảnh hưởng. Screenshot stalls không tự chứng minh gameplay stall. |

## Kết quả thực thi

- Existing suite: **15/15 PASS**, 3 files; build PASS; verify **5/5 PASS**; existing browser smoke PASS.
- Independent suite: **20 PASS / 1 FAIL**. Bổ sung 8 hướng/biên thoát, jump retrigger, pickup boundary/respawn/reset, lamp boundaries/airborne/duplicate, simultaneous contacts/cooldown, sanctuary, glow radius/cooldown, fifth-lamp score/freeze/reset, lethal tie, malformed inputs/CLI, malformed output records. Fixture sửa state chỉ dùng unit edge cases; không dùng để tạo thắng browser.
- Clean npm ci PASS trong thư mục tạm mới, chỉ package + lock; các suite còn lại chạy workspace. Đây **không** phải full clean clone hoặc bằng chứng Linux/macOS. Direct CLI thắng/thua PASS, exit 0, stderr rỗng. Invalid CLI exit 1, stdout rỗng, stderr JSON.
- Existing evidence được giữ trong prior-evidence trước chạy lại verify/browser (các lệnh này tự ghi lại evidence gốc). Lần gọi npm từ spawnSync sai Windows shim được giữ command-attempt-1.json, sau đó sửa harness và chạy lại thành công.
- PRD SHA256 sau review: 11FFC0B564E8131536D022BCE56E2F1AEDB0F5A7344AAA0A306B97D1678E020B, khớp evidence cũ. Production/source và business rules giữ nguyên.

## Browser E2E và visual review

Môi trường: Windows, Chromium 159.0.8154.6, viewport 1280×800, SwiftShader. Harness nối một closure **chỉ đọc** snapshot vào response main.js trong browser; không ghi state, HP, light, vị trí hay trạng thái đèn. Điều khiển bằng keyboard/mouse Playwright, hướng đi chỉnh qua snapshot read-only. Clock pause + runFor dùng để loại thời gian chờ automation khỏi mô phỏng. Headless không tạo kết quả browser.

- **E2E-01 win and restart: PASS**
- **E2E-02 loss and restart: PASS**
- **E2E-03 successful glow: PASS**
- **camera actual drag: PASS**

Route thắng: score 1330, HP 80, light 8, tick 1801; ambient 1.5 → 1.7000000000000002 → 1.9000000000000001 → 2.1 → 2.3. Screenshot browser-win.png, browser-loss.png, browser-glow.png, browser-restart.png. Glow kiểm trước/sau light -2, flee timer, khoảng cách enemy tăng, ring và message thật. Loss ghi history HP giảm về 0; reset sau cả hai terminal kiểm HP/light/score/entities/timers.

Lần route đầu thua vì clock chưa pause và thời gian automation làm quái tiếp tục hoạt động; không gọi đó là game bất khả thắng. Lần cấu hình pauseAt quá gần thời điểm hiện tại lỗi “Cannot fast-forward to the past”. Giữ browser-attempt-1/2.json và attempt-1-images; không che các lần lỗi. Lượt sửa clock đã chứng minh thắng với luật nguyên gốc.

Đã xem trực tiếp ảnh start, 1 đèn, win, loss, glow và restart: HUD rõ, nón và đèn nhỏ hiện diện, quái tím đen/đom đóm vàng phân biệt được, đèn tắt/sáng khác nhau, không thấy máu me. Camera có góc nhìn thứ ba và kéo đổi yaw. Hòn đảo/mây đúng phong cách đơn giản. Có chồng hình gần cột/cây (QA-04), chưa thấy bằng chứng xuyên mặt đất nghiêm trọng. Không coi ảnh là thay thế đánh giá cảm giác camera bởi người chơi; chưa quay toàn cảnh mọi góc hay chụp riêng toàn đảo 5 đèn vì màn thắng che nền.

## Performance

Máy host: AMD Ryzen AI 7 H 350 w/ Radeon 860M, RAM 31.3 GiB, Windows Node v24.13.0. GPU được browser dùng: ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver). Dùng dev server local, page mới không test instrumentation/clock, RAF trong khoảng 10.19 s, idle gameplay có quái; không screenshot trong mẫu. Load 2107 ms là wall time đến nút start sẵn sàng, không phải cold production network benchmark.

- FPS trung bình **4.32**; p95 250.00 ms, p99 250.00 ms, max 250.00 ms; 43 frame >50ms.
- Console/runtime errors trong mẫu: 0. Xem warnings raw trong performance.json và browser-results.json; stalls ReadPixels ở lúc screenshot không nằm trong mẫu RAF.
- 6 chu kỳ thua/restart, CDP forced GC trước đo heap: 6255848 → 6318748 → 6376272 → 6437776 → 6459232 → 6456100 bytes; tăng 3.20% từ mẫu đầu đến cuối. Đây là mẫu ngắn, không chứng minh không có leak; heap gần plateau ở cuối mẫu đầu. Chưa đo GPU memory, renderer resources hoặc session dài.
- **Software rendering không đại diện hiệu năng GPU laptop người dùng.** Không có ngưỡng FPS PRD để tự gán FAIL. Cần đo hardware/browser mục tiêu trước chốt hiệu năng.

## Contract, giới hạn và verdict

**OFFICIAL CONTRACT NOT VERIFIED**: [contract-audit.md](contract-audit.md). Đã đọc [repo chính thức](https://github.com/VinUni-AI20k/K5-L3-LAB-Day12-AI-SDLC) và [GUIDE](https://github.com/VinUni-AI20k/K5-L3-LAB-Day12-AI-SDLC/blob/main/GUIDE.md); Lab Board không truy cập được qua web tool. Không suy diễn required fields v1.0. Seed không tồn tại ở draft vì layout không ngẫu nhiên; đây không phải kết luận official chấp nhận thiếu seed.

Linux/macOS/CI execution, official schema, GPU người dùng, full clean clone, cảm giác điều khiển người thật, session dài và public/tag artifact: **NOT VERIFIED**. Pattern scan secret thông dụng không có match; tracked Git hiện chỉ 6 tài liệu, vì vậy chưa chứng minh một release chứa toàn bộ game. Đây không phải security audit toàn diện. LICENSE/CREDITS được đọc, không có asset ngoài theo source và credits.

**NOT READY TO TAG** cho nghiệm thu đầy đủ. Gameplay chính có bằng chứng tích cực; xử lý QA-CON/QA-ENV và validator/documentation/config issues rồi chạy lại verify + QA. Không tạo tag hay push trong lượt review này. Tái chạy independent test: node docs/proof/phase-1/qa/independent.mjs (hiện exit 1 có chủ đích vì lỗi thật, không disable test); browser: node docs/proof/phase-1/qa/browser-acceptance.mjs.
