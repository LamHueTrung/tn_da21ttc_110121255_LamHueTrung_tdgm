const fs = require("fs");
const path = require("path");
const Devices = require("../../../model/Device");
const DeviceItem = require("../../../model/DeviceItem");
const Validator = require("../../../Extesions/validator");
const messages = require("../../../Extesions/messCost");
const Location = require("../../../model/Location");

/**
 * Class UpdateDevice - Xử lý API cập nhật thiết bị
 */
class UpdateDevice {
    /**
     * Kiểm tra tính hợp lệ của dữ liệu đầu vào
     * @param {Object} req - Request từ client
     * @returns {Object} errors - Đối tượng chứa các lỗi nếu có
     */
    Validate(req) {
        const { name, category, description, status, quantity, location } = req.body;
        let errors = {};

        if (name) {
            const nameError = Validator.notEmpty(name, "Tên thiết bị") ||
                Validator.notNull(name, "Tên thiết bị") ||
                Validator.maxLength(name, 100, "Tên thiết bị");
            if (nameError) errors.name = nameError;
        }

        if (category) {
            const categoryError = Validator.notEmpty(category, "Danh mục thiết bị") ||
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
            const statusError = Validator.isEnum(status, ["Mới", "Hoạt động", "Hỏng", "Bảo trì"], "Trạng thái thiết bị");
            if (statusError) errors.status = statusError;
        }

        if (quantity) {
            const quantityError = Validator.isPositiveNumber(quantity, "Số lượng thiết bị");
            if (quantityError) errors.quantity = quantityError;
        }

        // Kiểm tra ảnh nếu có upload ảnh mới
        if (req.files && req.files.length > 0) {
            req.files.forEach((file) => {
                const imageError = Validator.maxFileSize(file, 10, "Hình ảnh thiết bị") ||
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

            const { name, category, description, status, quantity, location } = req.body;

            // Kiểm tra vị trí hiện tại của thiết bị
            let currentLocation = device.location ? await Location.findById(device.location) : null;

            // Nếu thiết bị chưa có vị trí, mặc định là "Kho chính"
            if (!currentLocation) {
                let defaultLocation = await Location.findOne({ name: "Kho chính" });
                if (!defaultLocation) {
                    defaultLocation = await Location.create({ name: "Kho chính", description: "Vị trí mặc định" });
                }
                device.location = defaultLocation._id;
                currentLocation = defaultLocation;
            }

            // Nếu có location mới, kiểm tra xem có tồn tại không
            let newLocation = null;
            if (location && location !== currentLocation.name) {
                newLocation = await Location.findOne({ name: location });
                if (!newLocation) {
                    newLocation = await Location.create({ name: location, description: "Vị trí mới được tạo" });
                }
                device.location = newLocation._id;

                // Cập nhật tất cả `DeviceItem` liên quan đến thiết bị này
                await DeviceItem.updateMany(
                    { device: device._id },
                    { location: newLocation._id }
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
            device.quantity = quantity || device.quantity;

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
            return res.status(200).json({
                success: true,
                message: messages.updateDevice.deviceUpdateSuccess,
                device: {
                    name: device.name,
                    category: device.category,
                    status: device.status,
                    quantity: device.quantity,
                    location: newLocation ? newLocation.name : currentLocation.name, // Hiển thị tên vị trí mới nếu có
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
