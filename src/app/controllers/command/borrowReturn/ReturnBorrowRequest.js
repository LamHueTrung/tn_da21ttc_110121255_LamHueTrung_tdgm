const BorrowRequest = require("../../../model/BorrowRequest");
const DeviceItem = require("../../../model/DeviceItem");
const Device = require("../../../model/Device");
const Location = require("../../../model/Location");
const Room = require("../../../model/Room");
const messages = require("../../../Extesions/messCost");
const { sendNotification } = require("../../../Extesions/notificationService");
const dotenv = require('dotenv');
dotenv.config();
const sendEmail = require("../../../Extesions/sendEmail");

class ReturnBorrowRequest {
    Handle = async (req, res) => {
        const { borrowRequestId } = req.params;

        try {
            // Kiểm tra xem đơn mượn có tồn tại không
            const borrowRequest = await BorrowRequest.findById(borrowRequestId);
            if (!borrowRequest) {
                return res.status(404).json({
                    success: false,
                    message: messages.borrowRequest.borrowNotFound
                });
            }

            // Nếu đơn mượn đã trả hết rồi
            if (borrowRequest.status === "Đã trả" || borrowRequest.deviceItems.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: messages.borrowRequest.alreadyReturned
                });
            }

            // Lấy "Kho chính"
            const mainWarehouse = await Room.ensureMainWarehouse();
            
            for (const itemId of borrowRequest.deviceItems) {
                const item = await DeviceItem.findById(itemId);
                if (!item) continue;

                // Cập nhật trạng thái `DeviceItem`
                item.status = "Mới";
                item.room = mainWarehouse._id;  // ✅ Gán về "Kho chính" thay vì `null`
                item.location = mainWarehouse.location;  // ✅ Gán về "Kho chính" thay vì `null`
                item.borrowedBy = null;
                await item.save();

                // Cập nhật số lượng thiết bị
                await Device.findByIdAndUpdate(item.device, { $inc: { total_quantity: 1 } });
            }

            // Xóa tất cả `DeviceItem` khỏi đơn mượn
            borrowRequest.deviceItems = [];
            borrowRequest.status = "Đã trả";
            borrowRequest.return_date = new Date();
            await borrowRequest.save();

            // Gửi thông báo 
            const borrowRequests = await BorrowRequest.findById({ _id: borrowRequestId })
                .sort({ created_at: -1 })
                .populate("teacher", "name email phone department")
                .populate("room", "name location")
                .populate({
                    path: "devices.device",
                    select: "name category"
                })
                .populate({
                    path: "deviceItems",
                    populate: { path: "device", select: "name category" }
                })
                .lean();

            // Kiểm tra dữ liệu borrowRequests
            if (!borrowRequests || borrowRequests.length === 0) {
                throw new Error('Không tìm thấy yêu cầu mượn thiết bị.');
            }

            // Kiểm tra và log danh sách thiết bị
            const deviceNames = borrowRequests.devices?.length
                ? borrowRequests.devices.map(device => device.device?.name || 'Không xác định').join(', ')
                : 'Không có thiết bị';
            const deviceQuantities = borrowRequests.devices?.length
                ? borrowRequests.devices.map(device => device.quantity || '0').join(', ')
                : '0';

            console.log("Danh sách thiết bị:", deviceNames);

            await sendNotification({
                title: "Trả thiết bị",
                description: `Đơn mượn thiết bị ${deviceNames} xác nhận đã trả.`,
                url: `borrowRepay/home`,
                role: "device_manager",
                type: "success"
            });

            // Gửi email thông báo
            await sendEmail({
                to: borrowRequests.teacher?.email,
                subject: 'HỆ THỐNG QUẢN LÝ THIẾT BỊ & QUÀ TẶNG - VICTORY',
                html: `
                    <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #2a2a2a; margin: 40px auto; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.3);">
                        <!-- Header -->
                        <tr>
                            <td align="center" bgcolor="#c0392b" style="padding: 30px 20px; border-bottom: 3px solid #e74c3c;">
                                <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold; letter-spacing: 1px;">THÔNG BÁO MƯỢN THIẾT BỊ</h1>
                            </td>
                        </tr>
                        <!-- Main Content -->
                        <tr>
                            <td style="padding: 30px 25px;">
                                <h2 style="color: #e74c3c; font-size: 22px; margin-top: 0;">Xin chào,</h2>
                                <p style="font-size: 16px; line-height: 1.6; color: #cccccc; margin-bottom: 20px;">Giảng viên <strong>${borrowRequests.teacher?.name || 'Không xác định'}</strong> đã trả thiết bị mượn cá nhân.</p>
                                <p style="font-size: 16px; line-height: 1.6; color: #cccccc; margin-bottom: 20px;">Thông tin chi tiết:</p>
                                <table width="100%" border="0" cellspacing="0" cellpadding="10" style="background-color: #3a3a3a; border-radius: 6px; margin-bottom: 20px;">
                                    <tr>
                                        <td style="font-size: 16px; color: #e74c3c; font-weight: bold; border-bottom: 1px solid #444444;">Giảng viên:</td>
                                        <td style="font-size: 16px; color: #ffffff; border-bottom: 1px solid #444444;">${borrowRequests.teacher?.name || 'Không xác định'}</td>
                                    </tr>
                                    <tr>
                                        <td style="font-size: 16px; color: #e74c3c; font-weight: bold; border-bottom: 1px solid #444444;">Thiết bị:</td>
                                        <td style="font-size: 16px; color: #ffffff; border-bottom: 1px solid #444444;">${deviceNames}</td>
                                    </tr>
                                    <tr>
                                        <td style="font-size: 16px; color: #e74c3c; font-weight: bold;">Số lượng:</td>
                                        <td style="font-size: 16px; color: #ffffff;">${deviceQuantities}</td>
                                    </tr>
                                </table>
                                <p style="font-size: 16px; line-height: 1.6; color: #cccccc; margin-bottom: 20px;">Vui lòng kiểm tra hệ thống để biết thêm chi tiết.</p>
                                <p style="font-size: 16px; line-height: 1.6; color: #cccccc; margin-bottom: 20px;">Thời gian gửi: ${new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}</p>
                            </td>
                        </tr>
                        <!-- Footer -->
                        <tr>
                            <td align="center" style="padding: 20px; font-size: 12px; color: #999999; border-top: 1px solid #444444; background-color: #222222;">
                                <p style="margin: 0;">© 2025 Lâm Huệ Trung. Đã đăng ký bản quyền.</p>
                                <p style="margin: 5px 0 0;">Liên hệ: <a href="mailto:lamhuetrung@gmail.com" style="color: #e74c3c; text-decoration: none;">lamhuetrung@gmail.com</a> | Tel: +84 076 384 9007</p>
                            </td>
                        </tr>
                    </table>
                `
            });

            return res.status(200).json({
                success: true,
                message: messages.borrowRequest.returnSuccess,
                borrowRequest
            });

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: messages.borrowRequest.returnError,
                error: error.message
            });
        }
    };
}

module.exports = new ReturnBorrowRequest();
