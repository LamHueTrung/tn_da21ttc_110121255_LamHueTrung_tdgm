const Devices = require("../../model/Device");
const DeviceItem = require("../../model/DeviceItem");
const Room = require("../../model/Room");
const messages = require("../../Extesions/messCost");

class DeviceManagerQuery {
    async Index(req, res, next) {
        try {
            // Lấy danh sách thiết bị
            const devices = await Devices.find().sort({ updated_at: -1 }).lean();
            // Lấy tổng số lượng `DeviceItem` theo thiết bị
            const deviceIds = devices.map((device) => device._id);
            const deviceItems = await DeviceItem.aggregate([
                { $match: { device: { $in: deviceIds } } },
                { $group: { _id: "$device", count: { $sum: 1 } } }
            ]);

            // Lấy thông tin Room của từng `DeviceItem`
            const deviceItemsWithRooms = await DeviceItem.find({ device: { $in: deviceIds } })
                .populate({
                    path: "room",
                    populate: { path: "location", select: "name" } // Lấy `location` của `room`
                })
                .lean();

            // Gán thông tin vào danh sách thiết bị
            const devicesWithCounts = devices.map((device) => {
                const itemCount = deviceItems.find((item) => item._id.equals(device._id));
                const relatedRooms = deviceItemsWithRooms
                    .filter((item) => item.device.equals(device._id))
                    .map((item) => ({
                        room: item.room?.name || "Không xác định",
                        location: item.room?.location?.name || "Không xác định",
                        count: 1
                    }));

                return {
                    ...device,
                    total_items: itemCount ? itemCount.count : 0, 
                    rooms: relatedRooms
                };
            });

            return res.status(200).render("pages/deviceManager", { 
                layout: "main",
                success: true,
                message: messages.getDevice.getAllSuccess,
                devices: devicesWithCounts
            });
            
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: messages.getDevice.getAllError,
                error: error.message
            });
        }
        
    }

    async AddDevice(req, res, next) {
        res.status(200).render("pages/addDevice", { layout: "main" });
    }

    async UpdateDevice(req, res, next) {
        res.status(200).render("pages/updateDevice", { layout: "main" });
    }
    
    /**
     * Lấy danh sách tất cả thiết bị, bao gồm số lượng và phòng chứa
     */
    async GetAllDevices(req, res) {
        try {
            // Lấy danh sách thiết bị
            const devices = await Devices.find().sort({ updated_at: -1 }).lean();

            // Lấy tổng số lượng `DeviceItem` theo thiết bị
            const deviceIds = devices.map((device) => device._id);
            const deviceItems = await DeviceItem.aggregate([
                { $match: { device: { $in: deviceIds } } },
                { $group: { _id: "$device", count: { $sum: 1 } } }
            ]);

            // Lấy thông tin Room của từng `DeviceItem`
            const deviceItemsWithRooms = await DeviceItem.find({ device: { $in: deviceIds } })
                .populate({
                    path: "room",
                    populate: { path: "location", select: "name" } // Lấy `location` của `room`
                })
                .lean();

            // Gán thông tin vào danh sách thiết bị
            const devicesWithCounts = devices.map((device) => {
                const itemCount = deviceItems.find((item) => item._id.equals(device._id));
                const relatedRooms = deviceItemsWithRooms
                    .filter((item) => item.device.equals(device._id))
                    .map((item) => ({
                        room: item.room?.name || "Không xác định",
                        location: item.room?.location?.name || "Không xác định",
                        count: 1
                    }));

                return {
                    ...device,
                    total_items: itemCount ? itemCount.count : 0, // Nếu không có `DeviceItem`, gán 0
                    rooms: relatedRooms
                };
            });

            return res.status(200).json({
                success: true,
                message: messages.getDevice.getAllSuccess,
                devices: devicesWithCounts
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: messages.getDevice.getAllError,
                error: error.message
            });
        }
    }

    /**
     * Lấy thông tin chi tiết của một thiết bị theo ID, bao gồm danh sách DeviceItem và phòng chứa
     */
    async GetDeviceById(req, res) {
        const { deviceId } = req.params;

        try {
            // Tìm thiết bị
            const device = await Devices.findById(deviceId).lean();
            if (!device) {
                return res.status(404).json({
                    success: false,
                    message: messages.getDevice.deviceNotFound
                });
            }

            // Lấy danh sách `DeviceItem` liên quan và thông tin `Room`
            const deviceItems = await DeviceItem.find({ device: deviceId })
                .populate({
                    path: "room",
                    populate: { path: "location", select: "name" } // Lấy `location` chứa `room`
                })
                .lean();

            // Định dạng dữ liệu để hiển thị
            const formattedDeviceItems = deviceItems.map((item) => ({
                id: item._id,
                status: item.status,
                room: item.room?.name || "Không xác định",
                location: item.room?.location?.name || "Không xác định"
            }));

            return res.status(200).json({
                success: true,
                message: messages.getDevice.getByIdSuccess,
                device: {
                    ...device,
                    device_items: formattedDeviceItems
                }
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: messages.getDevice.getByIdError,
                error: error.message
            });
        }
    }

    async ViewDevice(req, res, next) {
        const { deviceId } = req.params;

        try {
            // Tìm thiết bị
            const device = await Devices.findById(deviceId).lean();
            if (!device) {
                return res.status(404).json({
                    success: false,
                    message: messages.getDevice.deviceNotFound
                });
            }

            // Lấy danh sách `DeviceItem` liên quan và thông tin `Room`
            const deviceItems = await DeviceItem.find({ device: deviceId })
                .populate({
                    path: "room",
                    populate: { path: "location", select: "name" } // Lấy `location` chứa `room`
                })
                .lean();

            // Định dạng dữ liệu để hiển thị
            const formattedDeviceItems = deviceItems.map((item) => ({
                id: item._id,
                status: item.status,
                room: item.room?.name || "Không xác định",
                location: item.room?.location?.name || "Không xác định"
            }));

            return res.status(200).render("pages/viewDevice", { 
                layout: "main",
                success: true,
                message: messages.getDevice.getByIdSuccess,
                device: {
                    ...device,
                    device_items: formattedDeviceItems
                }
             });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: messages.getDevice.getByIdError,
                error: error.message
            });
        }
        
    }
}

module.exports = new DeviceManagerQuery();
