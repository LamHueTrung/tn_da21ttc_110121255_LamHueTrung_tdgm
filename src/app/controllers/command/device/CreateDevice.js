const fs = require('fs');
const path = require('path');
const Devices = require('../../../model/Device');
const DeviceItem = require('../../../model/DeviceItem');
const Validator = require('../../../Extesions/validator');
const messages = require('../../../Extesions/messCost');
const Room = require('../../../model/Room');
const { sendNotification } = require("../../../Extesions/notificationService");

/**
 * Class CreateDevice - Xử lý API tạo thiết bị mới
 */
class CreateDevice {
    /**
     * Kiểm tra tính hợp lệ của dữ liệu đầu vào
     * @param {Object} req - Request từ client
     * @returns {Object} errors - Đối tượng chứa các lỗi nếu có
     */
    Validate(req) {
        const { name, category, description, quantity, room } = req.body;
        let errors = {};

        const nameError = 
            Validator.notEmpty(name, 'Tên thiết bị') ||
            Validator.notNull(name, 'Tên thiết bị') ||
            Validator.maxLength(name, 100, 'Tên thiết bị');
        if (nameError) errors.name = nameError;

        const categoryError = Validator.notEmpty(category, 'Danh mục thiết bị') ||
            Validator.notNull(category, 'Danh mục thiết bị') ||
            Validator.isEnum(category, ['Máy tính', 'Máy chiếu', 'Bảng trắng', 'Loa', 'Thiết bị mạng', 'Khác'], 'Danh mục thiết bị');
        if (categoryError) errors.category = categoryError;

        const descriptionError = Validator.maxLength(description, 500, 'Mô tả thiết bị');
        if (descriptionError) errors.description = descriptionError;

        const quantityError = Validator.isPositiveNumber(quantity, 'Số lượng thiết bị');
        if (quantityError) errors.quantity = quantityError;

        // Kiểm tra file ảnh nếu có upload
        if (req.files && req.files.length > 0) {
            req.files.forEach(file => {
                const imageError = 
                    Validator.maxFileSize(file, 10, 'Hình ảnh thiết bị') || // Giới hạn 10MB
                    Validator.isImageFile(file, 'Hình ảnh thiết bị');
                if (imageError) errors.image = imageError;
            });
        }

        return errors;
    }

    /**
     * Xử lý API tạo thiết bị mới
     * @param {Object} req - Request từ client
     * @param {Object} res - Response để trả JSON
     */
    Handle = async (req, res) => {
        const errors = this.Validate(req);
        if (Object.keys(errors).length > 0) {
            return res.status(400).json({ success: false, errors });
        }

        const { name, category, description, quantity } = req.body;
        const room = 'Kho chính'; // Phòng mặc định
        try {
            // Kiểm tra xem thiết bị đã tồn tại chưa
            const existingDevice = await Devices.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
            if (existingDevice) {
                return res.status(400).json({
                    success: false,
                    errors: { name: messages.createDevice.deviceExist },
                });
            }
            
            // Lấy "Kho chính"
            const mainWarehouse = await Room.ensureMainWarehouse();

            console.log(mainWarehouse);
            // Lưu ảnh vào thư mục tạm
            let tempImagePaths = [];
            if (req.files && req.files.length > 0) {
                tempImagePaths = req.files.map(file => `src/public/uploads/devices/temp/${file.filename}`);
            }

            // Tạo thiết bị mới
            const newDevice = new Devices({
                name,
                category,
                description: description || "",
                total_quantity: quantity,
                images: [] // Chưa thêm ảnh vào đây
            });

            await newDevice.save();

            // **Tự động tạo `DeviceItem` cho từng thiết bị**
            let createdDeviceItems = [];
            for (let i = 0; i < quantity; i++) {
                const newDeviceItem = new DeviceItem({
                    device: newDevice._id,
                    status: 'Mới',
                    room: mainWarehouse._id, // 🔥 Cập nhật thành `room`
                    location: mainWarehouse.location // 🔥 Cập nhật thành `mainWarehouse`
                });
                await newDeviceItem.save();
                createdDeviceItems.push(newDeviceItem);
            }

            // Nếu thiết bị được tạo thành công, di chuyển ảnh từ `temp/` sang thư mục chính
            let finalImagePaths = [];
            for (let tempPath of tempImagePaths) {
                const finalPath = tempPath.replace('/temp/', '/'); // Chuyển từ temp sang thư mục chính
                fs.renameSync(tempPath, finalPath);
                finalImagePaths.push(finalPath.replace('src/public', '')); // Chuẩn hóa đường dẫn cho frontend
            }

            // Cập nhật đường dẫn ảnh vào thiết bị
            newDevice.images = finalImagePaths;
            await newDevice.save();

            // Gửi thông báo cho người dùng
            await sendNotification({
                title: "Thiết bị mới",
                description: `Thiết bị "${newDevice.name}" đã được thêm vào hệ thống.`,
                url: `/deviceManger/viewDevice/${newDevice._id}`,
                role: "device_manager",
                type: "info"
            });

            return res.status(201).json({
                success: true,
                message: messages.createDevice.deviceCreateSuccess,
                device: {
                    name: newDevice.name,
                    category: newDevice.category,
                    status: newDevice.status,
                    quantity: newDevice.quantity,
                    room: mainWarehouse.name,
                    images: newDevice.images,
                    deviceItems: createdDeviceItems.map(item => ({
                        id: item._id,
                        status: item.status,
                        room: mainWarehouse.name
                    }))
                }
            });

        } catch (error) {
            // Nếu có lỗi, xóa ảnh trong thư mục tạm
            for (let tempPath of req.files?.map(file => `src/public/uploads/devices/temp/${file.filename}`) || []) {
                if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
            }

            return res.status(500).json({
                success: false,
                message: messages.createDevice.createError,
                error: error.message
            });
        }
    }
}

module.exports = new CreateDevice();
