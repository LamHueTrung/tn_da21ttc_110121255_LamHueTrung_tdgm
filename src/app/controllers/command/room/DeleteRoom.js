const Room = require("../../../model/Room");
const DeviceItem = require("../../../model/DeviceItem");
const Device = require("../../../model/Device");
const Location = require("../../../model/Location");
const messages = require("../../../Extesions/messCost");
const { sendNotification } = require("../../../Extesions/notificationService");

class DeleteRoom {
    /**
     * API xóa phòng học.
     * @param {Object} req - Request từ client.
     * @param {Object} res - Response trả về kết quả xóa.
     */
    Handle = async (req, res) => {
        const { roomId } = req.params;

        try {
            // Kiểm tra xem phòng có tồn tại không
            const room = await Room.findById(roomId);
            if (!room) {
                return res.status(404).json({
                    success: false,
                    message: messages.room.roomNotFound
                });
            }

            // Lấy danh sách thiết bị trong phòng
            const deviceItems = await DeviceItem.find({ room: roomId });

            if (deviceItems.length > 0) {
                // Xác định "Kho chính"
                let mainWarehouse = await Location.findOne({ name: "Kho chính" });
                if (!mainWarehouse) {
                    mainWarehouse = await Location.create({
                        name: "Kho chính",
                        description: "Kho mặc định cho thiết bị"
                    });
                }

                // Cập nhật lại location, room và status của thiết bị
                for (let deviceItem of deviceItems) {
                    // Cập nhật thiết bị về kho chính
                    deviceItem.room = null;
                    deviceItem.location = mainWarehouse._id;
                    deviceItem.status = "Hoạt động";
                    await deviceItem.save();

                    // Cập nhật lại tổng số lượng thiết bị trong `Device`
                    await Device.findByIdAndUpdate(deviceItem.device, { 
                        $inc: { total_quantity: 1 } 
                    });
                }
            }

            // Xóa phòng học
            await Room.findByIdAndDelete(roomId);

            // **Cập nhật lại số lượng phòng trong Location**
            if (room.location) {
                const roomsAtLocation = await Room.countDocuments({ location: room.location });
                await Location.findByIdAndUpdate(room.location, {
                    total_rooms: roomsAtLocation // Cập nhật lại số phòng còn lại
                });
            }

            // Gửi thông báo cho người dùng
            await sendNotification({
                title: "Phòng học đã bị xóa",
                description: `Phòng học "${room.name}" đã bị xóa thành công.`,
                url: `/deviceToRoom/home`,
                role: "device_manager",
                type: "warning"
            });
            
            return res.status(200).json({
                success: true,
                message: messages.room.deleteSuccess
            });

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: messages.room.deleteError,
                error: error.message
            });
        }
    };
}

module.exports = new DeleteRoom();
