# HỆ THỐNG QUẢN LÝ THIẾT BỊ DẠY HỌC VÀ QUÀ TẶNG  
## TRUNG TÂM NGOẠI NGỮ TIN HỌC VICTORY, ĐẠI HỌC TRÀ VINH  

### Tổng quan hệ thống  
Hệ thống được thiết kế để quản lý thiết bị dạy học và quà thưởng tại Trung tâm Ngoại ngữ Tin học Victory. Nó bao gồm các tính năng quản lý thiết bị theo phòng, chuyển thiết bị giữa các phòng, thống kê tình trạng thiết bị, quản lý thiết bị cho mượn và trả, cùng với các chức năng báo cáo thống kê về thiết bị và quà thưởng. Hệ thống hỗ trợ phân quyền người dùng, tìm kiếm thiết bị và thông báo khi kho thiết bị hoặc quà thưởng sắp hết.

### Đối tượng người dùng  
- **Admin**: Quản trị viên hệ thống, có quyền cao nhất, quản lý tất cả các hoạt động của hệ thống như tài khoản người dùng, thiết bị, kho quà thưởng, mượn trả thiết bị và báo cáo thống kê.  
- **Giáo viên**: Mượn và trả thiết bị, theo dõi tình trạng thiết bị, và quản lý thông tin cá nhân.  

### Các tính năng của hệ thống  
#### 1. Quản lý tài khoản người dùng  
- Tạo, sửa, xóa tài khoản người dùng.  
- Phân quyền người dùng theo vai trò: Admin, Giáo viên.  
- Quản lý trạng thái tài khoản: kích hoạt, khóa tài khoản khi cần thiết.  

#### 2. Quản lý thiết bị  
- **Quản lý theo phòng**: Quản lý thiết bị theo phòng học, bao gồm thông tin về số lượng và loại thiết bị. Cung cấp giao diện để xem thông tin thiết bị theo từng phòng học.  
- **Chuyển thiết bị giữa các phòng**: Cho phép di chuyển thiết bị từ phòng này sang phòng khác. Quản lý lịch sử chuyển thiết bị.  
- **Thống kê tình trạng thiết bị**: Quản lý và thống kê tình trạng thiết bị (mới, hỏng, cần bảo trì, cho mượn).  
- **Thiết bị cho mượn và trả**: Giáo viên có thể mượn và trả thiết bị. Hệ thống ghi nhận tình trạng thiết bị khi trả lại (tốt, hỏng). Lưu trữ lịch sử mượn và trả thiết bị.  
- **Tìm kiếm thiết bị**: Tính năng tìm kiếm thiết bị theo tên, loại, tình trạng hoặc phòng học.  
- **Thống kê thiết bị theo loại**: Cung cấp báo cáo thống kê theo loại thiết bị (máy tính, máy chiếu, bảng trắng, v.v.).  
- **Theo dõi việc mượn và trả thiết bị**: Hệ thống ghi nhận tình trạng thiết bị khi trả lại.  
- **Lịch sử mượn và trả thiết bị**: Lưu trữ lịch sử mượn và trả thiết bị của từng người dùng, giúp dễ dàng theo dõi và quản lý.  
- **Thông báo mượn/trả thiết bị**: Cung cấp thông báo khi thiết bị gần hết hạn trả hoặc cần bảo trì.  

#### 3. Quản lý quà tặng  
- **Quản lý nhập và xuất và tình trạng tồn kho quà tặng**  
- **Xuất quà thưởng** cho học viên có thành tích xuất sắc, được vinh danh.  
- **Xuất quà tặng** cho đối tác, khách đến làm việc.  
- **Thông báo khi các loại quà tặng gần hết** (số lượng <30): Hệ thống sẽ tự động thông báo khi kho thiết bị hoặc kho quà thưởng gần hết, giúp Admin kịp thời đặt mua bổ sung.  
- **Chức năng import file PDF** đề nghị xuất quà tặng, xuất file xuất quà….  

#### 4. Báo cáo và thống kê  
- **Báo cáo thiết bị**: Thống kê tình trạng thiết bị (thiết bị hỏng, thiết bị cho mượn, cần bảo trì).  
- **Báo cáo kho thiết bị**: Thống kê số lượng thiết bị trong kho, các giao dịch nhập xuất kho.  
- **Báo cáo mượn trả thiết bị**: Thống kê mượn và trả thiết bị theo thời gian, tình trạng thiết bị khi trả lại.  
- **Báo cáo thống kê thiết bị theo loại**: Cung cấp báo cáo thiết bị theo loại (máy tính, máy chiếu, bảng trắng, v.v.) để dễ dàng quản lý và phân bổ thiết bị.  
- **Báo cáo kho quà thưởng**: Thống kê số lượng quà thưởng trong kho, các giao dịch nhập xuất kho.  
