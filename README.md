# NoteSpace

Ứng dụng ghi chú trực tuyến giúp người dùng tạo, chỉnh sửa, sắp xếp và
quản lý ghi chú. Dự án được phát triển cho học phần CSB25022 -- Web
Development.

> **Trạng thái hiện tại:** Backend đã được deploy lên Vercel và đã kiểm
> tra thành công API đọc/tạo ghi chú. Frontend có project Vercel riêng;
> việc tích hợp đầy đủ frontend với API và hoàn thiện các chức năng giao
> diện vẫn đang được triển khai.

## 1. Links triển khai

  ----------------------------------------------------------------------------
  Thành phần      URL                                          Trạng thái
  --------------- -------------------------------------------- ---------------
  Frontend        https://basic-web-note-frontend.vercel.app   Đã có project
                                                               deploy; cần
                                                               kiểm tra giao
                                                               diện và tích
                                                               hợp API

  Backend         https://basic-web-note-backend.vercel.app    Đã deploy

  API lấy danh    `GET /api/notes`                             Đã kiểm tra
  sách notes                                                   thành công

  API tạo note    `POST /api/notes`                            Đã kiểm tra
                                                               thành công
  ----------------------------------------------------------------------------

### Kết quả kiểm thử đã xác nhận

-   `GET /api/notes` trả về JSON với `success: true`.
-   `POST /api/notes` tạo note thử nghiệm và trả về `success: true`,
    `Note created successfully`.
-   Gọi lại `GET /api/notes` trả về `count: 2`, `data: [...]`.
-   Backend sử dụng MongoDB Atlas thông qua Mongoose.

Hai bản ghi hiện có là dữ liệu kiểm thử (`Connection Test` và một bản
ghi khác). Nhóm nên kiểm tra/xóa dữ liệu thử nghiệm trước khi demo hoặc
nghiệm thu.

## 2. Chức năng và tiến độ

Các mục dưới đây phân biệt giữa phần đã kiểm chứng và phần còn lại.
Không đánh dấu chức năng hoàn thành chỉ vì đã có file hoặc route.

### Quản lý ghi chú

-   [x] Backend: lấy danh sách ghi chú (`GET /api/notes`)
-   [x] Backend: lấy một ghi chú theo ID (`GET /api/notes/:id`)
-   [x] Backend: tạo ghi chú (`POST /api/notes`)
-   [x] Backend: cập nhật ghi chú (`PUT /api/notes/:id`)
-   [x] Backend: xóa ghi chú vĩnh viễn (`DELETE /api/notes/:id`)
-   [ ] Frontend: hiển thị danh sách notes lấy từ API
-   [ ] Frontend: tạo note từ giao diện
-   [ ] Frontend: chỉnh sửa và tự động lưu note
-   [ ] Frontend: xóa note từ giao diện
-   [ ] Kiểm thử đầy đủ CRUD từ giao diện và tải lại trang

### Trang con và điều hướng

-   [ ] Tạo trang con từ trang cha
-   [ ] Hiển thị cấu trúc phân cấp trong sidebar
-   [ ] Mở rộng/thu gọn danh sách trang con
-   [ ] Breadcrumbs và điều hướng về trang cha
-   [ ] Kiểm thử quan hệ cha-con sau khi tải lại trang

### Tìm kiếm và sắp xếp

-   [ ] Tìm kiếm theo tiêu đề
-   [ ] Tìm kiếm theo nội dung
-   [ ] Ghim/bỏ ghim ghi chú
-   [ ] Trang hiển thị ghi chú đã ghim
-   [ ] Tags và lọc theo tags

### Trình soạn thảo

-   [ ] Chỉnh sửa nội dung đoạn văn
-   [ ] Heading, to-do, bullet list
-   [ ] Quote và callout
-   [ ] Slash commands
-   [ ] Lưu và khôi phục nội dung editor qua API

### AI Assistant

-   [ ] Tóm tắt nội dung
-   [ ] Cải thiện cách diễn đạt
-   [ ] Đề xuất tiêu đề
-   [ ] Tích hợp dịch vụ AI thực tế
-   [ ] Xử lý trạng thái loading/lỗi và cho phép xem trước kết quả

### Giao diện và chất lượng

-   [ ] Giao diện sáng/tối và lưu tùy chọn
-   [ ] Responsive trên desktop, tablet và mobile
-   [ ] Settings
-   [ ] Accessibility và điều hướng bàn phím
-   [ ] Kiểm thử các luồng chính
-   [ ] Lighthouse và logging/tracking

## 3. Công nghệ

  Thành phần        Công nghệ
  ----------------- ---------------------------------------------------
  Frontend          HTML, CSS, JavaScript
  Backend           Node.js, Express.js
  Database          MongoDB Atlas
  ODM               Mongoose
  Hosting           Vercel (frontend và backend là hai project riêng)
  Version control   Git và GitHub

**Lưu ý học phần:** Project brief hiện nêu MySQL/PostgreSQL trong tiêu
chí database, trong khi nhóm đang sử dụng MongoDB Atlas. Nhóm cần xác
nhận với giảng viên rằng lựa chọn này được chấp nhận.

## 4. Cấu trúc dự án

Cập nhật sơ đồ này khi cấu trúc repository thay đổi. Tên file/thư mục
trong README cần được đối chiếu với repository thực tế trước mỗi lần
release.

``` text
basic-web-note/
├─ backend/
│  ├─ config/
│  │  └─ db.js
│  ├─ controllers/
│  │  ├─ aiController.js
│  │  └─ noteController.js
│  ├─ middleware/
│  │  └─ errorHandler.js
│  ├─ models/
│  │  └─ Note.js
│  ├─ routes/
│  │  ├─ aiRoutes.js
│  │  └─ noteRoutes.js
│  ├─ services/
│  │  └─ aiService.js
│  ├─ .env
│  ├─ .env.example
│  ├─ package-lock.json
│  ├─ package.json
│  └─ server.js
├─ docs/
│  └─ prototype.html
├─ frontend/
│  ├─ assets/
│  ├─ css/
│  │  ├─ responsive.css
│  │  └─ style.css
│  ├─ js/
│  │  ├─ ai.js
│  │  ├─ app.js
│  │  ├─ notes.js
│  │  ├─ search.js
│  │  └─ settings.js
│  ├─ pages/
│  │  ├─ home.html
│  │  ├─ pinned.html
│  │  ├─ settings.html
│  │  └─ trash.html
│  └─ index.html
├─ .gitignore
└─ README.md
```

## 5. API ghi chú

Base URL production:

``` text
https://basic-web-note-backend.vercel.app/api
```

  Method   Endpoint       Mục đích
  -------- -------------- ---------------------
  GET      `/notes`       Lấy danh sách notes
  GET      `/notes/:id`   Lấy note theo ID
  POST     `/notes`       Tạo note
  PUT      `/notes/:id`   Cập nhật note
  DELETE   `/notes/:id`   Xóa note vĩnh viễn

Ví dụ tạo note:

``` json
{
  "title": "My first note",
  "content": "Note content",
  "pinned": false,
  "tags": []
}
```

Các trường dữ liệu chính trong Note model gồm `title`, `content`,
`parent_id`, `pinned`, `trashed`, `icon`, `color`, `category`, `tags`,
cùng `createdAt` và `updatedAt`.

## 6. Cài đặt local

### Backend

``` bash
cd backend
npm install
```

Tạo file `.env` trong thư mục `backend` và cấu hình biến môi trường:

``` env
MONGO_URI=your_mongodb_connection_string
PORT=5000
```

Chạy backend:

``` bash
npm run dev
```

Backend local mặc định: `http://localhost:5000`.

Không commit `.env`, connection string, API key hoặc secret lên GitHub.
Chỉ commit `.env.example` với tên biến và giá trị mẫu không nhạy cảm.

### Frontend

Frontend hiện là HTML/CSS/JavaScript thuần. Có thể chạy bằng Live Server
hoặc một static server. Đảm bảo `frontend/js/api.js` trỏ tới backend
local khi phát triển local và backend production khi deploy.

## 7. Git workflow

Nhóm sử dụng nhánh riêng cho từng tính năng, không phát triển trực tiếp
trên `main`.

Quy trình:

1.  Cập nhật `main` trước khi bắt đầu.
2.  Tạo feature branch từ `main`.
3.  Chỉ commit các thay đổi thuộc phạm vi quản lý ghi chú.
4.  Dùng commit message mô tả rõ thay đổi.
5.  Push branch và mở Pull Request về `main`.
6.  Thành viên khác review và kiểm tra trước khi merge.

Ví dụ:

``` bash
git switch main
git pull origin main
git switch -c feature/note-management
```

Commit message gợi ý:

``` text
feat(notes): connect notes list to backend API
feat(notes): add note creation flow
fix(notes): handle API errors when saving notes
```

## 8. Phân công thành viên

Nhóm cập nhật sau khi thống nhất phân công chính thức.

  Thành viên          Công việc phụ trách
  ------------------- ---------------------
  Đặng Vĩnh Quang     Chưa cập nhật
  Lê Tôn Hải          Chưa cập nhật
  Nguyễn Hữu Nhật     Chưa cập nhật
  Nguyễn Trọng Tiến   Chưa cập nhật
  