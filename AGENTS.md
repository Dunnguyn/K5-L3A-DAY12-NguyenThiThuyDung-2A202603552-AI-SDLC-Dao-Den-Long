# Đảo Đèn Lồng

- Đọc `docs/requirements/PRD-0.md`, toàn bộ `docs/requirements/TICKET-02.md`, `docs/requirements/TEST_CONTRACT_SPEC.md`, `docs/notes/phase-2.md` và skill verify-game trước khi sửa Phase 2. Ticket-02 thay luật Phase 1 chỉ tại các clause được nêu; giữ nguyên requirement/evidence gốc.
- Authorization hiện tại: chủ dự án đã cho phép bàn giao Phase 2 theo documented risk acceptance, miễn vòng Independent QA Re-test bổ sung; đây không phải QA độc lập xác nhận remediation. Cho phép commit và normal-push Phase 2; chỉ tạo/push annotated tag `phase-2` khi local verification và CI đúng HEAD đều PASS và tag chưa tồn tại. Dừng khi remote main thay đổi hoặc tag đã tồn tại. Giữ 4 PARTIAL/3 NOT VERIFIED và official v1.0 chưa xác minh. Không làm Ticket-03 hoặc sửa/di chuyển tag `phase-1`.
- Dùng đúng tuning, tọa độ ba đêm và pipeline 12 bước. Các quyết định người dùng đã duyệt trong phase-2.md là assumptions implementation, không viết lại thành yêu cầu Ticket.
- `TEST_CONTRACT_SPEC.md` là draft. Triển khai known v1.1 delta qua adapter riêng; không tuyên bố official compatibility khi v1.0 base/schema chưa xác minh.
- Core là ESM thuần, dùng chung cho browser/headless; không dùng DOM/Three.js/clock trong luật. Gameplay constants ở `src/config/game.js`, map/terrain data ở `src/data/worlds.js`.
- Chạy `npm test`, `npm run build`, `npm run verify`, `npm run test:independent`, `npm run test:browser` khi sửa core/browser. Core evidence chỉ ghi `docs/proof/phase-2/core/`; browser evidence ghi `docs/proof/phase-2/browser/`; không ghi đè `docs/proof/phase-1/`.
- Browser render lấy cùng map/terrain descriptors; chỉ đọc trạng thái Core. Fixed simulation 60Hz dùng accumulator độc lập với render FPS; event âm thanh tiêu thụ đúng một lần mỗi sim tick. E2E điều khiển bằng input thực, quan sát snapshot read-only, không mutate game state hoặc giả lập kết quả.
- Kiểm tra timer tại ngưỡng, same-tick priority, seeded replay, malformed input/output và cả ba đêm. Chỉ ghi PASS sau command thực tế; giữ nguyên test failures/evidence.
- Không tạo output mẫu giả, không tắt test, không lén thêm gameplay. Ghi mọi assumption chưa có trong Ticket vào notes kèm test. Không đoán schema v1.0.
- Cập nhật phase-2 RTM và AI usage bằng kết quả thực tế. Không đưa ra số token/chi phí nếu không có telemetry.
