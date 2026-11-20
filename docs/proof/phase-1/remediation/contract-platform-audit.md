# FIX-02 / FIX-03 / FIX-07

Ngày 2026-11-20, kiểm tra lại repository https://github.com/VinUni-AI20k/K5-L3-LAB-Day12-AI-SDLC bằng web tool: trang truy cập được và vẫn dẫn tới Lab Board. Mở https://claude.ai/artifact/Q1RYyv1dxjUczzCbd2ZnoW trả “not accessible via this tool”. Chưa lấy được quy cách chính thức. Không kết luận tài liệu không tồn tại. Không thể đối chiếu field/CLI/input/output/exit/units/seed/rounding khi thiếu nguồn. **OFFICIAL CONTRACT NOT VERIFIED**, giữ `internal-draft-1` và adapter độc lập.

`commands.json` lưu WSL exit 1: Windows Subsystem for Linux is not installed. Docker executable ENOENT. Không cài WSL/Docker mới; không có macOS runtime. GitHub Actions Ubuntu chưa thể chạy vì chưa có yêu cầu commit/push. Workflow vẫn có npm ci, verify (test/build/scenarios), Chromium smoke và thêm direct headless CLI JSON parse check. **Linux/macOS NOT VERIFIED**, không suy PASS từ YAML.

`hardware-probe.json`: Chromium không truyền cờ ép software vẫn chọn ANGLE SwiftShader. WebGL error 0 trong probe, nhưng không phải GPU Radeon của host. **Hardware FPS/frame time/load/memory NOT VERIFIED**. LoadMs chỉ là probe software lúc các kiểm tra khác có thể đang chạy, không benchmark so sánh. QA `performance.json` là baseline software, giữ nguyên; không tối ưu kiến trúc/chất lượng dựa trên 4.32 FPS. Browser QA chạy lại có mẫu software mới, cũng không đại diện GPU thật.

Khi có bản official: ghi nguồn/version, mapping từng field/CLI/unit/error/seed, điều chỉnh adapter rồi replay regression trước khi nghiệm thu. Khi được yêu cầu push: chạy workflow Ubuntu và lưu artifact cùng SHA; nếu đúng deadline vẫn thiếu tài liệu/môi trường, bàn giao code/evidence hiện có với các mục NOT VERIFIED và xin Coach ghi nhận ngoại lệ, không tự gán contract/platform PASS.
