const Room = require("../../model/Room");
const DeviceItem = require("../../model/DeviceItem");
const messages = require("../../Extesions/messCost");

class DeviceToRoomQuery {
    
    async Index(req, res, next) {
        res.render("pages/deviceToRoom", { layout: "main" });
    }

    async ViewDevices(req, res, next) {
        res.render("pages/viewDeviceToRoom", { layout: "main" });
    }

    async AddDevices(req, res, next) {
        res.render("pages/addDeviceToRoom", { layout: "main" });
    }

    /**
     * Lấy danh sách tất cả phòng học.
     * @param {Object} req - Request từ client.
     * @param {Object} res - Response trả về danh sách phòng.
     */
    async GetAllRooms(req, res) {
        try {
            const rooms = await Room.find()
                .populate("location", "name description")
                .lean();
            
            return res.status(200).json({
                success: true,
                message: messages.room.getAllSuccess,
                rooms
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: messages.room.getAllError,
                error: error.message
            });
        }
    }

    /**
     * Lấy thông tin chi tiết của một phòng học theo ID.
     * @param {Object} req - Request từ client.
     * @param {Object} res - Response trả về thông tin phòng và danh sách thiết bị.
     */
    async GetRoomById(req, res) {
        const { roomId } = req.params;

        try {
            const room = await Room.findById(roomId)
                .populate("location", "name description")
                .populate({
                    path: "deviceItems",
                    populate: {
                        path: "device",
                        select: "name category status"
                    }
                })
                .lean();

            if (!room) {
                return res.status(404).json({
                    success: false,
                    message: messages.room.roomNotFound
                });
            }

            // Lấy danh sách chi tiết thiết bị trong phòng
            const deviceItems = await DeviceItem.find({ room: roomId })
                .populate("device", "name category status")
                .select("status last_maintenance created_at")
                .lean();

            return res.status(200).json({
                success: true,
                message: messages.room.getByIdSuccess,
                room: {
                    ...room,
                    devices: deviceItems // Gán danh sách thiết bị vào phòng
                }
            });

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: messages.room.getByIdError,
                error: error.message
            });
        }
    }

    /**
     * API lấy danh sách tất cả thiết bị trong một phòng học.
     * @param {Object} req - Request từ client.
     * @param {Object} res - Response trả về danh sách thiết bị.
     */
    GetAllDeviceToRoom = async (req, res) => {
        const { roomId } = req.params;

        try {
            // Kiểm tra xem phòng có tồn tại không
            const room = await Room.findById(roomId).populate("location", "name description");
            if (!room) {
                return res.status(404).json({
                    success: false,
                    message: messages.room.roomNotFound
                });
            }

            // Lấy danh sách thiết bị trong phòng
            const devices = await DeviceItem.find({ room: roomId })
                .populate("device", "name category status")
                .select("status last_maintenance created_at")
                .lean();

            return res.status(200).json({
                success: true,
                message: messages.room.getDevicesSuccess,
                room: {
                    _id: room._id,
                    name: room.name,
                    location: room.location,
                    devices
                }
            });

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: messages.room.getDevicesError,
                error: error.message
            });
        }
    };
}

module.exports = new DeviceToRoomQuery();
