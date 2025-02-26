# HỆ THỐNG QUẢN LÝ THIẾT BỊ DẠY HỌC VÀ QUÀ TẶNG
## Trung tâm Ngoại ngữ Tin học Victory, Đại học Trà Vinh

## 1. Giới thiệu
Hệ thống được thiết kế để quản lý thiết bị dạy học và quà thưởng tại Trung tâm Ngoại ngữ Tin học Victory. Nó bao gồm các tính năng quản lý thiết bị theo phòng, chuyển thiết bị giữa các phòng, thống kê tình trạng thiết bị, quản lý thiết bị cho mượn và trả, cùng với các chức năng báo cáo thống kê về thiết bị và quà thưởng. Hệ thống hỗ trợ phân quyền người dùng, tìm kiếm thiết bị và thông báo khi kho thiết bị hoặc quà thưởng sắp hết.

## 2. Đối tượng người dùng
### **Admin**
- Quản trị viên hệ thống, có quyền cao nhất.
- Quản lý tất cả các hoạt động như tài khoản người dùng, thiết bị, kho quà thưởng, mượn trả thiết bị và báo cáo thống kê.

### **Giáo viên**
- Có thể mượn và trả thiết bị.
- Theo dõi tình trạng thiết bị và quản lý thông tin cá nhân.

## 3. Các tính năng chính của hệ thống
### 3.1. Quản lý tài khoản người dùng
- Tạo, sửa, xóa tài khoản người dùng.
- Phân quyền người dùng theo vai trò: Admin, Giáo viên.
- Quản lý trạng thái tài khoản: kích hoạt, khóa tài khoản khi cần thiết.

### 3.2. Quản lý thiết bị
- **Quản lý theo phòng**: Xem thông tin thiết bị theo từng phòng học.
- **Chuyển thiết bị giữa các phòng**: Di chuyển thiết bị từ phòng này sang phòng khác và ghi nhận lịch sử chuyển thiết bị.
- **Thống kê tình trạng thiết bị**: Quản lý và thống kê tình trạng thiết bị (mới, hỏng, cần bảo trì, cho mượn).
- **Thiết bị cho mượn và trả**: Giáo viên có thể mượn và trả thiết bị, hệ thống ghi nhận tình trạng thiết bị khi trả lại.
- **Tìm kiếm thiết bị**: Theo tên, loại, tình trạng hoặc phòng học.
- **Thống kê thiết bị theo loại**: Cung cấp báo cáo thống kê theo loại thiết bị (máy tính, máy chiếu, bảng trắng, v.v.).
- **Lịch sử mượn và trả thiết bị**: Lưu trữ lịch sử mượn và trả thiết bị của từng người dùng.
- **Thông báo mượn/trả thiết bị**: Cung cấp thông báo khi thiết bị gần hết hạn trả hoặc cần bảo trì.

### 3.3. Quản lý quà tặng
- **Quản lý nhập, xuất và tồn kho quà tặng**.
- **Xuất quà thưởng** cho học viên có thành tích xuất sắc, đối tác và khách đến làm việc.
- **Thông báo khi quà tặng gần hết** (số lượng < 30).
- **Chức năng import/export file PDF** cho các giao dịch quà tặng.

### 3.4. Báo cáo và thống kê
- **Báo cáo thiết bị**: Thống kê tình trạng thiết bị (hỏng, cho mượn, cần bảo trì).
- **Báo cáo kho thiết bị**: Thống kê số lượng thiết bị trong kho, giao dịch nhập xuất.
- **Báo cáo mượn trả thiết bị**: Thống kê theo thời gian, tình trạng thiết bị khi trả lại.
- **Báo cáo thống kê thiết bị theo loại**: Máy tính, máy chiếu, bảng trắng, v.v.
- **Báo cáo kho quà thưởng**: Thống kê số lượng quà thưởng trong kho, giao dịch nhập xuất.

## 4. Công nghệ sử dụng
- **Backend**: Node.js, Express.js
- **Frontend**: React.js / Handlebars (nếu cần dùng template server-side)
- **Database**: MySQL / MongoDB
- **Authentication**: JWT / OAuth
- **Thông báo & Lưu trữ**: Firebase (nếu cần push notification)

## 5. Cách cài đặt và chạy hệ thống
### Yêu cầu hệ thống
- **Node.js** >= 14
- **MySQL / MongoDB** (tùy vào lựa chọn database)
- **Git** (nếu dùng để quản lý mã nguồn)

### Cài đặt và khởi chạy
```sh
# Clone repository
git clone https://github.com/your-repo/device-management.git
cd device-management

# Cài đặt các package cần thiết
npm install

# Cấu hình database trong .env
DB_HOST=localhost
DB_USER=root
DB_PASS=yourpassword
DB_NAME=device_management

# Chạy server
npm start

# Truy cập hệ thống trên trình duyệt
go to http://localhost:3000
```

## 6. Liên hệ
Nếu có bất kỳ vấn đề nào trong quá trình sử dụng, vui lòng liên hệ:
📧 Email: 110121255@st.tvu.edu.vn  
📌 Địa chỉ: Đại học Trà Vinh  
☎️ Số điện thoại: 076-384-9007  

---
**© 2024 Trung tâm Ngoại ngữ Tin học Victory, Đại học Trà Vinh. All rights reserved.**
