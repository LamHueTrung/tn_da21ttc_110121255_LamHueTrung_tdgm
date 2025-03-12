const jwt = require('jsonwebtoken');
const Device = require("../../model/Device");
const DeviceItem = require("../../model/DeviceItem");
const messages = require("../../Extesions/messCost");
const BorrowRequest = require("../../model/BorrowRequest");

class BorrowRepayQuery {
    
    async Index(req, res, next) {
        res.render('pages/historyBorrowRepay', { layout: 'main'});
    }

    async AddNew(req, res, next) {
        res.render('pages/addBorrowRepay', { layout: 'main'});
    }

    /**
     * API lấy danh sách thiết bị có thể mượn
     * @param {Object} req - Request từ client.
     * @param {Object} res - Response trả về danh sách thiết bị.
     */
    GetAvailableDevices = async (req, res) => {
        try {
            // Lấy danh sách thiết bị có ít nhất một DeviceItem có status "Mới" hoặc "Hoạt động"
            const availableDevices = await Device.find().lean();

            // Lọc danh sách chỉ lấy thiết bị có DeviceItem khả dụng
            const filteredDevices = [];

            for (let device of availableDevices) {
                const countAvailableItems = await DeviceItem.countDocuments({
                    device: device._id,
                    status: { $in: ["Mới", "Hoạt động"] }
                });

                if (countAvailableItems > 0) {
                    filteredDevices.push({
                        _id: device._id,
                        name: device.name,
                        category: device.category,
                        description: device.description,
                        total_quantity: device.total_quantity,
                        available_quantity: countAvailableItems, // Số lượng thiết bị có thể mượn
                        images: device.images
                    });
                }
            }

            return res.status(200).json({
                success: true,
                message: messages.device.getAvailableSuccess,
                devices: filteredDevices
            });

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: messages.device.getAvailableError,
                error: error.message
            });
        }
    };

    /**
     * API lấy danh sách tất cả đơn mượn
     */
    async GetAll(req, res) {
        try {
            const borrowRequests = await BorrowRequest.find()
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

            return res.status(200).json({
                success: true,
                message: messages.borrowRequest.getAllSuccess,
                borrowRequests
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: messages.borrowRequest.getAllError,
                error: error.message
            });
        }
    }

    /**
     * API lấy thông tin chi tiết của một đơn mượn theo ID
     */
    async GetById(req, res) {
        const { id } = req.params;

        try {
            const borrowRequest = await BorrowRequest.findById(id)
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

            if (!borrowRequest) {
                return res.status(404).json({
                    success: false,
                    message: messages.borrowRequest.borrowNotFound
                });
            }

            return res.status(200).json({
                success: true,
                message: messages.borrowRequest.getByIdSuccess,
                borrowRequest
            });

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: messages.borrowRequest.getByIdError,
                error: error.message
            });
        }
    }
};

module.exports = new BorrowRepayQuery;