const Room = require("../../../model/Room");
const DeviceItem = require("../../../model/DeviceItem");
const Device = require("../../../model/Device");
const Location = require("../../../model/Location");
const messages = require("../../../Extesions/messCost");

class RemoveDeviceFromRoom {
    /**
     * API xóa thiết bị khỏi phòng học.
     * @param {Object} req - Request từ client.
     * @param {Object} res - Response trả về kết quả xóa thiết bị.
     */
    Handle = async (req, res) => {
        const { roomId } = req.params;
        const { deviceItemId } = req.body; // Nhận ID của thiết bị cần xóa
        
        console.log("roomId: ", roomId);
        console.log("deviceItemId: ", req.body);
        try {
            // Kiểm tra xem phòng có tồn tại không
            const room = await Room.findById(roomId);
            if (!room) {
                return res.status(404).json({
                    success: false,
                    message: messages.room.roomNotFound
                });
            }

            // Kiểm tra thiết bị có tồn tại trong phòng không
            const deviceItem = await DeviceItem.findById(deviceItemId);
            if (!deviceItem || !room.deviceItems.includes(deviceItemId)) {
                return res.status(404).json({
                    success: false,
                    message: messages.device.deviceNotFoundInRoom
                });
            }

            // Tìm thiết bị cha (Device)
            const device = await Device.findById(deviceItem.device);
            if (!device) {
                return res.status(404).json({
                    success: false,
                    message: messages.device.deviceNotFound
                });
            }

            // Lấy vị trí "Kho chính"
            let mainWarehouse = await Location.findOne({ name: "Kho chính" });
            if (!mainWarehouse) {
                mainWarehouse = await Location.create({ name: "Kho chính", description: "Kho mặc định cho thiết bị" });
            }

            // Cập nhật trạng thái, vị trí và phòng của thiết bị
            deviceItem.status = "Hoạt động";
            deviceItem.location = mainWarehouse._id;
            deviceItem.room = mainWarehouse._id; // Cập nhật phòng thành Kho chính thay vì null
            await deviceItem.save();

            // Xóa thiết bị khỏi danh sách trong phòng
            room.deviceItems = room.deviceItems.filter(item => item.toString() !== deviceItemId);
            await room.save();

            // **Cập nhật total_quantity trong Device**
            device.total_quantity += 1; // Tăng số lượng thiết bị có sẵn
            await device.save();

            return res.status(200).json({
                success: true,
                message: messages.device.removeSuccess,
                updatedDeviceItem: deviceItem,
                updatedDevice: {
                    _id: device._id,
                    name: device.name,
                    total_quantity: device.total_quantity
                }
            });

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: messages.device.removeError,
                error: error.message
            });
        }
    };
}

module.exports = new RemoveDeviceFromRoom();
