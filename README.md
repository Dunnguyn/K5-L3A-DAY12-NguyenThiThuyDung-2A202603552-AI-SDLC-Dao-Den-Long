# Day 12 — AI SDLC: Đảo Đèn Lồng

## Chơi Phase 1

Game 3D dùng chung core với headless. Phiên bản bàn giao Phase 1 theo deadline, với các giới hạn đã được người thực hiện chấp nhận. Headless là **schema nội bộ DRAFT**, chưa xác minh tương thích Test Contract v1.0 chính thức. Phân tích và kết quả: [phase-1.md](docs/notes/phase-1.md).

Yêu cầu Node.js 24.x, npm. Sau khi clone và mở thư mục repo, chạy trên Windows/macOS/Linux:

```sh
npm ci
npm run dev
```

Mở URL local Vite hiển thị. WASD/mũi tên di chuyển, Space nhảy, E thắp đèn khi ở gần và có 5 ánh sáng, Q tỏa sáng tốn 2 ánh sáng, kéo chuột xoay camera. R hoặc nút Chơi lại sau khi kết thúc. Thắp 5 đèn để thắng, HP=0 để thua. Vùng đèn sáng bảo vệ Mây; đom đóm hồi sinh sau 15 giây.

Điểm: 10 mỗi lần nhặt đom đóm hợp lệ, 100 mỗi đèn mới, 500 khi thắng một lần. Đom đóm hồi sinh có thể tiếp tục cho điểm; không có bảng xếp hạng.

Kiểm chứng: `npm test`, `npm run build`, `npm run verify`. Browser: `npx playwright install chromium` rồi `npm run test:browser`. Bằng chứng ở [docs/proof/phase-1](docs/proof/phase-1).

Headless (JSON thuần cho máy đọc): `node scripts/headless.mjs docs/proof/phase-1/win.input.json`. Tương đương: `npm --silent run headless -- docs/proof/phase-1/win.input.json`. `npm run headless` thông thường có banner npm, không dùng stdout đó làm JSON. CLI ghi JSON `{version,state}` vào stdout, lỗi JSON vào stderr/exit 1. Input ví dụ: `{"version":"internal-draft-1","actions":[{"ticks":60,"moveX":1,"jump":true}]}`. `ticks` lặp chuyển động; nút chỉ kích hoạt tick đầu mỗi action. Unknown keys bị từ chối. Quy cách nội bộ và config: [game.contract.json](game.contract.json); tạo từ config qua script để tránh lệch giá trị. Không phải schema chính thức của giảng viên.

Source: `src/core` luật thuần, `src/config` thông số, `src/data` layout, `src/headless` adapter, `src/browser` rendering/input/HUD. Không cần server backend. Tài liệu lab gốc tiếp tục bên dưới; phần hướng dẫn sản phẩm ở trên là trạng thái hiện tại.

### Sáng tạo của tôi

Chưa bổ sung tính năng sáng tạo. Nội dung hướng dẫn lab gốc được giữ bên dưới.

### Known Limitations

- Test Contract v1.0 chính thức chưa được đối chiếu; headless hiện tuân theo `internal-draft-1`.
- Linux/macOS đang chờ xác minh thực thi; xem GitHub Actions cho kết quả Ubuntu sau push, không suy ra macOS PASS.
- Số đo SwiftShader không đại diện GPU thực; GPU thực chưa được kiểm chứng.
- Occlusion nhỏ có thể xuất hiện khi camera ở sát cột đèn.

Nghiệm thu baseline: RTM 27 PASS / 1 PARTIAL / 0 FAIL / 4 NOT VERIFIED; unit 18/18, independent 21/21; browser win/lose/glow/camera/restart PASS. Báo cáo và bằng chứng lịch sử: [QA remediation](docs/proof/phase-1/remediation/report.md). Quyết định bàn giao không đồng nghĩa xác nhận tuân thủ contract chính thức.

> **Cá nhân** (1 người / 1 MSSV) · Áp dụng SDLC cùng AI để xây một **game 3D** qua **4 phase**, từ yêu cầu ban đầu tới bản phát hành.
> **Lab board + trợ giảng:** **[Đảo Đèn Lồng Lab](https://claude.ai/artifact/Q1RYyv1dxjUczzCbd2ZnoW)**

---

## Tài liệu của lab

| File | Nội dung |
|---|---|
| [GUIDE.md](GUIDE.md) | Hướng dẫn làm lab: vòng làm việc mỗi phase, harness, kiểm chứng, token |
| [CHECKPOINTS.md](CHECKPOINTS.md) | Các mốc tự kiểm tra từ chuẩn bị đến nộp bài |
| [SUBMISSION.md](SUBMISSION.md) | Đặt tên repo, hạn nộp, tag, Release, video, checklist |
| [RULES.md](RULES.md) | Quy định: AI, trung thực về bằng chứng, bản quyền, bảo mật |
| [RUBRIC.md](RUBRIC.md) | Thang điểm chi tiết |

## Lab board

Yêu cầu dự án được phát hành tại **[Đảo Đèn Lồng Lab](https://claude.ai/artifact/Q1RYyv1dxjUczzCbd2ZnoW)**. Mỗi phase là một tab (tab chưa phát hành bị khóa), mỗi tab có trợ giảng AI riêng chỉ trả lời trong phạm vi phase đó. Trợ giảng cần đăng nhập claude.ai và dùng lượt Claude của bạn.

## Dự án

**Đảo Đèn Lồng**: game 3D góc nhìn thứ ba. Mây, người giữ đèn nhỏ tuổi, gom đom đóm để thắp lại các Đèn Lồng Lớn và né Bóng Mực trong sương đen.

- Không ràng buộc công nghệ; chạy được trên macOS hoặc Linux.
- Tuân theo **Test Contract** (chế độ headless) để được chấm tự động và so sánh với nhau.

| Phase | Bạn nhận | Nộp |
|---|---|---|
| 1 | **PRD-0** (mô tả tổng quát) + Test Contract | tag `phase-1` |
| 2 | **Ticket-02**, phát hành khi Phase 1 kết thúc | tag `phase-2` |
| 3 | **Ticket-03**, phát hành khi Phase 2 kết thúc | tag `phase-3` |
| 4 | **Ticket-04**, phát hành khi Phase 3 kết thúc | tag `phase-4` + Release `v1.0.0` |

Yêu cầu sẽ được bổ sung và có thể thay đổi giữa các phase, giống dự án thật.

### Lịch 4 giờ

Bài lab kéo dài **4 giờ**. Phase 1 và 2 khoảng **1 giờ**, Phase 3 khoảng **30 phút**, Phase 4 khoảng **1 giờ 30 phút**. Mỗi phase phát hành đúng mốc giờ. Phase mới xuất hiện trên lab board khi tới mốc.

| Mốc | Sự kiện | Hạn tag |
|---|---|---|
| 0h | Phát hành **Phase 1** (PRD-0), gồm cả phần chuẩn bị | `phase-1` trước mốc 1h |
| 1h | Phát hành **Phase 2** | `phase-2` trước mốc 2h |
| 2h | Phát hành **Phase 3** | `phase-3` trước mốc 2h30 |
| 2h30 | Phát hành **Phase 4** | `phase-4`, Release `v1.0.0` và video trước mốc 4h |
| 4h | Hết giờ lab, chốt bài | |

Hết giờ mỗi phase thì tag và chuyển sang phase tiếp theo, dù phase chưa hoàn hảo. Chỗ chưa xong ghi trung thực trong bằng chứng.

---

## Gợi ý SDLC (cách làm là của bạn)

Mỗi phase là một vòng nhỏ. Công cụ, thứ tự, định dạng tài liệu đều tự do; đây chỉ là gợi ý:

1. **Requirements:** biến yêu cầu thành tiêu chí nghiệm thu kiểm chứng được. Chỗ mơ hồ thì tự giả định và ghi lại.
2. **Plan:** nghĩ cách kiểm chứng **trước** khi để agent viết code.
3. **Build:** để agent viết, bạn điều phối và review.
4. **Verify:** chạy thật, kiểm tra hành vi thật. *Không có bằng chứng thì chưa xong*: "agent bảo chạy rồi" không phải bằng chứng.
5. **Evaluate:** cái gì đạt, AI sai ở đâu, harness (AGENTS.md, skill, hook) cần chỉnh gì.
6. **Release:** gắn tag.

## Ba điều cần nhớ

> Bạn được **tự do sáng tạo thêm** quanh phần lõi (nhân vật, cơ chế nhỏ, câu chuyện, hiệu ứng, âm thanh…). Sáng tạo gọn và không phá yêu cầu được tính điểm trong hạng mục F của [RUBRIC](RUBRIC.md); ghi mục "Sáng tạo của tôi" trong README của bạn.

- **Game tốt là game đúng yêu cầu của khách hàng**, không phải game phức tạp hay đẹp nhất. Làm đúng và chứng minh được là đúng trước, trau chuốt sau.
- **Cân nhắc kỹ quota token của bạn.** Đốt nhiều token không làm bài tốt hơn. Ngữ cảnh gọn, kế hoạch rõ, kiểm chứng sớm thường vừa rẻ vừa đúng hơn chạy agent liên tục.
- **Kiểm chứng là phần quan trọng nhất.** Bằng chứng (test, output headless, ảnh, số đo) đáng giá hơn lời mô tả.

---

## Bàn giao cuối cùng

Một **repo GitHub cá nhân, public**, gồm:

1. **Toàn bộ mã nguồn** của game qua 4 phase, tag `phase-1` … `phase-4`, Release `v1.0.0`.
2. **Video demo `.mp4` dưới 5 phút** (đính kèm Release `v1.0.0` hoặc `docs/demo/demo.mp4`, link ở đầu README): chơi thử và cho thấy bằng chứng game chạy đúng.
3. **Bằng chứng kiểm chứng** của từng phase (định dạng tự chọn).
4. **Harness AI đã dùng** (AGENTS.md / CLAUDE.md, skills, hooks, plugins…), giữ nguyên trong repo và lịch sử git.
5. **Ghi chép ngắn:** spec/giả định mỗi phase, nhật ký dùng AI (gồm token/chi phí ước tính), retro.

Không commit API key, token hay `.env`. Gửi link repo theo hướng dẫn của Coach.

## Đánh giá (100 điểm)

| Hạng mục | Điểm |
|---|---|
| Test tự động ẩn (headless, gồm kiểm tra lại phase trước) | 30 |
| Kiểm chứng & bằng chứng của bạn | 20 |
| Quy trình SDLC & harness AI | 15 |
| Evaluation & retro (gồm cách bạn dùng token) | 10 |
| Hiệu năng & ổn định | 10 |
| Chất lượng sản phẩm (đúng yêu cầu, chơi được) | 10 |
| Video demo | 5 |

## Quy định

- Dùng AI thoải mái; không sao chép repo của người khác.
- Bằng chứng phải thật: test luôn đạt hay output sửa tay là vi phạm.
- Nhân vật, bối cảnh là bản gốc của lab; asset bên ngoài chỉ dùng loại CC0/CC-BY/MIT hoặc tự tạo, ghi nguồn trong `CREDITS.md`.
