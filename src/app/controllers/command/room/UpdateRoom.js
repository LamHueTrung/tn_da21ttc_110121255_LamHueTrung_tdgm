const Room = require("../../../model/Room");
const Location = require("../../../model/Location");
const Validator = require("../../../Extesions/validator");
const messages = require("../../../Extesions/messCost");
const { sendNotification } = require("../../../Extesions/notificationService");

class UpdateRoom {
    /**
     * API cập nhật thông tin phòng học.
     * @param {Object} req - Request từ client.
     * @param {Object} res - Response trả về kết quả cập nhật.
     */
    Handle = async (req, res) => {
        const { roomId } = req.params;
        const { name, locationId, capacity, description } = req.body; // LocationId là ObjectId

        let errors = {};

        try {
            // Kiểm tra xem phòng có tồn tại không
            let room = await Room.findById(roomId).populate("location", "name");
            if (!room) {
                return res.status(404).json({
                    success: false,
                    message: messages.room.roomNotFound
                });
            }

            // Validate giá trị đầu vào (nếu có)
            if (name) {
                const nameError = Validator.notEmpty(name, "Tên phòng") ||
                                  Validator.maxLength(name, 100, "Tên phòng");
                if (nameError) errors.name = nameError;
            }

            if (locationId) {
                const locationError = Validator.notEmpty(locationId, "Vị trí");
                if (locationError) errors.location = locationError;
            }

            if (capacity) {
                const capacityError = Validator.isPositiveNumber(capacity, "Sức chứa");
                if (capacityError) errors.capacity = capacityError;
            }

            if (description) {
                const descriptionError = Validator.maxLength(description, 255, "Mô tả phòng");
                if (descriptionError) errors.description = descriptionError;
            }

            // Nếu có lỗi validate, trả về danh sách lỗi
            if (Object.keys(errors).length > 0) {
                return res.status(400).json({ success: false, errors });
            }

            // Kiểm tra location nếu có thay đổi
            let newLocation = room.location._id; // Giữ nguyên location nếu không cập nhật
            if (locationId && locationId !== room.location._id.toString()) {
                let locationRecord = await Location.findById(locationId);
                if (!locationRecord) {
                    return res.status(404).json({
                        success: false,
                        message: messages.room.locationNotFound
                    });
                }
                newLocation = locationRecord._id;
            }

            // Cập nhật thông tin phòng
            room.name = name || room.name;
            room.location = newLocation;
            room.capacity = capacity || room.capacity;
            room.description = description || room.description;
            await room.save();

            // Gửi thông báo đến người dùng
            await sendNotification({
                title: `Phòng học ${room.name} đã được cập nhật`,
                description: `Thông tin phòng học ${room.name} đã được cập nhật thành công.`,
                url: `/deviceToRoom/home`,
                role: 'device_manager',
                type: 'success',
            });
            return res.status(200).json({
                success: true,
                message: messages.room.updateSuccess,
                updatedRoom: {
                    _id: room._id,
                    name: room.name,
                    location: {
                        _id: newLocation,
                        name: (await Location.findById(newLocation)).name
                    },
                    capacity: room.capacity,
                    description: room.description
                }
            });

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: messages.room.updateError,
                error: error.message
            });
        }
    };
}

module.exports = new UpdateRoom();
