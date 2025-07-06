const fs = require("fs");
const path = require("path");
const Devices = require("../../../model/Device");
const DeviceItem = require("../../../model/DeviceItem");
const messages = require("../../../Extesions/messCost");
const Room = require("../../../model/Room");
const { sendNotification } = require("../../../Extesions/notificationService");

/**
 * Class DeleteDevice - Xử lý API xóa thiết bị
 */
class DeleteDevice {
    /**
     * Xử lý API xóa thiết bị
     * @param {Object} req - Request từ client
     * @param {Object} res - Response để trả JSON
     */
    Handle = async (req, res) => {
        const { deviceId } = req.params; // Lấy deviceId từ URL

        try {
            // Kiểm tra xem thiết bị có tồn tại không
            const device = await Devices.findById(deviceId);
            if (!device) {
                return res.status(404).json({
                    success: false,
                    message: messages.deleteDevice.deviceNotFound,
                });
            }

            // Kiểm tra các DeviceItem có trạng thái 'Hoạt động' hoặc 'Đang sử dụng'
            const activeDeviceItems = await DeviceItem.find({
                device: deviceId,
                status: { $in: ['Hoạt động', 'Đang sử dụng'] }
            });

            if (activeDeviceItems.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Không thể xóa thiết bị vì có thiết bị đang được sử dụng hoặc hoạt động.',
                });
            }

            // Xóa tất cả `DeviceItem` liên quan đến thiết bị
            await DeviceItem.deleteMany({ device: deviceId });

            // Xóa tất cả hình ảnh liên quan đến thiết bị
            if (device.images && device.images.length > 0) {
                device.images.forEach((imagePath) => {
                    const fullImagePath = path.join(__dirname, "../../../../public", imagePath);
                    if (fs.existsSync(fullImagePath)) {
                        fs.unlinkSync(fullImagePath);
                    }
                });
            }

            // Xóa thiết bị khỏi database
            await Devices.findByIdAndDelete(deviceId);

            // Gửi thông báo đến người dùng
            await sendNotification({
                title: `Thiết bị "${device.name}" đã bị xoá.`,
                description: `Thiết bị "${device.name}" đã được xoá khỏi hệ thống.`,
                url: "/deviceManger/home",
                role: "device_manager",
                type: "warning",
            });

            return res.status(200).json({
                success: true,
                message: messages.deleteDevice.deviceDeleteSuccess,
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: messages.deleteDevice.deleteError,
                error: error.message,
            });
        }
    };
}

module.exports = new DeleteDevice();
