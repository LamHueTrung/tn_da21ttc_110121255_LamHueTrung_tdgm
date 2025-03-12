const BorrowRequest = require("../../../model/BorrowRequest");
const Device = require("../../../model/Device");
const DeviceItem = require("../../../model/DeviceItem");
const Teacher = require("../../../model/Teacher");
const Room = require("../../../model/Room");
const Location = require("../../../model/Location");
const messages = require("../../../Extesions/messCost");
const Validator = require("../../../Extesions/validator");

class CreateBorrowRequest {
    Validate(req) {
        const { teacherId, roomId, devices } = req.body;
        let errors = {};

        const teacherError = Validator.notEmpty(teacherId, "Giảng viên") || Validator.notNull(teacherId, "Giảng viên");
        if (teacherError) errors.teacherId = teacherError;

        if (!Array.isArray(devices) || devices.length === 0) {
            errors.devices = messages.borrowRequest.noDevicesProvided;
        } else {
            devices.forEach((device, index) => {
                if (!device.deviceId || !device.quantity || device.quantity <= 0) {
                    errors[`devices[${index}]`] = messages.borrowRequest.invalidDevice;
                }
            });
        }

        return errors;
    }

    Handle = async (req, res) => {
        const errors = this.Validate(req);
        if (Object.keys(errors).length > 0) {
            return res.status(400).json({ success: false, errors });
        }

        const { teacherId, roomId, devices } = req.body;

        try {
            const teacher = await Teacher.findById(teacherId);
            if (!teacher) {
                return res.status(404).json({
                    success: false,
                    message: messages.borrowRequest.teacherNotFound
                });
            }

            let room = null;
            if (roomId) {
                room = await Room.findById(roomId);
                if (!room) {
                    return res.status(404).json({
                        success: false,
                        message: messages.borrowRequest.roomNotFound
                    });
                }
            }

            let personalLocation = null;
            if (!room) {
                personalLocation = await Location.ensurePersonalUseLocation();
            }

            let selectedDeviceItems = [];
            let updateDeviceQuantities = [];

            for (const { deviceId, quantity } of devices) {
                const device = await Device.findById(deviceId);
                if (!device) {
                    return res.status(404).json({
                        success: false,
                        message: messages.borrowRequest.deviceNotFound
                    });
                }

                const availableItems = await DeviceItem.find({
                    device: deviceId,
                    status: { $in: ["Mới", "Hoạt động"] }
                }).limit(quantity);

                if (availableItems.length < quantity) {
                    return res.status(400).json({
                        success: false,
                        message: messages.borrowRequest.notEnoughDevices.replace("{device}", device.name)
                    });
                }

                for (const item of availableItems) {
                    item.status = "Đang sử dụng";
                    item.room = room ? room._id : null;
                    item.location = room ? null : personalLocation._id;
                    item.borrowedBy = teacher._id;
                    await item.save();
                    selectedDeviceItems.push(item._id);
                }

                updateDeviceQuantities.push({
                    deviceId,
                    newQuantity: device.total_quantity - quantity
                });
            }

            for (const { deviceId, newQuantity } of updateDeviceQuantities) {
                await Device.findByIdAndUpdate(deviceId, { total_quantity: newQuantity });
            }

            const newBorrowRequest = new BorrowRequest({
                teacher: teacher._id,
                room: room ? room._id : null,
                devices: devices.map(d => ({ device: d.deviceId, quantity: d.quantity })),
                deviceItems: selectedDeviceItems
            });

            await newBorrowRequest.save();

            return res.status(201).json({
                success: true,
                message: messages.borrowRequest.createSuccess,
                borrowRequest: newBorrowRequest
            });

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: messages.borrowRequest.createError,
                error: error.message
            });
        }
    };
}

module.exports = new CreateBorrowRequest();
