# PRD-0 — Đảo Đèn Lồng

**Dự án:** Day 12 — AI SDLC  
**Giai đoạn:** Phase 1  
**Màn chơi:** Đêm 1 – Đảo Bến

---

## 1. Chúng tôi muốn gì

Chúng tôi muốn một **game 3D** tên là **Đảo Đèn Lồng**.

Người chơi điều khiển **Mây**, người giữ đèn nhỏ tuổi của một hòn đảo giữa biển mây. Đêm nay, sương đen đã nuốt hết ánh sáng của đảo. Mây phải chạy khắp đảo **thu thập những đốm sáng (đom đóm)** rồi mang về **thắp lại các Đèn Lồng Lớn**.

Trong bóng tối có **Bóng Mực**, những sinh vật bằng mực đen sống trong sương.

- Bóng Mực đuổi theo Mây.
- Khi bị Bóng Mực chạm vào, Mây mất máu.
- Mây có thể tỏa sáng để xua Bóng Mực, nhưng việc đó tiêu tốn ánh sáng.
- Bóng Mực sợ những chiếc đèn.

Điều kiện kết thúc:

- **Thắng:** Thắp sáng hết tất cả Đèn Lồng Lớn.
- **Thua:** Mất hết máu.

Game có hệ thống điểm số.

## 2. Phạm vi Phase 1

- Một màn chơi: **Đêm 1 – Đảo Bến**, một hòn đảo tròn có **5 Đèn Lồng Lớn**.
- Nhân vật có thể đi lại, nhảy và sử dụng camera 3D.
- Đom đóm xuất hiện rải rác trên đảo và có thể thu thập.
- Người chơi có thể nạp ánh sáng vào đèn để thắp đèn.
- Bóng Mực xuất hiện và đuổi theo người chơi.
- Người chơi có thể tỏa sáng để xua Bóng Mực.
- Có cơ chế thắng, thua và tính điểm.
- Có giao diện hiển thị các thông tin cần thiết (HUD).
- Có thể chơi lại sau khi thắng hoặc thua.

## 3. Cảm giác và phong cách

### 3.1. Không khí và màu sắc

- Không khí ban đêm, ấm áp, cổ tích.
- Hòn đảo sáng dần lên khi các đèn được thắp sáng.
- Ánh sáng vàng cam ấm đại diện cho những điều tốt đẹp.
- Màu tím đen đại diện cho sự nguy hiểm.

### 3.2. Thiết kế đồ họa

- Phong cách đồ họa đơn giản nhưng đẹp.
- Không cần đồ họa chân thực.
- Nhân vật Mây đội nón lá có treo một chiếc đèn lồng nhỏ.
- Không bạo lực, không máu me.

### 3.3. Tự do sáng tạo (khuyến khích)

PRD-0 chỉ là khung yêu cầu. Ngoài những nội dung đã nêu, người thực hiện được tự do sáng tạo thêm:

- Nhân vật phụ.
- Các loại Bóng Mực hoặc đom đóm khác nhau.
- Cơ chế gameplay bổ sung.
- Sự kiện bất ngờ.
- Câu chuyện.
- Hiệu ứng.
- Âm thanh.
- Cách thể hiện ánh sáng.
- Các chi tiết trên đảo.

Hãy làm cho game mang dấu ấn riêng của người thực hiện.

Các nguyên tắc bắt buộc khi bổ sung tính năng sáng tạo:

1. **Không phá vỡ các yêu cầu của PRD-0 và Test Contract.** Phần bổ sung không được làm thay đổi đầu ra headless theo contract. Ví dụ: các thực thể bổ sung nên được tắt khi chạy headless.
2. **Ghi rõ trong README.md**, tại mục ngắn "Sáng tạo của tôi", những nội dung đã bổ sung và cung cấp bằng chứng rằng các chức năng ban đầu vẫn hoạt động đúng.
3. **Làm lõi đúng trước, sáng tạo sau.** Cân nhắc quota token. Một ý tưởng sáng tạo nhỏ, hoàn chỉnh và hoạt động đúng tốt hơn nhiều ý tưởng dở dang.

## 4. Không bắt buộc công nghệ

Người thực hiện được tự lựa chọn:

- Game engine.
- Ngôn ngữ lập trình.
- Framework.
- Thư viện và công cụ phát triển.

Game phải chạy được trên laptop sử dụng macOS hoặc Linux.

Nếu phát triển trên Windows, cần cung cấp phương thức chạy tương thích với macOS/Linux cho giảng viên, ví dụ Docker hoặc phiên bản web.

## 5. Bàn giao Phase 1

Nộp bài bằng Git tag `phase-1` trên repository công khai (public).

| STT | Deliverable | Yêu cầu |
|---|---|---|
| 1 | Game 3D | Chơi được Đêm 1 từ lúc bắt đầu đến khi thắng hoặc thua. |
| 2 | `README.md` | Hướng dẫn cài đặt và chạy trong tối đa 3 lệnh, cách điều khiển và cách tính điểm. |
| 3 | `game.contract.json` | Khai báo theo cấu trúc Test Contract v1.0. |
| 4 | Headless Mode | Chế độ chạy không cần giao diện, tuân thủ Test Contract v1.0. |
| 5 | Verification Evidence | Bằng chứng game hoạt động đúng yêu cầu. |
| 6 | Project Notes | Ghi chép ngắn về các giả định và nhật ký sử dụng AI. Định dạng tự chọn. |
| 7 | AI Harness | `AGENTS.md` hoặc tài liệu tương đương, skills, hooks và các công cụ harness đã sử dụng. |
| 8 | Git Tag | Tag `phase-1` trên repository public. |

## 6. Lưu ý

- **Game tốt là game đúng yêu cầu của khách hàng**, không phải game phức tạp hay đẹp nhất.
- **Cân nhắc kỹ quota token.** Sử dụng nhiều token không đồng nghĩa với chất lượng bài làm tốt hơn.
- **Không có bằng chứng thì chưa xong.** Việc agent thông báo đã chạy thành công không được xem là bằng chứng kiểm chứng.
- Đối với những nội dung PRD-0 chưa quy định rõ, người thực hiện được tự đưa ra giả định hợp lý và ghi chép lại.
- Sáng tạo thêm được khuyến khích, nhưng không được làm hỏng phần lõi và Test Contract.