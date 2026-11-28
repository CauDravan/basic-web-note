# Kiểm thử NoteSpace Next.js

Kiểm thử ngày **28/11/2026** trên bản production cục bộ của Next.js 16.4.6 và API Express. Đợt kiểm thử dùng Node.js 24, Chrome 158 và PostgreSQL cục bộ qua PGlite TCP. Cơ sở dữ liệu thử nghiệm có 8 ghi chú mẫu, gồm 2 ghi chú đã ghim và 1 ghi chú trong thùng rác.

## API và cơ sở dữ liệu

Chạy `npm run db:init` với `DATABASE_URL` trỏ tới PostgreSQL thử nghiệm. Đặt `TEST_DATABASE_URL` cùng địa chỉ và chạy `npm test` trong `backend/`.

| Phép kiểm | Kết quả thực tế |
| --- | --- |
| Tạo, lấy danh sách, lấy theo ID và đối chiếu dữ liệu ghi trực tiếp trong PostgreSQL | Đúng tiêu đề Unicode, tag và trạng thái |
| Chỉnh nội dung, ghim, chuyển vào Trash và khôi phục | Nội dung và ngày tạo được giữ, ngày cập nhật được đổi |
| ID sai, ghi chú không tồn tại, tự làm cha hoặc gán cha đã xóa | Trả về mã 400 hoặc 404 theo tình huống |
| Xóa ghi chú cha | Ghi chú cha biến mất và khóa ngoại của ghi chú con về `NULL` |

Suite API đạt **4/4** theo Node test runner, gồm một nhóm kiểm thử và ba kiểm thử con. Kiểm tra thêm `npm run db:init` và `npm run seed` đã nạp đủ 8 ghi chú mẫu qua cùng kết nối.

## Tương tác trên trình duyệt

| Thao tác | Kết quả mong đợi | Kết quả thực tế |
| --- | --- | --- |
| Mở Home, Pinned, Trash rồi dùng Enter để mở một ghi chú | Home chỉ có ghi chú đang hoạt động, Pinned chỉ có ghi chú ghim, Trash chỉ có ghi chú đã xóa | Đạt. Ba danh sách khớp dữ liệu mẫu, mở đúng ID và ghi chú trong Trash ở chế độ chỉ đọc |
| Tạo ghi chú, nhập tiếng Việt và tag, chờ Saved rồi tải lại | Nội dung và tag được lưu | Đạt. Tải lại và gọi API đều đọc được bản đã lưu qua PostgreSQL |
| Lần lượt tìm theo tiêu đề, nội dung, tag và từ khóa không khớp | Danh sách lọc đúng và có trạng thái trống | Đạt. Cả ba truy vấn trả đúng ghi chú thử |
| Ghim, bỏ ghim, chuyển vào Trash, hủy xóa và khôi phục | Ghi chú xuất hiện đúng danh sách sau mỗi thao tác | Đạt. Hủy xóa giữ ghi chú trong Trash, khôi phục đưa ghi chú về Home |
| Xác nhận xóa vĩnh viễn rồi mở lại địa chỉ của ghi chú | Xóa khỏi Trash và trả 404 khi tải ID | Đạt. Trình soạn báo ghi chú đã mất |
| Mô phỏng lỗi tải danh sách một lần rồi bấm Try again | Hiện lỗi và cho phép tải lại | Đạt. Danh sách hiển thị ở lần thử lại |
| Gửi nội dung rỗng tới API AI, xem trước tóm tắt, chọn Discard rồi thử lại và áp dụng | API từ chối nội dung rỗng. Bản xem trước giữ nguyên ghi chú cho đến khi áp dụng | Đạt. API thật trả 400. Các bước xem trước, bỏ và chèn kết quả dùng phản hồi AI mô phỏng ở trình duyệt |
| Đổi sang Dark, tải lại, dùng Test connection, mở About rồi quay về Home | Theme được lưu, kiểm tra được kết nối và điều hướng đúng | Đạt. Sidebar đánh dấu About là trang hiện tại |
| Đổi kích thước khung nhìn và mở sidebar mobile | Trang không tràn ngang, sidebar mở và đóng đúng | Đạt ở 1440 × 960, 768 × 1024 và 390 × 844. Đã mở Pinned và trình soạn qua sidebar mobile |

Ảnh thực tế ở giao diện tối gồm [desktop](screenshots/nextjs/home-desktop.png), [tablet](screenshots/nextjs/home-tablet.png), [mobile](screenshots/nextjs/home-mobile.png), [sidebar mobile](screenshots/nextjs/sidebar-mobile.png) và [trình soạn mobile](screenshots/nextjs/editor-mobile.png). Thanh DevTools trong ảnh hiển thị 768 × 1024 trên tablet và 390 × 844 trên mobile.

[Video demo do thành viên nhóm quay](evidence/notespace-demo.mp4) dài khoảng 37 giây, ghi lại chỉnh sửa và ghim ghi chú, thao tác với Trash, Settings và About.

## Lighthouse

Lighthouse 13.6.0, cấu hình mobile mặc định, chạy trên bản production cục bộ với dữ liệu mẫu. Mở từng báo cáo HTML để xem chi tiết các chỉ số và audit.

| Trang | Performance | Accessibility | Best Practices | SEO | Báo cáo |
| --- | ---: | ---: | ---: | ---: | --- |
| Home | 100 | 100 | 100 | 100 | [Home](lighthouse/home.html) |
| Trình soạn ghi chú | 95 | 100 | 100 | 100 | [Note editor](lighthouse/editor.html) |
| Pinned | 100 | 100 | 100 | 100 | [Pinned](lighthouse/pinned.html) |
| Trash | 100 | 100 | 100 | 100 | [Trash](lighthouse/trash.html) |
