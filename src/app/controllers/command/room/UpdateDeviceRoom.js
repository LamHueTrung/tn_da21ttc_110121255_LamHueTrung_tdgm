const Room = require("../../../model/Room");
const DeviceItem = require("../../../model/DeviceItem");
const messages = require("../../../Extesions/messCost");

class UpdateDeviceRoom {
    /**
     * API chuyển thiết bị từ phòng này sang phòng khác.
     * @param {Object} req - Request từ client.
     * @param {Object} res - Response trả về kết quả cập nhật.
     */
    Handle = async (req, res) => {
        const { deviceItemId, toRoomId } = req.body;

        try {
            // Kiểm tra xem thiết bị có tồn tại không
            const deviceItem = await DeviceItem.findById(deviceItemId);
            if (!deviceItem) {
                return res.status(404).json({
                    success: false,
                    message: messages.device.deviceNotFound
                });
            }

            // Kiểm tra xem phòng hiện tại của thiết bị có tồn tại không
            const fromRoom = await Room.findById(deviceItem.room);
            if (!fromRoom) {
                return res.status(404).json({
                    success: false,
                    message: messages.room.roomNotFound
                });
            }

            // Kiểm tra xem phòng đích có tồn tại không
            const toRoom = await Room.findById(toRoomId);
            if (!toRoom) {
                return res.status(404).json({
                    success: false,
                    message: messages.room.toRoomNotFound
                });
            }

            // Kiểm tra xem thiết bị đã ở trong phòng đích chưa
            if (toRoom.deviceItems.includes(deviceItemId)) {
                return res.status(400).json({
                    success: false,
                    message: messages.device.alreadyInRoom
                });
            }

            // Kiểm tra trạng thái thiết bị (Không cho phép di chuyển thiết bị "Hỏng" hoặc "Bảo trì")
            if (["Hỏng", "Bảo trì"].includes(deviceItem.status)) {
                return res.status(400).json({
                    success: false,
                    message: messages.device.cannotMove
                });
            }

            // **Xóa thiết bị khỏi phòng nguồn**
            fromRoom.deviceItems = fromRoom.deviceItems.filter(item => item.toString() !== deviceItemId);
            await fromRoom.save();

            // **Thêm thiết bị vào phòng đích**
            toRoom.deviceItems.push(deviceItemId);
            await toRoom.save();

            // **Cập nhật phòng và vị trí của thiết bị**
            deviceItem.room = toRoom._id;
            deviceItem.location = toRoom.location;
            await deviceItem.save();

            return res.status(200).json({
                success: true,
                message: messages.device.moveSuccess,
                updatedDeviceItem: {
                    _id: deviceItem._id,
                    status: deviceItem.status,
                    location: toRoom.location,
                    room: toRoom._id
                }
            });

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: messages.device.moveError,
                error: error.message
            });
        }
    };
}

module.exports = new UpdateDeviceRoom();
