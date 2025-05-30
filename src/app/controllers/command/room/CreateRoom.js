const Room = require('../../../model/Room');
const Location = require('../../../model/Location');
const Validator = require('../../../Extesions/validator');
const messages = require('../../../Extesions/messCost');
const { sendNotification } = require("../../../Extesions/notificationService");

class CreateRoom {
    /**
     * Kiểm tra tính hợp lệ của dữ liệu đầu vào
     * @param {Object} req - Request từ client
     * @returns {Object} errors - Danh sách lỗi nếu có
     */
    Validate(req) {
        const { name, locationId, locationName, capacity, description } = req.body;
        let errors = {};

        // Kiểm tra tên phòng
        const nameError =
            Validator.notEmpty(name, 'Tên phòng') ||
            Validator.notNull(name, 'Tên phòng') ||
            Validator.maxLength(name, 100, 'Tên phòng');
        if (nameError) errors.name = nameError;

        // Kiểm tra vị trí: phải có locationId hoặc locationName
        if (!locationId && !locationName) {
            errors.locationId = messages.validation.notNull('Tòa nhà');
        } else if (locationName) {
            const locationNameError =
                Validator.notEmpty(locationName, 'Tên tòa nhà') ||
                Validator.maxLength(locationName, 100, 'Tên tòa nhà');
            if (locationNameError) errors.locationName = locationNameError;
        }

        // Kiểm tra sức chứa
        const capacityError = Validator.isPositiveNumber(capacity, 'Sức chứa');
        if (capacityError) errors.capacity = capacityError;

        // Kiểm tra mô tả (nếu có)
        const descriptionError = Validator.maxLength(description, 500, 'Mô tả phòng');
        if (descriptionError) errors.description = descriptionError;

        return errors;
    }

    /**
     * Xử lý tạo phòng mới
     * @param {Object} req - Request từ client
     * @param {Object} res - Response trả về JSON
     */
    Handle = async (req, res) => {
        console.log(req.body);
        const errors = this.Validate(req);
        if (Object.keys(errors).length > 0) {
            return res.status(400).json({ success: false, errors });
        }

        const { name, locationId, locationName, capacity, description } = req.body;

        try {
            // Xử lý vị trí
            let finalLocationId = locationId;

            if (locationName) {
                let location = await Location.findOne({ name: locationName });
                if (!location) {
                    location = await Location.create({
                        name: locationName,
                        description: messages.location.defaultDescription || 'Tòa nhà mặc định'
                    });
                }
                finalLocationId = location._id;
            }

            // Kiểm tra phòng đã tồn tại
            const existingRoom = await Room.findOne({ name, location: finalLocationId });
            if (existingRoom) {
                return res.status(400).json({
                    success: false,
                    errors: { name: messages.room.roomExist }
                });
            }

            // Kiểm tra locationId hợp lệ
            const location = await Location.findById(finalLocationId);
            if (!location) {
                return res.status(400).json({
                    success: false,
                    errors: { locationId: messages.room.invalidLocation }
                });
            }

            // Tạo phòng mới
            const newRoom = new Room({
                name,
                location: finalLocationId,
                capacity: parseInt(capacity, 10),
                description: description || ''
            });

            // Lưu phòng vào database
            await newRoom.save();

            // Gửi thông báo đến người dùng
            await sendNotification({
                title: `Phòng "${newRoom.name}" đã được tạo.`,
                description: `Phòng "${newRoom.name}" tại tòa nhà "${location.name}" đã được tạo thành công.`,
                url: `/deviceToRoom/home`,
                role: 'device_manager',
                type: 'info',
            });
            
            // Trả về phản hồi thành công
            res.status(201).json({
                success: true,
                message: messages.room.roomCreateSuccess,
                room: {
                    name: newRoom.name,
                    location: location.name,
                    capacity: newRoom.capacity,
                    description: newRoom.description
                }
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: messages.room.createError,
                error: error.message
            });
        }
    }
}

module.exports = new CreateRoom();