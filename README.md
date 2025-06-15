
# Hệ thống Quản lý Thiết bị và Quà tặng Trung tâm Victory

Dự án này là một hệ thống dựa trên web được thiết kế để quản lý thiết bị dạy học và quà tặng tại Trung tâm Ngoại ngữ - Tin học Victory. Hệ thống tự động hóa và tối ưu hóa việc quản lý các thiết bị dạy học (như máy tính, máy chiếu, bảng trắng) và quà tặng (dành cho học viên, đối tác hoặc khách), đảm bảo tính chính xác, minh bạch và hiệu quả. Hệ thống hỗ trợ phân quyền người dùng, theo dõi thiết bị, quản lý kho quà tặng và báo cáo chi tiết.

## Tính năng

### Quản lý Người dùng
- **Vai trò**: Quản trị viên (Admin), Quản lý thiết bị, Quản lý quà tặng.
- **Chức năng**: Đăng nhập, tạo tài khoản, cập nhật, xóa, kích hoạt/vô hiệu hóa, thay đổi mật khẩu, nhập danh sách giảng viên qua file CSV.
- **Quyền Quản trị viên**: Toàn quyền kiểm soát tài khoản người dùng và thông tin giảng viên.

### Quản lý Thiết bị
- **Chức năng**: Thêm, cập nhật, xóa, tìm kiếm và nhập thiết bị qua file CSV.
- **Quản lý theo Phòng**: Gán thiết bị vào phòng, chuyển thiết bị giữa các phòng, theo dõi trạng thái thiết bị (mới, đang mượn, hỏng, v.v.).
- **Mượn/Trả**: Giảng viên có thể mượn/trả thiết bị với ghi nhận trạng thái và lịch sử.
- **Tìm kiếm**: Tìm thiết bị theo tên, loại, trạng thái hoặc phòng học.
- **Báo cáo**: Thống kê thiết bị theo loại, trạng thái, phòng và lịch sử mượn/trả.

### Quản lý Quà tặng
- **Chức năng**: Thêm, cập nhật, xóa, tìm kiếm và nhập quà tặng qua file CSV.
- **Theo dõi Kho**: Quản lý tồn kho quà tặng và xuất quà cho học viên, đối tác hoặc khách.
- **Quy trình Yêu cầu**: Gửi yêu cầu xuất quà qua file PDF, với sự phê duyệt của admin và theo dõi hoàn trả.
- **Thông báo**: Cảnh báo khi kho quà tặng sắp cạn.
- **Báo cáo**: Thống kê tồn kho, lịch sử yêu cầu và xu hướng sử dụng quà tặng.

### Thông báo và Email
- **Thông báo**: Cảnh báo thời gian thực cho các hành động như mượn thiết bị, yêu cầu quà tặng hoặc kho sắp cạn.
- **Email**: Tự động gửi email thông báo khi tạo tài khoản, thay đổi mật khẩu hoặc xác nhận mượn/trả.

### Thống kê và Báo cáo
- **Báo cáo Thiết bị**: Tổng số thiết bị theo loại, trạng thái, phòng và xu hướng mượn.
- **Báo cáo Quà tặng**: Tồn kho, xu hướng yêu cầu và danh sách quà tặng được yêu cầu nhiều nhất.
- **Trực quan hóa**: Biểu đồ cột, đường, tròn để phân tích dữ liệu.

## Công nghệ Sử dụng

| Module          | Công nghệ/Giải pháp       | Mô tả                                                                 |
|-----------------|---------------------------|----------------------------------------------------------------------|
| **Front-end**   | Handlebars                | Công cụ template engine nhẹ, dễ tích hợp với Node.js.                 |
|                 | Bootstrap 5               | Framework CSS đáp ứng, thân thiện trên nhiều thiết bị.                |
| **Back-end**    | Node.js, Express          | Môi trường JavaScript và framework cho phát triển API nhanh chóng.    |
| **Cơ sở dữ liệu** | MongoDB                 | Cơ sở dữ liệu NoSQL mã nguồn mở, linh hoạt và dễ mở rộng.             |
| **Kiến trúc**   | MVC + CQRS                | MVC tổ chức mã rõ ràng, CQRS tách biệt thao tác đọc/ghi.              |
| **Thông báo**   | Node.js (nodemailer)      | Thư viện tích hợp để gửi cảnh báo kho và email thông báo.             |

## Cài đặt

### Yêu cầu
- Node.js
- Git
- MongoDB (cục bộ hoặc trực tuyến)

### Các bước
1. **Tải Mã Nguồn**
   ```bash
   git clone -b https://github.com/LamHueTrung/tn_da21ttc_110121255_LamHueTrung_tdgm.git 
   ```

2. **Di chuyển đến Thư mục Dự án**
   ```bash
   cd Victory_LamHueTrung_TeachingDeviceRewardManager
   ```

3. **Tạo File `.env`**
   Tạo file `.env` trong thư mục gốc với nội dung sau:
   ```
   MONGODB_URI_LOCAL=mongodb://localhost:27017/DeviceRewardManager
   MONGODB_URI_ONLINE=<your-online-mongodb-url>
   JWT_SECRET_KEY=110121255lamhuetrung08012003
   AES_SECRET_KEY=3269ceed2bcea81c3c5c7c6955e991b13269ceed2bcea81c3c5c7c6955e991b1
   AES_IV=46682df79d776d8c46682df79d776d8c
   API_URL=http://localhost:3000
   USERNAME_GOOGLE=lamhuetrung@gmail.com
   APP_PASSWORD_GOOGLE=<your-google-app-password>
   ```

4. **Cài đặt Thư viện**
   ```bash
   npm install
   ```

5. **Chạy Dự án**
   ```bash
   npm start
   ```

6. **Truy cập Hệ thống**
   Mở `http://localhost:3000` trên trình duyệt. Sử dụng tài khoản và mật khẩu hiển thị trên terminal để đăng nhập.

## Cấu trúc Thư mục
- `src/`: Mã nguồn chính
  - `app/`: Chứa controller, middleware, model và kết nối cơ sở dữ liệu
  - `public/`: File công khai (hình ảnh, v.v.)
  - `resources/`: Template giao diện
  - `route/`: Cấu hình định tuyến API
  - `index.js`: Điểm khởi chạy ứng dụng
- `.env`: Biến môi trường (không đưa lên GitHub vì lý do bảo mật)

## Tài liệu API
- Truy cập tại: [https://tdgm-victory.onrender.com/api-docs/](https://tdgm-victory.onrender.com/api-docs/)
- 69 API chia thành 8 nhóm: Người dùng, Thiết bị, Phòng, Giảng viên, Quà tặng, Mượn/Trả, Thống kê, Thông báo.

## Dữ liệu Thử nghiệm
### Người dùng
| Vai trò          | Tài khoản            | Mật khẩu              | Thông tin                           |
|------------------|----------------------|-----------------------|-------------------------------------|
| Quản trị viên    | LamHueTrung          | Lht080103*            | Tên: Lâm Huệ Trung, Email: lamhuetrung@gmail.com |
| Quản lý thiết bị | NhanMinhPhuc         | NhanMinhPhuc*         | Tên: Nhan Minh Phúc, Email: nhanminhphuc@tvu.edu.vn |
| Quản lý quà tặng | NguyenHoangDuyThien  | NguyenHoangDuyThien*  | Tên: Nguyễn Hoàng Duy Thiện, Email: thiennhd@tvu.edu.vn |

### Thiết bị
| Tên                     | Loại            | Số lượng | Mô tả                              |
|-------------------------|-----------------|----------|------------------------------------|
| Remote máy lạnh Daikin  | Khác            | 10       | Điều khiển máy lạnh treo tường     |
| Máy chiếu Epson X500    | Máy chiếu       | 10       | Máy chiếu gắn trần                 |
| Laptop Dell Latitude    | Máy tính        | 10       | Laptop giảng viên trình bày bài giảng |

### Quà tặng
| Tên                     | Loại            | Số lượng | Giá (VNĐ) | Mô tả                           |
|-------------------------|-----------------|----------|-----------|---------------------------------|
| Áo thun sự kiện         | Học viên        | 100      | 120,000   | Áo cotton 100% cho sự kiện      |
| Bình giữ nhiệt In Logo  | Học viên        | 80       | 150,000   | Bình 500ml khắc logo trung tâm  |
| Sổ tay da cao cấp       | Đối tác         | 50       | 200,000   | Sổ tay bìa da in logo Victory   |

