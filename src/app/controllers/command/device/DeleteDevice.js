const fs = require("fs");
const path = require("path");
const Devices = require("../../../model/Device");
const DeviceItem = require("../../../model/DeviceItem");
const messages = require("../../../Extesions/messCost");
const Room = require("../../../model/Room");

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
