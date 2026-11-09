# NoteSpace

Ứng dụng ghi chú trực tuyến giúp người dùng tạo, chỉnh sửa, sắp xếp và quản lý ghi chú. Ứng dụng hỗ trợ trang con nhiều cấp, tìm kiếm và các chức năng hỗ trợ viết bằng AI.

## Mục lục

- [Các chức năng](#các-chức-năng)
- [Công nghệ sử dụng](#công-nghệ-sử-dụng)
- [Cấu trúc dự án](#cấu-trúc-dự-án)
- [Phân công thành viên](#phân-công-thành-viên)
- [Yêu cầu trước khi cài đặt](#yêu-cầu-trước-khi-cài-đặt)
- [Nhật ký phát triển](#nhật-ký-phát-triển)

## Các chức năng

### 1. Quản lý ghi chú

- [ ] Tạo trang/ghi chú
- [ ] Chỉnh sửa tiêu đề và nội dung trang
- [ ] Tự động lưu thay đổi
- [ ] Chuyển trang vào Thùng rác
- [ ] Khôi phục trang từ Thùng rác
- [ ] Xóa trang vĩnh viễn
- [ ] Lưu trữ ghi chú thông qua backend và cơ sở dữ liệu
- [ ] Bổ sung kiểm tra dữ liệu đầu vào và xử lý lỗi API

### 2. Trang con và điều hướng

- [ ] Tạo trang con từ một trang cha
- [ ] Hiển thị cấu trúc trang phân cấp ở thanh điều hướng bên
- [ ] Mở rộng và thu gọn danh sách trang con
- [ ] Hiển thị đường dẫn điều hướng (breadcrumbs)
- [ ] Chuyển về trang cha thông qua breadcrumbs
- [ ] Hỗ trợ nhiều cấp trang con
- [ ] Lưu quan hệ cha-con thông qua backend và cơ sở dữ liệu
- [ ] Kiểm thử cấu trúc trang con sau khi tải lại trang và qua các phiên sử dụng

### 3. Tìm kiếm và sắp xếp

- [ ] Tìm kiếm theo tiêu đề
- [ ] Tìm kiếm theo nội dung
- [ ] Ghim và bỏ ghim trang
- [ ] Hiển thị các trang đã ghim
- [ ] Thêm thẻ/nhãn văn bản cho trang
- [ ] Lọc trang theo thẻ/nhãn
- [ ] Lưu dữ liệu tìm kiếm, ghim và phân loại thông qua backend

### 4. Trình soạn thảo nội dung

- [ ] Chỉnh sửa nội dung đoạn văn
- [ ] Thêm tiêu đề
- [ ] Thêm danh sách công việc (to-do)
- [ ] Thêm danh sách gạch đầu dòng
- [ ] Thêm trích dẫn và khối ghi chú nổi bật (callout)
- [ ] Thêm khối nội dung bằng lệnh dấu gạch chéo (slash command)
- [ ] Kiểm tra việc chuyển đổi và lưu nội dung trình soạn thảo vào cơ sở dữ liệu

### 5. Trợ lý AI

- [ ] Chức năng tóm tắt nội dung
- [ ] Chức năng cải thiện cách diễn đạt
- [ ] Chức năng đề xuất tiêu đề
- [ ] Kết nối trợ lý AI với một dịch vụ AI thực tế
- [ ] Tải và quản lý cấu hình nhà cung cấp AI một cách an toàn
- [ ] Xử lý lỗi API và trạng thái đang tải
- [ ] Cho phép người dùng xem trước, áp dụng hoặc hủy nội dung AI đề xuất

### 6. Giao diện và cài đặt

- [ ] Giao diện sáng
- [ ] Giao diện tối
- [ ] Lưu tùy chọn giao diện bằng bộ nhớ cục bộ
- [ ] Thanh điều hướng bên có khả năng thích ứng
- [ ] Giao diện cài đặt
- [ ] Các trường cấu hình nhà cung cấp AI trong phần cài đặt
- [ ] Kiểm tra giao diện trên máy tính, máy tính bảng và điện thoại
- [ ] Kết nối phần cài đặt với ứng dụng đã tích hợp
- [ ] Kiểm tra khả năng truy cập và điều hướng bằng bàn phím

## Công nghệ sử dụng

| Thành phần | Công nghệ/định hướng hiện tại |
|---|---|
| Frontend | HTML, CSS và JavaScript |
| Backend | Node.js và Express.js |
| Cơ sở dữ liệu | MongoDB Atlas (đã thay đổi thay vì sử dụng MySQL) |
| AI |  |
| Quản lý mã nguồn | Git |

## Cấu trúc dự án

```text
basic-web-note/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── aiController.js
│   │   └── noteController.js
│   ├── middleware/
│   │   └── errorHandler.js
│   ├── models/
│   │   └── Note.js
│   ├── routes/
│   │   ├── aiRoutes.js
│   │   └── noteRoutes.js
│   ├── services/
│   │   └── aiService.js
│   ├── .env.example
│   ├── package-lock.json
│   ├── package.json
│   └── server.js
├── docs/
│   ├── ERD.md
│   └── notespace_final.html
├── frontend/
│   ├── assets/
│   ├── css/
│   │   ├── responsive.css
│   │   └── style.css
│   ├── js/
│   │   ├── ai.js
│   │   ├── app.js
│   │   ├── notes.js
│   │   ├── search.js
│   │   └── settings.js
│   ├── pages/
│   │   ├── all-notes.html
│   │   ├── pinned.html
│   │   ├── settings.html
│   │   └── trash.html
│   └── index.html
├── .gitignore
└── README.md
```

Cập nhật sơ đồ cấu trúc này khi có tệp hoặc thư mục được thêm, xóa hay đổi tên. Đây là cấu trúc dự kiến; cần điều chỉnh để khớp với cấu trúc thực tế của repository.

## Phân công thành viên

| Thành viên | Công việc phụ trách |
|---|---|
| Đặng Vĩnh Quang |  |
| Lê Tôn Hải |  |
| Nguyễn Hữu Nhật |  |
| Nguyễn Trọng Tiến |  |

Cập nhật bảng này sau khi nhóm thống nhất phân công. Không tự gán nhiệm vụ khi chưa có xác nhận.

## Yêu cầu trước khi cài đặt

Để cài đặt và chạy NoteSpace trên máy tính cá nhân, cần chuẩn bị các công cụ và tài khoản sau:

### 1. Công cụ cần thiết

- **Git:** Dùng để clone repository và quản lý mã nguồn.
- **Node.js:** Môi trường chạy JavaScript phía backend. Khuyến nghị sử dụng phiên bản LTS.
- **npm:** Trình quản lý package, được cài đặt cùng Node.js.
- **Web browser:** Chrome, Edge hoặc trình duyệt hiện đại tương đương.

### 2. Cơ sở dữ liệu

- **MongoDB Atlas:** Sử dụng cơ sở dữ liệu MongoDB trên nền tảng đám mây.
- Cần có tài khoản MongoDB Atlas và một database cluster.
- Cần chuẩn bị MongoDB connection string để cấu hình kết nối backend.

### 3. Cấu hình môi trường

Trước khi chạy backend:

1. Mở thư mục `backend`.
2. Tạo file `.env` dựa trên `.env.example`.
3. Cập nhật các biến môi trường cần thiết.

## Nhật ký phát triển

Ghi lại các công việc quan trọng trong quá trình phát triển dự án.

| Ngày | Thành viên | Công việc đã thực hiện | Ghi chú |
|---|---|---|---|
| 2026-11-09 | Đặng Vĩnh Quang |  Kiểm tra và hoàn thiện kết nối backend với MongoDB Atlas. Xây dựng Note model, Note controller và Note routes. | Hoàn thành các API CRUD: tạo, đọc, cập nhật và xóa ghi chú. Đã kiểm thử bằng Postman và các API hoạt động như mong đợi. |