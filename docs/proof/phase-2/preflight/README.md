# Post-Phase-1 cross-platform CI hotfix

Đây là preflight khắc phục lỗi cài đặt phát hiện **sau bàn giao Phase 1**, không phải triển khai Ticket-02. Tag `phase-1` giữ nguyên commit `627ed7f92c59482bc902fba108c2936dc9481976`; không sửa gameplay, PRD hoặc evidence Phase 1.

## Root cause và sửa chữa

CI gốc: https://github.com/Dunnguyn/K5-L3A-DAY12-NguyenThiThuyDung-2A202603552-AI-SDLC-Dao-Den-Long/actions/runs/44711697533. Trích log thật ở `phase1-ci-extract.log`: npm ci EUSAGE vì thiếu hai package records. Local Node 24.13.0/npm 11.6.2; CI không ghim bản nhỏ nên dùng Node 24.22.2/npm 11.19.1.

Dependency cha: Vite 8.3.8 → rolldown 1.2.19 → optional @rolldown/binding-wasm32-wasi 1.2.19 → @emnapi/core và @emnapi/runtime 2.0.0-beta.2. @napi-rs/wasm-runtime cũng khai báo peer dependencies tương ứng. Lock Windows đã chứa binding/dependency declarations nhưng thiếu records của hai gói, làm closure optional/peer không đầy đủ. Chúng không được cài trong cây native Windows nên npm ls local không thể chứng minh lock dùng được trên OS khác. CI npm mới từ chối lock không đầy đủ trước khi chạy tests. Chưa cô lập thành lỗi upstream cụ thể của npm; không gán nguyên nhân cho Node hay Linux gameplay.

Tái tạo **từ package.json + lock cũ trong thư mục tạm không có node_modules**, dùng npm 11.19.1 với `install --package-lock-only --ignore-scripts`. Đây là bước sửa lock, không thay npm ci trong workflow. Kết quả chỉ thêm records @emnapi/core/runtime và chuẩn hóa metadata peer của vite; **không phiên bản đã khóa nào đổi**, không thêm direct dependency. Xem `lock-repair-command.json` và `lock-delta.json`.

Workflow ghim Node 24.13.0, cài npm 11.19.1, ghi version thật, giữ **npm ci**. packageManager khai báo npm 11.19.1; local verification dùng `npx --yes npm@11.19.1` để không thay npm global của người dùng. Checkout full history để kiểm tag/baseline; logs, independent suite và browser smoke ghi riêng preflight, không ghi đè Phase 1. Chỉ bootstrap npm CLI dùng npm install --global; dependency install vẫn là npm ci.

## Verification và evidence

- `node scripts/preflight-ci.mjs --clean`: clean npm ci, unit 18/18, independent 21/21, build, verify 5/5, CLI win/loss và invalid-input checks. Raw commands/exit/stdout/stderr ở `regression-win32.json` và bản giữ lần clean-install.
- `parity-win32.json`: full headless snapshots khớp baseline Phase 1, không teleport/state overrides; hash source/evidence/PRD so với tag không đổi. Tag được kiểm đúng SHA trước khi kết luận.
- CI mới: xem workflow của hotfix commit trên GitHub; chỉ được kết luận Ubuntu PASS khi run **success**. Artifact `cross-platform-preflight` chứa `regression-linux.json`, `parity-linux.json`, verify và `ci-browser/`. Không suy ra macOS PASS.
- `git diff --check` phải pass trước commit. Không thay tag, không force-push.

Giới hạn giữ nguyên: official Test Contract NOT VERIFIED, headless internal-draft-1; macOS và GPU thật chưa xác minh. Không chạy lại browser E2E đầy đủ ở local vì không đổi gameplay/rendering; workflow vẫn kiểm browser smoke trên Ubuntu. Không nâng cấp dependency hàng loạt. AI thực hiện diagnosis/lock repair/regression/CI; không có telemetry token/chi phí nên không bịa số đo. Verdict chờ kết quả CI thực tế, không dùng kết quả Windows thay Ubuntu.
