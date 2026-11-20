# TEST_CONTRACT_SPEC — Đảo Đèn Lồng

- **Phase:** 1 — Đêm 1: Đảo Bến
- **Phiên bản Test Contract mục tiêu:** v1.0
- **Trạng thái:** DRAFT — chưa đối chiếu schema chính thức trên Lab Board
- **Nguồn nghiệp vụ:** `PRD-0.md`

> Tài liệu này là đặc tả triển khai nội bộ, không thay thế Test Contract chính thức của giảng viên. Người thực hiện tự xây dựng `game.contract.json`, lựa chọn thông số gameplay trong phạm vi được phép và tuân thủ chính xác cấu trúc Test Contract v1.0. Không suy diễn những tên trường, schema hoặc cú pháp lệnh chưa được xác nhận.

## 1. Mục tiêu

Xây dựng chế độ headless để có thể chạy và kiểm chứng logic game mà không mở cửa sổ, trình duyệt hay khởi tạo đồ họa 3D. Hệ thống nhận kịch bản kiểm thử, thực thi các hành động và trả về trạng thái game theo định dạng mà Test Contract chính thức quy định.

Game chạy trực tiếp và chế độ headless phải sử dụng cùng Game Core. Không được tạo logic giả hoặc hardcode kết quả để vượt qua kiểm thử.

## 2. Deliverables

| Thành phần | Yêu cầu |
|---|---|
| `game.contract.json` | Đặt tại thư mục gốc repository; tuân thủ schema chính thức. |
| Headless runner | Chạy được trên macOS/Linux, không phụ thuộc WebGL hoặc DOM. |
| Game Core | Chứa logic gameplay dùng chung cho game 3D và headless. |
| Scenario tests | Kiểm thử các quy tắc gameplay và trạng thái đầu ra. |
| `README.md` | Hướng dẫn chạy game, chạy headless, điều khiển và tính điểm. |
| `docs/proof/phase-1/` | Lưu scenario, đầu ra thực tế và kết quả đối chiếu. Vị trí đề xuất, không phải đường dẫn bắt buộc của đề. |

## 3. Quy cách chính thức cần đối chiếu

Sao chép các nội dung tương ứng từ Test Contract v1.0 trên Lab Board trước khi triển khai giao diện headless công khai.

| Hạng mục | Trạng thái |
|---|---|
| Schema và trường bắt buộc của `game.contract.json` | Chưa xác nhận |
| Cú pháp lệnh headless, tham số CLI | Chưa xác nhận |
| Cách truyền scenario (file, stdin hoặc hình thức khác) | Chưa xác nhận |
| Schema input, action và đơn vị thời gian/tọa độ | Chưa xác nhận |
| Schema output, trạng thái, kiểu dữ liệu và quy tắc làm tròn | Chưa xác nhận |
| Quy định seed, tính tất định và thứ tự cập nhật | Chưa xác nhận |
| Quy định xử lý input không hợp lệ, exit code, stdout/stderr | Chưa xác nhận |

Không xem các tên hành động, thông số hoặc cấu trúc nội bộ ở các mục dưới đây là schema chính thức. Khi có xung đột, Test Contract chính thức được ưu tiên.

## 4. Quy tắc gameplay bắt buộc từ PRD-0

| ID | Quy tắc |
|---|---|
| BR-01 | Phase 1 có một màn chơi Đêm 1 – Đảo Bến, đảo tròn, đúng 5 Đèn Lồng Lớn. |
| BR-02 | Mây có thể di chuyển và nhảy. |
| BR-03 | Đom đóm xuất hiện rải rác và có thể thu thập. |
| BR-04 | Ánh sáng thu thập được dùng để nạp và thắp đèn. |
| BR-05 | Bóng Mực xuất hiện và đuổi theo Mây. |
| BR-06 | Khi Bóng Mực chạm Mây, Mây mất máu. |
| BR-07 | Mây có thể tiêu tốn ánh sáng để tỏa sáng và xua Bóng Mực. |
| BR-08 | Bóng Mực sợ đèn. |
| BR-09 | Thắp hết 5 đèn thì thắng. |
| BR-10 | Mất hết máu thì thua. |
| BR-11 | Game có điểm số. |
| BR-12 | Có thể chơi lại sau thắng hoặc thua. |

Các yêu cầu camera 3D, HUD, nón lá, không khí cổ tích, đảo sáng dần và phong cách không bạo lực được kiểm chứng thêm bằng game chạy thực tế; không tự ý bổ sung trường output headless cho chúng nếu schema không yêu cầu.

## 5. Thông số thiết kế đề xuất

Ngoại trừ số màn và số đèn, các thông số sau là giả định nội bộ, có thể điều chỉnh để phù hợp với Test Contract chính thức và cân bằng gameplay. Các tên cột không phải JSON key chính thức.

| Thông số | Giá trị đề xuất | Đơn vị |
|---|---:|---|
| Số màn | 1 | màn |
| Số đèn lớn | 5 | đèn |
| Bán kính đảo | 30 | đơn vị game |
| Máu ban đầu / tối đa | 100 | HP |
| Ánh sáng ban đầu | 0 | đơn vị |
| Số đom đóm ban đầu | 40 | đom đóm |
| Ánh sáng nhận mỗi đom đóm | 1 | đơn vị |
| Ánh sáng cần cho mỗi đèn | 5 | đơn vị |
| Số Bóng Mực ban đầu | 4 | sinh vật |
| Sát thương mỗi lần chạm hợp lệ | 10 | HP |
| Miễn nhiễm sau khi nhận sát thương | 1 | giây |
| Chi phí tỏa sáng | 2 | đơn vị ánh sáng |
| Bán kính tỏa sáng | 6 | đơn vị game |
| Bán kính xua Bóng Mực quanh đèn đã sáng | 5 | đơn vị game |
| Điểm nhặt một đom đóm | 10 | điểm |
| Điểm thắp một đèn | 100 | điểm |
| Điểm thưởng chiến thắng | 500 | điểm |

### 5.1. Các quyết định cần chốt khi triển khai

- Tốc độ chạy, tốc độ Bóng Mực, gia tốc rơi, độ cao nhảy, bán kính tương tác, khoảng cách va chạm.
- Cách nạp đèn (một lần hoặc tích lũy), hướng và thời gian Bóng Mực bỏ chạy.
- Quy tắc biên đảo, vị trí spawn, đom đóm có tái sinh hay không.
- Thứ tự xử lý khi thắng và thua xảy ra cùng một bước mô phỏng.
- Cơ chế tỏa sáng khi không đủ tài nguyên và điều kiện được chơi lại.

Ghi quyết định cuối cùng trong `docs/notes/phase-1.md` và khai báo các trường mà contract yêu cầu trong `game.contract.json`. Không tạo nhiều nguồn cấu hình mâu thuẫn. Bảo đảm người chơi có thể thực sự thu đủ ánh sáng để thắng; nếu ánh sáng hữu hạn, cân nhắc khả năng bị tiêu hết do tỏa sáng.

## 6. Thiết kế headless nội bộ

### 6.1. Trách nhiệm

- Game Core: khởi tạo thế giới, cập nhật hành động, va chạm, tài nguyên, Bóng Mực, trạng thái thắng/thua và điểm.
- Headless adapter: đọc và kiểm tra input chính thức, chuyển thành hành động nội bộ, gọi Game Core, serialize output theo schema chính thức.
- Rendering adapter: nhận input người chơi, gọi Game Core, hiển thị scene 3D và HUD.

### 6.2. Trạng thái cần kiểm chứng

Các thông tin sau là khái niệm nghiệp vụ cần quan sát trong test, không phải danh sách JSON key bắt buộc:

- Trạng thái màn, trạng thái chơi/thắng/thua và điểm.
- Vị trí, máu, ánh sáng của Mây.
- Trạng thái đom đóm, đèn lồng và Bóng Mực.
- Tiến độ thắp đèn, trạng thái tương tác và những hiệu ứng logic liên quan.

### 6.3. Nguyên tắc kỹ thuật đề xuất

- Không phụ thuộc DOM, browser API hoặc renderer trong Game Core.
- Dùng seed kiểm soát ngẫu nhiên và bước mô phỏng ổn định nếu contract yêu cầu hoặc cho phép; kiểm tra tính tái lập.
- Không để FPS, đồng hồ hệ thống hoặc hiệu ứng hình ảnh làm thay đổi kết quả mô phỏng không chủ đích.
- Tách dữ liệu debug khỏi output chính thức; không in log dư vào stdout nếu contract chỉ chấp nhận dữ liệu có cấu trúc.
- Không tự đổi tên trường, kiểu dữ liệu hoặc giá trị enum chính thức.
- Tắt hoặc cô lập tính năng sáng tạo để chúng không phá kết quả headless.

## 7. Bộ test tối thiểu đề xuất

| ID | Kịch bản | Kết quả mong đợi |
|---|---|---|
| TC-01 | Khởi tạo Đêm 1 | Đúng 5 đèn lớn, trạng thái ban đầu hợp lệ theo config. |
| TC-02 | Di chuyển và nhảy | Vị trí/trạng thái nhảy thay đổi đúng luật đã công bố. |
| TC-03 | Tiếp xúc đom đóm | Tăng ánh sáng và điểm; không tính trùng cùng một đom đóm. |
| TC-04 | Nạp ánh sáng vào đèn | Tài nguyên giảm đúng phần đã nạp; đèn sáng khi đủ ngưỡng. |
| TC-05 | Nạp khi không đủ ánh sáng | Không phát sinh tài nguyên âm; xử lý theo quy tắc nạp đã chốt. |
| TC-06 | Bóng Mực đuổi Mây | Hành vi đuổi đúng điều kiện đã chốt. |
| TC-07 | Bóng Mực chạm Mây | HP giảm đúng quy tắc sát thương. |
| TC-08 | Tỏa sáng khi đủ tài nguyên | Ánh sáng giảm đúng chi phí; Bóng Mực trong phạm vi bị xua. |
| TC-09 | Tỏa sáng khi thiếu tài nguyên | Không có tác dụng trái quy tắc; tài nguyên không âm. |
| TC-10 | Bóng Mực gần đèn đã sáng | Bị xua hoặc tránh đèn theo quy tắc đã chốt. |
| TC-11 | Thắp đủ 5 đèn | Game chuyển sang thắng; điểm thưởng đúng công thức. |
| TC-12 | HP về 0 | Game chuyển sang thua; HP không âm. |
| TC-13 | Chơi lại sau thắng/thua | Khởi tạo lại game theo cấu hình ban đầu. |
| TC-14 | Chạy lại cùng scenario | So sánh output theo quy tắc tính tất định của contract. |
| TC-15 | Kiểm tra schema chính thức | Contract, input, output và lệnh chạy khớp tài liệu giảng viên. |
| TC-16 | Regression | Các bổ sung giao diện/sáng tạo không làm hỏng gameplay và headless. |

Đây là bộ kiểm thử dự kiến, chưa có kết quả thực thi. Với mỗi test, lưu input, expected, actual, command và PASS/FAIL thực tế; ghi rõ những test chưa chạy.

## 8. Tiêu chí nghiệm thu

- `game.contract.json` tồn tại và hợp lệ theo schema chính thức đã xác nhận.
- Lệnh headless chính thức chạy được trên môi trường mục tiêu mà không mở giao diện.
- Input/output tuân thủ đúng cấu trúc, kiểu dữ liệu và hành vi yêu cầu.
- Các quy tắc gameplay trong PRD-0 được kiểm chứng bằng test hoặc gameplay thật.
- Headless và game 3D sử dụng cùng Game Core.
- Các thông số tự chọn được ghi rõ và nhất quán giữa config, game, README và test.
- Có bằng chứng thật, tái lập được ở commit/tag `phase-1`.
- Không hardcode output, làm giả bằng chứng hoặc tắt test thất bại để báo đạt.

## 9. Nguồn tham chiếu

- PRD-0 — nội dung người thực hiện cung cấp.
- [Repository chính thức](https://github.com/VinUni-AI20k/K5-L3-LAB-Day12-AI-SDLC)
- [GUIDE.md — mục Headless và Test Contract](https://github.com/VinUni-AI20k/K5-L3-LAB-Day12-AI-SDLC/blob/main/GUIDE.md)
- [Lab Board — cần đối chiếu Test Contract v1.0](https://claude.ai/artifact/Q1RYyv1dxjUczzCbd2ZnoW)

