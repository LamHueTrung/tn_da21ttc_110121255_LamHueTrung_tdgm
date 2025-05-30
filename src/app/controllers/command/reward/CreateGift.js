const fs = require('fs');
const Gift = require('../../../model/Gift');
const Location = require('../../../model/Location');
const Validator = require('../../../Extesions/validator');
const messages = require('../../../Extesions/messCost');
const { sendNotification } = require("../../../Extesions/notificationService");

class CreateGift {
    Validate(req) {
        const { name, category, description, quantity, locationId, price } = req.body;
        let errors = {};

        const nameError = 
            Validator.notEmpty(name, 'Tên quà tặng') ||
            Validator.notNull(name, 'Tên quà tặng') ||
            Validator.maxLength(name, 100, 'Tên quà tặng');
        if (nameError) errors.name = nameError;

        const categoryError = Validator.notEmpty(category, 'Danh mục quà tặng') ||
            Validator.notNull(category, 'Danh mục quà tặng') ||
            Validator.isEnum(category, ['Học viên', 'Đối tác', 'Khác'], 'Danh mục quà tặng');
        if (categoryError) errors.category = categoryError;

        const descriptionError = Validator.maxLength(description, 500, 'Mô tả quà tặng');
        if (descriptionError) errors.description = descriptionError;

        const quantityError = Validator.isPositiveNumber(quantity, 'Số lượng quà tặng');
        if (quantityError) errors.quantity = quantityError;

        const priceError = Validator.isPositiveNumber(price, 'Giá trị quà tặng');
        if (priceError) errors.price = priceError;

        if (Validator.notNull(locationId, 'Kho quà tặng')) {
            errors.locationId = messages.validation.notNull('Kho quà tặng');
        }

        return errors;
    }

    Handle = async (req, res) => {
        const errors = this.Validate(req);
        if (Object.keys(errors).length > 0) {
            return res.status(400).json({ success: false, errors });
        }

        const { name, category, description, quantity, price } = req.body;

        try {
            const existingGift = await Gift.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
            if (existingGift) {
                return res.status(400).json({
                    success: false,
                    errors: { name: messages.createGift.giftExist },
                });
            }
            let locationId = await Location.ensureMainWarehouse();
            const location = await Location.findById(locationId._id);
            if (!location) {
                return res.status(400).json({ success: false, message: "Kho quà tặng không hợp lệ" });
            }

            let tempImagePaths = [];
            if (req.files && req.files.length > 0) {
                tempImagePaths = req.files.map(file => `src/public/uploads/rewards/temp/${file.filename}`);
            }

            const newGift = new Gift({
                name,
                category,
                description: description || "",
                quantity_in_stock: quantity,
                location: location._id,
                price
            });

            await newGift.save();

            // Tạo hình ảnh chính thức
            let finalImagePaths = [];
            for (let tempPath of tempImagePaths) {
                const finalPath = tempPath.replace('/temp/', '/'); // Di chuyển ảnh từ thư mục tạm
                fs.renameSync(tempPath, finalPath);
                finalImagePaths.push(finalPath.replace('src/public', '')); // Chuẩn hóa đường dẫn cho frontend
            }

            // Cập nhật ảnh vào quà tặng
            newGift.images = finalImagePaths;
            await newGift.save();

            // Gửi thông báo cho người dùng
            await sendNotification({
                title: `Quà tặng "${newGift.name}" đã được tạo.`,
                description: `Quà tặng "${newGift.name}" đã được thêm vào hệ thống.`,
                url: `/reward/viewReward/${newGift._id}`,
                role: "gift_manager",
                type: "info"
            });
            res.status(201).json({
                success: true,
                message: messages.createGift.giftCreateSuccess,
                gift: {
                    name: newGift.name,
                    category: newGift.category,
                    quantity_in_stock: newGift.quantity_in_stock,
                    location: location.name,
                    price: newGift.price,
                    images: newGift.images
                }
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: messages.createGift.createError,
                error: error.message
            });
        }
    }
}

module.exports = new CreateGift();
