const Room = require("../../../model/Room");
const DeviceItem = require("../../../model/DeviceItem");
const Device = require("../../../model/Device");
const messages = require("../../../Extesions/messCost");
const Validator = require("../../../Extesions/validator");
const { sendNotification } = require("../../../Extesions/notificationService");

class AssignDeviceToRoom {
    /**
     * API thêm thiết bị vào phòng học
     */
    Handle = async (req, res) => {
        const { roomId } = req.params;
        const { deviceId, quantity } = req.body; // Nhận ID của thiết bị và số lượng cần thêm

        try {
            // Kiểm tra phòng có tồn tại không
            const room = await Room.findById(roomId);
            if (!room) {
                return res.status(404).json({
                    success: false,
                    message: messages.room.roomNotFound
                });
            }

            if( Validator.notNull(deviceId, 'ID thiết bị') 
                || Validator.notNull(roomId,'ID phòng')) {
                return res.status(400).json({
                    success: false,
                    message: messages.assignDevice.invalidRequest
                });
            }
            
            if(Validator.greaterThan(quantity, 0, 'Số lượng mượn')) {
                return res.status(400).json({
                    success: false,
                    message: Validator.greaterThan(quantity, 0, 'Số lượng mượn')
                });
            }

            // Tìm `DeviceItem` có `deviceId` với `status: "Mới"` hoặc `"Hoạt động"`
            const availableDeviceItems = await DeviceItem.find({
                device: deviceId,
                status: { $in: ["Mới", "Hoạt động"] }
            }).limit(quantity);

            if (Validator.greaterThan(availableDeviceItems.length, quantity, 'Số lượng thiết bị mượn')) {
                return res.status(400).json({
                    success: false,
                    message: messages.assignDevice.notEnoughDevices
                });
            }

            // Cập nhật `status`, `location`, `room` cho các `DeviceItem` được chọn
            const updatedDeviceItemIds = [];
            for (let deviceItem of availableDeviceItems) {
                deviceItem.status = "Đang sử dụng";
                deviceItem.location = room.location; // Cập nhật location theo phòng
                deviceItem.room = room._id; // **Cập nhật room chính xác**
                updatedDeviceItemIds.push(deviceItem._id);
                await deviceItem.save();
            }

            // Thêm `DeviceItem` vào danh sách thiết bị trong phòng
            room.deviceItems.push(...updatedDeviceItemIds);
            await room.save();

            const device = await Device.findById(deviceId);
            // Gửi thông báo cho người dùng
            await sendNotification({
                title: "Phòng học cập nhật thiết bị",
                description: `Thiết bị ${device.name} đã được thêm vào phòng học "${room.name}".`,
                url: `/deviceToRoom/viewDevices/${room._id}`,
                role: "device_manager",
                type: "info"
            });

            return res.status(200).json({
                success: true,
                message: messages.assignDevice.success,
                assignedDevices: updatedDeviceItemIds,
                room
            });

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: messages.assignDevice.error,
                error: error.message
            });
        }
    };
}

module.exports = new AssignDeviceToRoom();
