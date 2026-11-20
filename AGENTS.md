# Đảo Đèn Lồng

- Đọc `docs/requirements/PRD-0.md`, toàn bộ `docs/requirements/TICKET-02.md`, `docs/requirements/TEST_CONTRACT_SPEC.md`, `docs/notes/phase-2.md` và skill verify-game trước khi sửa Phase 2. Ticket-02 thay luật Phase 1 chỉ tại các clause được nêu; giữ nguyên requirement/evidence gốc.
- Authorization hiện tại: Phase 2 Core/World/Physics/Headless và Browser Integration/Product Completion theo Ticket-02. Hoàn thiện 3 đêm, campaign UI/HUD, audio/settings, E2E, performance và evidence browser. Không làm Ticket-03, commit, push hoặc tag Phase 2. Không sửa/di chuyển tag `phase-1`.
- Dùng đúng tuning, tọa độ ba đêm và pipeline 12 bước. Các quyết định người dùng đã duyệt trong phase-2.md là assumptions implementation, không viết lại thành yêu cầu Ticket.
- `TEST_CONTRACT_SPEC.md` là draft. Triển khai known v1.1 delta qua adapter riêng; không tuyên bố official compatibility khi v1.0 base/schema chưa xác minh.
- Core là ESM thuần, dùng chung cho browser/headless; không dùng DOM/Three.js/clock trong luật. Gameplay constants ở `src/config/game.js`, map/terrain data ở `src/data/worlds.js`.
- Chạy `npm test`, `npm run build`, `npm run verify`, `npm run test:independent`, `npm run test:browser` khi sửa core/browser. Core evidence chỉ ghi `docs/proof/phase-2/core/`; browser evidence ghi `docs/proof/phase-2/browser/`; không ghi đè `docs/proof/phase-1/`.
- Browser render lấy cùng map/terrain descriptors; chỉ đọc trạng thái Core. Fixed simulation 60Hz dùng accumulator độc lập với render FPS; event âm thanh tiêu thụ đúng một lần mỗi sim tick. E2E điều khiển bằng input thực, quan sát snapshot read-only, không mutate game state hoặc giả lập kết quả.
- Kiểm tra timer tại ngưỡng, same-tick priority, seeded replay, malformed input/output và cả ba đêm. Chỉ ghi PASS sau command thực tế; giữ nguyên test failures/evidence.
- Không tạo output mẫu giả, không tắt test, không lén thêm gameplay. Ghi mọi assumption chưa có trong Ticket vào notes kèm test. Không đoán schema v1.0.
- Cập nhật phase-2 RTM và AI usage bằng kết quả thực tế. Không đưa ra số token/chi phí nếu không có telemetry.
