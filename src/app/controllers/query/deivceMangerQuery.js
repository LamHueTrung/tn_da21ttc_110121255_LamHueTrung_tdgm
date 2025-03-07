const jwt = require('jsonwebtoken');
const Devices = require('../../model/Device');
const DeviceItem = require('../../model/DeviceItem');
const messages = require('../../Extesions/messCost');

/**
 * Class DeviceManagerQuery - Xử lý API lấy danh sách thiết bị
 */
class DeviceManagerQuery {
    
    async Index(req, res, next) {
        res.render('pages/deviceManager', { layout: 'main'});
    }

    async AddDevice(req, res, next) {
        res.render('pages/addDevice', { layout: 'main'});
    }

    async IndexType(req, res, next) {
        res.render('pages/listAllDeviceType', { layout: 'main'});
    }

    async AddDeviceType(req, res, next) {
        res.render('pages/addDeviceType', { layout: 'main'});
    }

    /**
     * Lấy danh sách tất cả thiết bị
     * @param {Object} req - Request từ client
     * @param {Object} res - Response để trả JSON
     */
    async GetAllDevices(req, res) {
        try {
            const devices = await Devices.find().lean(); // Lấy danh sách thiết bị

            // Lấy tổng số lượng DeviceItem theo từng thiết bị
            const deviceIds = devices.map(device => device._id);
            const deviceItems = await DeviceItem.aggregate([
                { $match: { device: { $in: deviceIds } } },
                { $group: { _id: "$device", count: { $sum: 1 } } }
            ]);

            // Gán tổng số lượng thiết bị từ DeviceItem vào danh sách thiết bị
            const devicesWithCounts = devices.map(device => {
                const itemCount = deviceItems.find(item => item._id.equals(device._id));
                return {
                    ...device,
                    total_items: itemCount ? itemCount.count : 0 // Nếu không có DeviceItem, gán 0
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
     * Lấy thông tin chi tiết của một thiết bị theo ID, bao gồm danh sách DeviceItem
     * @param {Object} req - Request từ client
     * @param {Object} res - Response để trả JSON
     */
    async GetDeviceById(req, res) {
        const { deviceId } = req.params;
        
        try {
            const device = await Devices.findById(deviceId).lean();
            if (!device) {
                return res.status(404).json({
                    success: false,
                    message: messages.getDevice.deviceNotFound
                });
            }

            // Lấy danh sách các DeviceItem liên quan
            const deviceItems = await DeviceItem.find({ device: deviceId })
                .populate("location", "name description") // Lấy thông tin vị trí
                .lean();

            return res.status(200).json({
                success: true,
                message: messages.getDevice.getByIdSuccess,
                device: {
                    ...device,
                    device_items: deviceItems // Thêm danh sách DeviceItem vào response
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
