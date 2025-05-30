const fs = require("fs");
const path = require("path");
const Devices = require("../../../model/Device");
const DeviceItem = require("../../../model/DeviceItem");
const Validator = require("../../../Extesions/validator");
const messages = require("../../../Extesions/messCost");
const Room = require("../../../model/Room");
const { sendNotification } = require("../../../Extesions/notificationService");

class UpdateDevice {
    /**
     * Kiểm tra tính hợp lệ của dữ liệu đầu vào
     * @param {Object} req - Request từ client
     * @returns {Object} errors - Đối tượng chứa các lỗi nếu có
     */
    Validate(req) {
        const { name, category, description, status, quantity, room } = req.body;
        let errors = {};

        if (name) {
            const nameError =
                Validator.notEmpty(name, "Tên thiết bị") ||
                Validator.notNull(name, "Tên thiết bị") ||
                Validator.maxLength(name, 100, "Tên thiết bị");
            if (nameError) errors.name = nameError;
        }

        if (category) {
            const categoryError =
                Validator.notEmpty(category, "Danh mục thiết bị") ||
                Validator.notNull(category, "Danh mục thiết bị") ||
                Validator.isEnum(
                    category,
                    ["Máy tính", "Máy chiếu", "Bảng trắng", "Loa", "Thiết bị mạng", "Khác"],
                    "Danh mục thiết bị"
                );
            if (categoryError) errors.category = categoryError;
        }

        if (description) {
            const descriptionError = Validator.maxLength(description, 500, "Mô tả thiết bị");
            if (descriptionError) errors.description = descriptionError;
        }

        if (status) {
            const statusError = Validator.isEnum(status, ["Mới", "Hoạt động", 'Đang sử dụng', "Hỏng", "Bảo trì"], "Trạng thái thiết bị");
            if (statusError) errors.status = statusError;
        }

        if (quantity) {
            const quantityError = Validator.isPositiveNumber(quantity, "Số lượng thiết bị");
            if (quantityError) errors.quantity = quantityError;
        }

        // Kiểm tra ảnh nếu có upload ảnh mới
        if (req.files && req.files.length > 0) {
            req.files.forEach((file) => {
                const imageError =
                    Validator.maxFileSize(file, 10, "Hình ảnh thiết bị") ||
                    Validator.isImageFile(file, "Hình ảnh thiết bị");
                if (imageError) errors.image = imageError;
            });
        }

        return errors;
    }

    /**
     * Xử lý API cập nhật thiết bị
     * @param {Object} req - Request từ client
     * @param {Object} res - Response để trả JSON
     */
    Handle = async (req, res) => {
        const { deviceId } = req.params; // Lấy deviceId từ URL
        const errors = this.Validate(req);
        if (Object.keys(errors).length > 0) {
            return res.status(400).json({ success: false, errors });
        }

        try {
            // Kiểm tra xem thiết bị có tồn tại không
            let device = await Devices.findById(deviceId);
            if (!device) {
                return res.status(404).json({
                    success: false,
                    message: messages.updateDevice.deviceNotFound,
                });
            }

            const { name, category, description, status, total_quantity, room } = req.body;

            // Kiểm tra phòng hiện tại của thiết bị
            let currentRoom = device.room ? await Room.findById(device.room) : null;

            // Nếu thiết bị chưa có phòng, mặc định là "Kho chính"
            if (!currentRoom) {
                let defaultRoom = await Room.findOne({ name: "Kho chính" });
                if (!defaultRoom) {
                    defaultRoom = await Room.create({ name: "Kho chính", description: "Phòng mặc định" });
                }
                device.room = defaultRoom._id;
                currentRoom = defaultRoom;
            }

            // Nếu có `room` mới, kiểm tra xem có tồn tại không
            let newRoom = null;
            if (room && room !== currentRoom.name) {
                newRoom = await Room.findOne({ name: room });
                if (!newRoom) {
                    newRoom = await Room.create({ name: room, description: "Phòng mới được tạo" });
                }
                device.room = newRoom._id;

                // Cập nhật tất cả `DeviceItem` liên quan đến thiết bị này
                await DeviceItem.updateMany(
                    { device: device._id },
                    { room: newRoom._id }
                );
            }

            // Lưu ảnh tạm
            let tempImagePaths = [];
            if (req.files && req.files.length > 0) {
                tempImagePaths = req.files.map(
                    (file) => `src/public/uploads/devices/temp/${file.filename}`
                );
            }

            // Cập nhật thông tin thiết bị
            device.name = name || device.name;
            device.category = category || device.category;
            device.description = description || device.description;
            device.status = status || device.status;
            device.total_quantity = total_quantity || device.total_quantity;

            // Kiểm tra và cập nhật số lượng DeviceItem
            const currentDeviceItems = await DeviceItem.find({ device: device._id });
            const currentDeviceItemCount = currentDeviceItems.length;

            // Nếu số lượng device item lớn hơn số lượng cập nhật
            if (currentDeviceItemCount > total_quantity) {
                let excessItemsCount = currentDeviceItemCount - total_quantity; // Số lượng thừa cần xóa
                for (const item of currentDeviceItems) {
                    if (excessItemsCount <= 0) break; // Nếu đã đủ số lượng để xóa thì dừng lại

                    // Chỉ xóa những item có trạng thái khác "Hoạt động" và "Đang sử dụng"
                    if (item.status !== "Hoạt động" && item.status !== "Đang sử dụng") {
                        await DeviceItem.findByIdAndDelete(item._id);
                        excessItemsCount--; // Giảm số lượng thừa cần xóa
                    } else {
                        // Nếu gặp thiết bị có trạng thái "Hoạt động" hoặc "Đang sử dụng", không xóa nó
                        continue;
                    }
                }

                // Kiểm tra nếu vẫn còn thừa thiết bị mà không thể xóa (do tất cả đều là "Hoạt động" hoặc "Đang sử dụng")
                if (excessItemsCount > 0) {
                    return res.status(400).json({
                        success: false,
                        errors: { quantity: "Không thể xóa thiết bị đang sử dụng hoặc hoạt động." },
                    });
                }
            }

            // Nếu số lượng device item nhỏ hơn số lượng cập nhật
            if (currentDeviceItemCount < total_quantity) {
                const itemsToAdd = total_quantity - currentDeviceItemCount;
                for (let i = 0; i < itemsToAdd; i++) {
                    const newDeviceItem = new DeviceItem({
                        device: device._id,
                        status: "Mới", // Trạng thái mặc định là "Mới"
                        room: newRoom ? newRoom._id : currentRoom._id,
                    });
                    await newDeviceItem.save();
                }
            }

            // Nếu có ảnh mới, xóa ảnh cũ và cập nhật ảnh mới
            if (tempImagePaths.length > 0) {
                // Xóa ảnh cũ nếu có
                device.images.forEach((oldImage) => {
                    const oldImagePath = `src/public${oldImage}`;
                    if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
                });

                // Di chuyển ảnh từ temp sang thư mục chính
                let finalImagePaths = [];
                for (let tempPath of tempImagePaths) {
                    const finalPath = tempPath.replace("/temp/", "/"); // Đưa về thư mục chính
                    fs.renameSync(tempPath, finalPath);
                    finalImagePaths.push(finalPath.replace("src/public", "")); // Chuẩn hóa đường dẫn cho frontend
                }

                device.images = finalImagePaths;
            }

            await device.save();

            // Gửi thông báo đến người dùng
            await sendNotification({
                title: `Thiết bị "${device.name}" đã được cập nhật`,
                description: `Thiết bị "${device.name}" có sự thay đổi.`,
                url: `/deviceManger/viewDevice/${device._id}`,
                role: "device_manager",
                type: "success"
            });

            return res.status(200).json({
                success: true,
                message: messages.updateDevice.deviceUpdateSuccess,
                device: {
                    name: device.name,
                    category: device.category,
                    status: device.status,
                    quantity: device.total_quantity,
                    room: newRoom ? newRoom.name : currentRoom.name, // Hiển thị tên phòng mới nếu có
                    images: device.images,
                },
            });
        } catch (error) {
            // Nếu có lỗi, xóa ảnh trong thư mục tạm
            for (let tempPath of req.files?.map(
                (file) => `src/public/uploads/devices/temp/${file.filename}`
            ) || []) {
                if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
            }

            return res.status(500).json({
                success: false,
                message: messages.updateDevice.updateError,
                error: error.message,
            });
        }
    };
}

module.exports = new UpdateDevice();
