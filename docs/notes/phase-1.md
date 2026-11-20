# Phase 1 — Phân tích và khởi tạo

## Quyết định bàn giao theo deadline

Ngày 2026-11-20, người thực hiện đã chấp nhận baseline remediation và chỉ đạo chốt Phase 1 theo thời gian Lab: **PHASE 1 DELIVERED — WITH DOCUMENTED LIMITATIONS** là trạng thái mục tiêu sau khi push main và annotated tag thành công. Quyết định này thay thế khuyến nghị NOT READY TO TAG trong báo cáo QA lịch sử, không đổi kết quả kiểm thử hoặc coi các mục NOT VERIFIED là PASS. Official contract, Linux/macOS và GPU thực vẫn chưa xác minh tại lúc chốt tài liệu. CI Ubuntu sau push phải được báo cáo theo kết quả thật, độc lập với macOS và official contract. Không thay tag nếu CI fail.

Đánh giá cuối: gameplay BR-01..12 và browser win/lose/glow/camera/restart đã có bằng chứng, route browser thắng 5/5 đèn và 1330 điểm. AI thực hiện phân tích, shared core/headless/rendering, harness và kiểm chứng; lỗi implementation đáng chú ý là validator chỉ kiểm array container, constants bị lặp và hướng dẫn npm stdout gây hiểu nhầm. Independent QA phát hiện lỗi mà suite ban đầu bỏ sót, kiểm chứng hành trình browser thật và phân biệt giới hạn môi trường với lỗi sản phẩm. Remediation bổ sung record/type/invariant validation, tập trung config, sửa hướng dẫn CLI và giảm che hình mà không đổi luật; snapshots baseline giữ nguyên.

Bài học áp dụng khi Phase 2 được công bố: đọc yêu cầu mới trước, giữ core dùng chung, viết boundary/negative tests trước khi nối adapter, kiểm stdout bằng subprocess, chạy regression cũ và lấy bằng chứng đúng môi trường. Không suy diễn bất kỳ tính năng Phase 2 nào. Token/chi phí không có telemetry; các ước tính thô trước đó trong AI_USAGE chỉ là ước tính, không dùng làm số đo billing. Tối ưu nguồn lực bằng tái dùng harness/assertions QA và không rerun browser nặng khi không thay gameplay.

Final verification ghi riêng `docs/proof/phase-1/final-handover/`, bảo toàn QA/remediation cũ. Bàn giao source, lockfile, harness, notes, license/credits và evidence; bỏ qua dependencies/build/cache/secrets. Không sửa PRD-0, không force-push, không ghi đè tag.

Trạng thái nghiệm thu mới nhất: xem [QA remediation](../proof/phase-1/remediation/report.md) và RTM `remediation/requirements.json`. Nội dung phân tích và các kết quả cũ bên dưới là lịch sử; không thay thế verdict QA mới nhất.

Remediation: root cause QA-OUT là chỉ kiểm array container; validator nay kiểm records/field/type/số hữu hạn/timer theo state nội bộ hiện có. Unit 18/18 và independent 21/21 PASS (baseline 20/21), không đổi assertions gốc. RTM sau sửa 27 PASS, 1 PARTIAL, 0 FAIL, 4 NOT VERIFIED. DOC-01/ARCH-02/QA-OUT chuyển PASS; PERF-01 còn PARTIAL; ENV-01/CON-01/CON-02/REL-01 chưa xác minh. Shared core snapshots thắng/thua khớp baseline chính xác; layout và thông số đã duyệt giữ nguyên. Browser E2E thắng/restart, thua/restart, glow và camera PASS sau sửa, input thực và closure snapshot chỉ đọc. Cột đèn mảnh/trong hơn giảm che Mây, không đổi collision/radius/core; chồng hình ở các góc sát chưa loại bỏ hoàn toàn. Những hằng số hình ảnh/CSS và layout tĩnh giữ ngoài gameplay config có chủ đích.

Nguồn official thử lại nhưng Lab Board vẫn inaccessible; giữ OFFICIAL CONTRACT NOT VERIFIED và internal-draft-1. WSL chưa cài, Docker không có, chưa push nên CI Ubuntu chưa chạy: Linux/macOS NOT VERIFIED. Chromium chọn mặc định vẫn SwiftShader: hardware performance NOT VERIFIED. Implementation sẵn sàng QA lại; release vẫn NOT READY TO TAG. Bằng chứng và root-cause/file/test-before-after ở báo cáo remediation; giữ nguyên 39 file QA gốc và hash PRD.

Mẫu performance sau sửa (software, không phải benchmark so sánh GPU): 4.16 FPS, p95 266.7ms, load 2145ms, 0 runtime/console errors. Heap 6 chu kỳ restart tăng khoảng 3.58%; mẫu ngắn chưa chứng minh có/không leak. Không điều chỉnh kiến trúc hay mỹ thuật để cải thiện con số SwiftShader. Chi tiết và cảnh báo raw: remediation/performance.json. Full browser harness đã kết thúc exit 0.

Ngày: 2026-11-20. Implementation đã được người dùng duyệt và thực hiện. Không tag. Các mục phân tích/chuẩn bị dưới đây giữ làm lịch sử quyết định; mục cập nhật implementation cuối file thay thế trạng thái chờ duyệt và hạn chế chưa code trước đó.

## Nguồn và mức độ tin cậy

- Đã đọc PRD-0 toàn bộ: nguồn yêu cầu sản phẩm; không sửa file này.
- Đã đọc TEST_CONTRACT_SPEC toàn bộ: bản DRAFT nội bộ, chỉ BR dẫn từ PRD là yêu cầu xác nhận; thông số, kỹ thuật và TC là đề xuất.
- Đã khảo sát README, GUIDE, RULES, RUBRIC, CHECKPOINTS, SUBMISSION trong workspace. Ban đầu chỉ có tài liệu, chưa có package/code; `docs/` đang untracked từ trước.
- Đối chiếu [repository chính thức](https://github.com/VinUni-AI20k/K5-L3-LAB-Day12-AI-SDLC) và [GUIDE](https://github.com/VinUni-AI20k/K5-L3-LAB-Day12-AI-SDLC/blob/main/GUIDE.md): xác nhận cần headless và nguồn yêu cầu trên Lab Board. Không thấy schema contract ở các trang đã đọc. Không coi đây là bằng chứng rằng schema không tồn tại ở nơi khác.
- Thử [Lab Board](https://claude.ai/artifact/Q1RYyv1dxjUczzCbd2ZnoW): công cụ web trả lỗi không truy cập được. Chưa kiểm chứng schema, input/output, CLI, seed, đơn vị, rounding, stdout/stderr, exit code. Không tạo `game.contract.json` cho tới khi có bản chính thức. Cần người dùng cung cấp nội dung Test Contract v1.0 trước khi chốt adapter.
- Lịch trong tài liệu local và trang online có khác ở các phase sau; không suy luận yêu cầu tương lai. Hạn thực tế theo Coach. Không áp dụng yêu cầu tag trong lượt này do người dùng yêu cầu dừng trước gameplay.

## Phạm vi nghiệp vụ xác nhận

Một game 3D Đảo Đèn Lồng, Mây giữ đèn trên đảo giữa biển mây, màn Đêm 1 – Đảo Bến; đảo tròn với đúng 5 Đèn Lồng Lớn. Di chuyển, nhảy, camera 3D; thu đom đóm thành ánh sáng, nạp đèn; Bóng Mực đuổi và chạm gây mất máu, sợ đèn; tỏa sáng mất tài nguyên để xua chúng. Thắng khi sáng tất cả đèn, thua khi hết HP, có điểm, HUD, chơi lại.

Phong cách đêm ấm áp cổ tích, vàng cam cho ánh sáng, tím đen cho nguy hiểm, đảo sáng dần. Mây đội nón lá treo đèn nhỏ. Đồ họa đơn giản, không cần chân thực, không bạo lực/máu me. Âm thanh, NPC, loại quái mới và sự kiện chỉ là sáng tạo tùy chọn; không đưa vào kế hoạch hiện tại.

Bàn giao cuối Phase 1 còn cần game hoàn chỉnh, README chạy tối đa 3 lệnh + điều khiển/điểm, contract v1.0, headless, evidence thật, notes/AI log, harness, repo public và tag. Hiện chỉ hoàn thành phần chuẩn bị; chưa tuyên bố đáp ứng các deliverable gameplay.

## Quyết định thiết kế nội bộ (giả định chờ duyệt)

Chỉ 1 màn và 5 đèn là số bắt buộc. Mọi giá trị khác dưới đây có thể đổi theo contract và playtest.

| Nhóm | Quyết định |
|---|---|
| Thế giới | Mặt phẳng XZ, Y hướng lên; bán kính 30, kẹp tâm Mây trong bán kính 29.5, không có cơ chế rơi biển |
| Sinh ban đầu | Mây (0,0,0); 5 đèn đều trên vòng bán kính 18; 4 quái vòng bán kính 25, lệch góc đèn; 40 đom đóm tại 5 cụm gần đèn, mỗi cụm 8 điểm không trùng, nằm phía trong đảo |
| Di chuyển | Mây 6 đơn vị/s, vector chéo chuẩn hóa; quái 2.5 đơn vị/s; cố định 60 tick/s; nhảy vận tốc Y=6, gravity=18 (cao 1, thời gian khoảng 0.67s), chỉ nhảy từ mặt đất |
| Va chạm | Mây bán kính 0.5, quái 0.6; khoảng chạm ngang <=1.1 và chênh Y<=1; nhặt đom đóm <=1; nạp đèn <=2 và ở mặt đất |
| HP | Ban đầu/tối đa 100; mỗi chạm hợp lệ mất 10, miễn nhiễm toàn cục 1s, nhiều quái cùng tick chỉ một lần; HP chặn ở 0 |
| Tài nguyên | Ban đầu 0; mỗi đom đóm +1 ánh sáng và +10 điểm, nhặt đúng một lần mỗi lượt sinh; không giới hạn túi |
| Chống cạn tài nguyên | Đom đóm hồi sinh tại điểm gốc sau 15s; đây là quyết định bổ sung so với draft để không khóa đường thắng khi dùng tỏa sáng quá nhiều; không hồi HP |
| Nạp đèn | Nhấn E: nạp trọn 5, không tích lũy; thiếu 5/ngoài phạm vi/đèn đã sáng thì không thay đổi; đèn không tắt; nhiều đèn hợp lệ chọn gần nhất rồi ID |
| Tỏa sáng | Nhấn Q một lần tốn 2, cooldown 1s; thiếu tài nguyên thì no-op; quái trong bán kính 6 bỏ chạy xa Mây 2s với tốc độ 4; tại cùng tọa độ chọn hướng cố định theo ID |
| Đèn xua quái | Chỉ đèn đã sáng, bán kính 5; quái bên trong chạy ra xa tâm đèn, không gây damage khi trong vùng bảo vệ; ưu tiên tránh đèn rồi flee rồi chase |
| Biên/quái | Kẹp trong đảo; flee bị biên chặn vẫn hết timer bình thường; không cần pathfinding vì mặt đảo không vật cản |
| Điểm | 10 mỗi lần nhặt hợp lệ +100 mỗi đèn mới +500 một lần khi thắng; không time bonus/điểm âm; respawn có thể farm điểm, chấp nhận ở bản tối giản, không có leaderboard |
| Kết thúc | Damage xử lý trước nạp đèn; HP=0 ưu tiên thua nếu cùng tick có thể thắp đèn cuối. Terminal đóng băng luật chơi; restart tạo state mới hoàn toàn sau thắng/thua |
| Input/browser | WASD hoặc mũi tên, Space nhảy, E nạp, Q tỏa sáng, R chơi lại ở terminal; chuột xoay camera góc nhìn thứ ba; hướng đi theo camera, adapter đổi sang vector thế giới |
| HUD | HP, ánh sáng, điểm, số đèn/5, hướng dẫn và thông báo kết thúc/restart; HUD chỉ đọc state |

Khả năng thắng theo thiết kế: 40 ánh sáng ban đầu > 25 cần thắp 5 đèn, còn 15 cho 7 lần tỏa sáng. Mây nhanh hơn quái và các điểm đều trên mặt đảo liên thông; đèn đã sáng tạo nơi trú. Hồi sinh cho phép thu lại nếu tiêu quá tay. Khả năng thua: đứng ngoài vùng đèn, bị quái chạm 10 lần hợp lệ mất 100 HP (từ hit đầu đến hit cuối ít nhất 9s). Đây là lập luận thiết kế, **chưa phải bằng chứng route thắng/thua chạy được**. Sau duyệt phải chạy route thật từ trạng thái mặc định không teleport/bất tử và playtest để xác nhận cân bằng.

## Kiến trúc kỹ thuật

ES Modules, Three.js + Vite ở browser; Node ở headless, Vitest cho core; Playwright chỉ bổ sung lúc cần browser E2E. Hiện chưa cài Playwright để tránh phụ thuộc chưa dùng.

Luồng dự kiến: browser input → action thế giới → core step → snapshot → Three.js/HUD. Headless parse/validate input chính thức → cùng action/core step → serialize output chính thức. Không có bản logic gameplay riêng cho headless.

Core dự kiến API nội bộ `createGame(config, level, seed)`, `step(state, action, dt)` và snapshot; đây không phải schema contract. Core không import DOM, Three.js, process, Date hay đồng hồ thực. Browser accumulator dùng cùng bước cố định như headless; renderer chỉ nội suy hình ảnh, không cập nhật HP/điểm. Thứ tự tick dự kiến: input/move/jump → pickup → tỏa sáng → AI/va chạm/damage → kiểm tra chết → nạp → thắng/điểm. Các timer tính bằng tick. Layout ban đầu cố định, chưa cần RNG; nếu contract cần seed thì thêm RNG truyền vào, không dùng Math.random trực tiếp.

Sau duyệt: `src/core/` chứa state/rules; một `src/config/game.js` chứa thông số, `src/data/night-1.js` chứa layout/ID; `src/browser/` nhận input, scene/HUD; `src/headless/` adapter contract khi được xác minh. Chỉ tạo module lúc cần; không ECS, event bus, backend hoặc framework plugin. Contract xuất/kiểm tra từ config thay vì sao chép constants; mọi xung đột phải được đối chiếu và cập nhật có lý do.

## Truy vết Requirement → AC → Test → Evidence

Tất cả TC bên dưới **dự kiến, chưa triển khai/chưa chạy**, giữ ID TC-01..16 của draft. Evidence ghi dạng cần thu, không phải file đã tồn tại. AC có con số tự chọn tham chiếu bảng giả định phía trên.

| Requirement/nguồn | Acceptance Criteria | Test dự kiến | Evidence cần có |
|---|---|---|---|
| BR-01 / PRD §2 | Một màn đúng tên, đảo tròn, đúng 5 đèn chưa sáng | TC-01 | state init + ảnh toàn cảnh |
| BR-02 / §2 | Đi đúng tốc độ, không tăng tốc chéo, nhảy rồi đáp, không nhảy trên không, không ra biên | TC-02 | input/expected/actual + clip |
| BR-03 / §2 | Chạm đom đóm +1 light/+10 điểm, không lặp trước respawn; sau 15s thu lại được | TC-03 | state trước/sau + boundary timer |
| BR-04 / §2 | 5 light nạp trong phạm vi: trừ 5, đèn sáng; thiếu/xa/đã sáng không trừ | TC-04,05 | assertions ở ngưỡng và ngoài ngưỡng |
| BR-05 / §1,2 | Quái giảm khoảng cách tới Mây khi không bị xua | TC-06 | trajectory nhiều tick |
| BR-06 / §1 | Chạm mất 10, không mất thêm trong 1s; hai quái không nhân damage | TC-07 | log tick/HP |
| BR-07 / §1,2 | Đủ 2 light thì trừ 2 và xua trong bán kính 6; thiếu/cooldown không tác dụng | TC-08,09 | state/timer/range boundary |
| BR-08 / §1 | Đèn sáng xua trong bán kính 5, đèn tắt không bảo vệ | TC-10 | vị trí/quái/HP + clip |
| BR-09 / §1 | 4 đèn chưa thắng, đèn thứ 5 thắng, bonus một lần; route từ mặc định thắng được | TC-11 | scenario route thật + terminal snapshot |
| BR-10 / §1 | Hit thứ 10 HP=0 và thua, không âm; chết ưu tiên khi cùng tick | TC-12 | loss scenario + tie-case |
| BR-11 / §1 | Điểm đúng tổng pickup/đèn/bonus, không cộng lặp tương tác | TC-03,11 | phép tính expected và state actual |
| BR-12 / §2 | Restart sau thắng/thua khôi phục HP/light/điểm/entities/timer, không listener trùng | TC-13 | state reset + browser replay |
| Shared core / draft, yêu cầu người dùng | Cùng config/actions cho output tái lập ở hai adapter, không khởi tạo đồ họa ở headless | TC-14,16 | so snapshot + dependency review |
| Contract / PRD §5 | JSON, CLI, schema input/output và lỗi khớp chính thức | TC-15 (chờ nguồn) | schema validator + CLI actual |
| Camera/HUD / PRD §2 | Camera 3D xoay được; HUD khớp core, restart dùng được | UI-01 | ảnh/clip và browser assertions |
| Mỹ thuật / PRD §1,3 | Mây có nón lá + đèn, biển mây, đêm cổ tích vàng cam/tím đen; đảo sáng tăng qua 0→5 đèn; không máu me | UI-02 | ảnh các mốc + review thủ công |
| Portable / PRD §4 | Web build phục vụ được trên macOS/Linux; headless không DOM | ENV-01 | CI Linux + browser run (chưa chạy) |
| README / PRD §5 | Clone sạch chạy <=3 lệnh; có điều khiển/điểm/headless | DOC-01 | clean install transcript sau gameplay |
| Notes/harness/evidence / PRD §5,6 | Có giả định, AI log và harness dùng thật; không khai PASS cho chưa làm | HAR-01 | verification.json hiện tại chỉ initialization |
| Public/tag / PRD §5 | Repo public, tag trỏ đúng code đã kiểm chứng | REL-01 | trì hoãn theo yêu cầu người dùng |
| Sáng tạo / PRD §3.3 | Nếu thêm sau này: ghi README, regression không đổi contract | TC-16 | hiện không thêm sáng tạo |

## Workspace và kế hoạch sau duyệt

Hiện có `src/core/environment.js` (probe ESM), `src/browser/main.js` (import Three.js, không render), `tests/environment.test.js`, `scripts/`, `.agents/skills/verify-game/`, `.github/workflows/verify.yml`, `docs/notes/`, `docs/proof/phase-1/`; tài liệu nguồn giữ nguyên. Headless smoke là probe hạ tầng, không phải runner contract.

1. Nhận contract chính thức, lập bảng mapping field/action/unit/error và xác nhận thông số xung đột; rồi mới tạo contract/adapter công khai.
2. Triển khai config/layout và core theo từng nhóm move/pickup/đèn → AI/damage/flee → terminal/score/restart, thêm TC tương ứng.
3. Tích hợp browser 3D/camera/input/HUD dùng core; chạy cùng scenario qua headless; thêm Playwright nếu cần tự động kiểm tra tương tác.
4. Chạy route thắng và thua mặc định, boundary tests, deterministic replay, review visual; lưu input/expected/actual/command và hình thật.
5. Clean install Linux/macOS/web, cập nhật README trong <=3 lệnh, credits/license khi có tài sản; review evidence và chỉ tag khi được cho phép.

## Harness và kiểm chứng hiện tại

AGENTS.md hướng dẫn scope và nguồn; skill verify-game phân biệt bằng chứng initialization/gameplay. `npm run verify` chạy probe Node, Vitest, Vite build và ghi timestamp, platform, Node, HEAD/working tree, hash PRD, command, exit code và stdout/stderr vào `docs/proof/phase-1/verification.json`; lỗi trả nonzero. CI Ubuntu tự chạy cùng script trên push/PR và upload evidence cả khi lỗi. Đây là gate CI, không tuyên bố có editor hook.

Kết quả thực tế xem file evidence, không sửa tay. Linux CI chưa chạy từ máy local; browser/WebGL/gameplay/contract chưa kiểm chứng. Node local v24.13.0, npm 11.6.2, Windows PowerShell. Phiên bản dependency thực tế trong package-lock.json.

Đã chạy harness ngày 2026-11-20 (07:55 UTC): headless import PASS, Vitest 1 file/2 tests PASS, Vite production build PASS. Cài Three.js 0.187.0, Vite 8.3.8, Vitest 5.1.1; npm báo 0 vulnerabilities tại lần install, không phải đánh giá bảo mật toàn diện. Validator skill-creator báo `Skill is valid!`; `git diff --check` exit 0. PRD SHA256: `11ffc0b564e8131536d022bce56e2f1aedb0f5a7344aaa0a306b97d1678e020b`. Không ghi sửa PRD. Không có tag trong kết quả `git tag --list`.

Lỗi môi trường: sandbox helper không tạo được tiến trình (`setup refresh had errors`), cả exec và Node REPL bị ảnh hưởng; sau khi được cho phép chạy ngoài sandbox, install/verify chạy thành công. Chưa chạy clean clone, browser smoke hoặc CI Linux; không suy ra các kết quả đó từ build local.

## Cần xác nhận

- Nội dung chính thức Test Contract v1.0: schema, lệnh, dữ liệu, đơn vị, seed/tick, thứ tự, rounding và lỗi. Đây là điểm chặn chốt giao diện headless, không chặn phân tích/hạ tầng.
- Duyệt các giả định: đom đóm hồi sinh, nạp trọn gói, vùng đèn bảo vệ, ưu tiên thua và điểm có thể farm.
- Duyệt kế hoạch trước gameplay. Tính thắng/thua mới có lập luận, cần test/playtest sau khi code.

Retro chuẩn bị: đọc UTF-8 rõ ràng sau lần hiển thị sai encoding; chia lần đọc để tránh output bị cắt. Harness giữ ranh giới smoke/gameplay và không tạo schema giả. Chưa có bằng chứng game hoàn chỉnh.

## Cập nhật implementation sau phê duyệt

Người dùng đã duyệt cấu hình và cho phép xây schema nội bộ khi chưa có official contract. Vì vậy rào cản tạo adapter/contract ở phân tích ban đầu được thay bằng `internal-draft-1`; không thay đổi tuyên bố NOT VERIFIED đối với official v1.0. `src/headless/adapter.js` tách validation/mapping khỏi core; schema nội bộ được mô tả trong game.contract.json sinh từ config, không gắn nhãn official. Layout cố định không dùng seed ngẫu nhiên.

Đã triển khai config/layout, shared core và toàn bộ luật; browser procedural 3D, camera kéo chuột, HUD/start/end/restart tiếng Việt. Cảnh có đảo bay, đường đi, cây/cỏ/hoa, mây, trăng/sao; Mây chibi nón lá/đèn nhỏ và chân chuyển động; Bóng Mực mắt sáng; hiệu ứng vòng glow; đèn và ambient tăng sáng. Cây/cỏ/đường không va chạm để tránh mắc kẹt. Không thêm âm thanh/NPC/phase khác.

Edge cases: jump/action button chỉ kích hoạt tick đầu mỗi action headless; browser theo keydown không lặp. Thiếu resource/out of range/no-op không trừ hoặc cộng điểm. Các timer dùng tick nguyên. Restart chỉ sau terminal, trả state mặc định; key/pressed được xóa. Nạp yêu cầu đứng đất; nhặt và damage yêu cầu Y<=1. Cooldown tính từ tick hit/glow thực tế. Safe zone kiểm tra vị trí Mây trước damage. Damage trước nạp nên chết ưu tiên thua. Enemy flee ở cùng tọa độ chọn hướng từ ID. Core đóng băng sau terminal, rendering vẫn animate mỹ thuật. Respawn cho phép farm điểm, không giới hạn thời gian.

| Nhóm AC | Kết quả hiện tại | Evidence |
|---|---|---|
| TC-01..13 gameplay rules/score/restart | PASS kiểm thử core | tests/game.test.js; verification.json |
| TC-11/12 thắng/thua từ default world | PASS qua shared headless, không teleport/config override | win/loss.input.json + expected.json + actual.json |
| TC-14 deterministic | PASS chạy lặp scenario và deepEqual | scripts/scenarios.mjs; tests/headless.test.js |
| TC-15 input/output/CLI nội bộ | PASS; official contract NOT VERIFIED | tests/headless.test.js; game.contract.json |
| TC-16 regression core/render separation | PASS tests/build; parity thiết kế cùng module | verification.json; imports browser/headless |
| UI-01/02 | Xem browser.json và screenshots; hành trình thắng browser đầy đủ chưa kiểm chứng | browser evidence riêng |
| ENV-01 | Windows local PASS; Linux/macOS NOT VERIFIED, CI cấu hình Ubuntu | verification.json; workflow |
| DOC/HAR | README, harness có chạy thật | verify-game skill, scripts và evidence |
| REL | Không tag/push theo yêu cầu | git status/tag list |

Unit tests có fixture điều chỉnh state cho edge case; route integration không chỉnh state và chỉ đưa actions vào core. Scenario generator tự dẫn đường qua đom đóm/đèn để thu hành trình thắng; không được dùng nó thay logic trong runner. Đứng yên 3600 ticks để kiểm tra thua. Input/actual/expected đều do script tạo khi assert đạt, không sửa tay.

Hạn chế: headless output validation là kiểm tra invariant/status phiên bản nội bộ, không validator schema official. Input giới hạn 10000 actions, 360000 ticks, vectors [-1,1], button boolean, unknown key bị từ chối. Chuẩn CLI chỉ hỗ trợ file JSON; success stdout JSON, invalid stderr JSON exit 1. Chưa test tải lớn, accessibility, mobile/touch, clean clone hay nhiều GPU. Chunk Three.js vượt ngưỡng khuyến nghị 500KB của Vite, chưa cần tách vì game chỉ một màn. Chưa có số đo FPS độc lập.

Browser thực tế: `npm run test:browser` PASS trên Chromium headless/WebGL2 (SwiftShader được phép); có start, movement/jump key events, E/Q feedback, kéo camera, thua theo thời gian thật và nút restart reset HUD. Không console error/page exception. Có GPU ReadPixels stall warnings khi screenshot. Đã xem ảnh `browser-game.png`: nhân vật, đèn, Bóng Mực, cây, mặt đảo và HUD render được. Chưa xác nhận route thắng trọn vẹn bằng browser, hình 0→5 đèn và tốc độ camera/movement qua cảm nhận người chơi; UI-01/02 do đó PARTIAL, cần QA độc lập. Browser screenshots nằm cạnh browser.json; không dùng ảnh để thay thế test logic.

Regression cuối: `npm test` 3 files/15 tests PASS; `npm run build` PASS (chunk warning giữ nguyên); `npm run verify` PASS cả 5 checks, gồm scenarios, import, tests/build; `git diff --check` exit 0. Hash PRD khớp mốc chuẩn bị. Git: README modified, các source/harness/docs/package/contract mới untracked; chưa commit/push, tag list trống. Verdict triển khai: READY FOR INDEPENDENT QA, không đồng nghĩa official-contract-ready hay đủ điều kiện tag/nộp. Cần QA browser thắng/visual, nền tảng mục tiêu và đối chiếu contract trước bàn giao chính thức.
