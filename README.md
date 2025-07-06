
# HỆ THỐNG QUẢN LÝ THIẾT BỊ DẠY HỌC VÀ QUÀ TẶNG

## TRUNG TÂM NGOẠI NGỮ TIN HỌC VICTORY - ĐẠI HỌC TRÀ VINH

### 1. Tổng quan hệ thống
Hệ thống được thiết kế để quản lý thiết bị dạy học và quà thưởng tại Trung tâm Ngoại ngữ Tin học Victory. Hệ thống hỗ trợ:
- Quản lý thiết bị theo phòng
- Chuyển thiết bị giữa các phòng
- Thống kê tình trạng thiết bị
- Quản lý mượn và trả thiết bị
- Báo cáo thống kê về thiết bị và quà thưởng
- Phân quyền người dùng
- Tìm kiếm thiết bị
- Thông báo khi kho thiết bị hoặc quà thưởng sắp hết

### 2. Đối tượng người dùng
#### a. Admin
- Quản trị viên hệ thống, có quyền cao nhất
- Quản lý tài khoản người dùng, thiết bị, kho quà thưởng
- Quản lý mượn trả thiết bị và báo cáo thống kê

#### b. Giáo viên
- Mượn và trả thiết bị
- Theo dõi tình trạng thiết bị
- Quản lý thông tin cá nhân

### 3. Các tính năng chính

#### 3.1. Quản lý tài khoản người dùng
- Tạo, sửa, xóa tài khoản người dùng
- Phân quyền theo vai trò: Admin, Giáo viên
- Quản lý trạng thái tài khoản: kích hoạt, khóa tài khoản khi cần thiết

#### 3.2. Quản lý thiết bị
- **Quản lý theo phòng:**
  - Theo dõi thiết bị theo từng phòng học
  - Hiển thị thông tin về số lượng và loại thiết bị
- **Chuyển thiết bị giữa các phòng:**
  - Di chuyển thiết bị từ phòng này sang phòng khác
  - Lưu lịch sử chuyển thiết bị
- **Thống kê tình trạng thiết bị:**
  - Quản lý tình trạng thiết bị (mới, hỏng, cần bảo trì, cho mượn)
- **Thiết bị cho mượn và trả:**
  - Giáo viên có thể mượn và trả thiết bị
  - Ghi nhận tình trạng thiết bị khi trả lại (tốt, hỏng)
  - Lưu trữ lịch sử mượn và trả thiết bị
- **Tìm kiếm thiết bị:**
  - Tìm kiếm theo tên, loại, tình trạng hoặc phòng học
- **Thống kê thiết bị theo loại:**
  - Cung cấp báo cáo thống kê theo loại thiết bị (máy tính, máy chiếu, bảng trắng,...)
- **Thông báo mượn/trả thiết bị:**
  - Gửi thông báo khi thiết bị gần hết hạn trả hoặc cần bảo trì

#### 3.3. Quản lý quà tặng
- **Quản lý kho quà tặng:**
  - Nhập, xuất và theo dõi số lượng quà tặng
- **Xuất quà tặng:**
  - Thưởng cho học viên có thành tích xuất sắc
  - Tặng quà cho đối tác, khách làm việc
- **Thông báo khi quà tặng gần hết:**
  - Cảnh báo khi số lượng quà tặng dưới 30
- **Hỗ trợ import/xuất file:**
  - Import file PDF đề nghị xuất quà tặng
  - Xuất file danh sách xuất quà

#### 3.4. Báo cáo và thống kê
- **Báo cáo thiết bị:**
  - Thống kê tình trạng thiết bị (hỏng, cho mượn, cần bảo trì)
- **Báo cáo kho thiết bị:**
  - Thống kê số lượng thiết bị trong kho và lịch sử nhập xuất
- **Báo cáo mượn trả thiết bị:**
  - Thống kê theo thời gian, tình trạng thiết bị khi trả lại
- **Báo cáo thiết bị theo loại:**
  - Thống kê theo danh mục thiết bị
- **Báo cáo kho quà tặng:**
  - Thống kê số lượng quà tặng và lịch sử nhập xuất

### 4. Công nghệ sử dụng
- **Backend:** Node.js & Express.js
- **Frontend:** handlebar & boostrap 5
- **Database:** MongoDB
- **Authentication:** JWT
- **API:** RESTful
- **Mô hình kiến trúc:** MVC
