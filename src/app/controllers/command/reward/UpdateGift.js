const fs = require('fs');
const Gift = require('../../../model/Gift');
const Location = require('../../../model/Location');
const Validator = require('../../../Extesions/validator');
const messages = require('../../../Extesions/messCost');
const upload = require('../../../Extesions/uploadFile'); 
const { sendNotification } = require("../../../Extesions/notificationService");

class UpdateGift {
    /**
     * Kiểm tra tính hợp lệ của dữ liệu đầu vào
     * @param {Object} req - Request từ client
     * @returns {Object} errors - Đối tượng chứa các lỗi nếu có
     */
    Validate(req) {
        const { name, category, description, quantity_in_stock, price, locationId } = req.body;
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

        const quantity_in_stockError = Validator.isPositiveNumber(quantity_in_stock, 'Số lượng quà tặng');
        if (quantity_in_stockError) errors.quantity_in_stock = quantity_in_stockError;

        const priceError = Validator.isPositiveNumber(price, 'Giá trị quà tặng');
        if (priceError) errors.price = priceError;

        if (Validator.notNull(locationId, 'Kho quà tặng')) {
            errors.locationId = messages.validation.notNull('Kho quà tặng');
        }

        return errors;
    }

    /**
     * Xử lý API cập nhật thông tin quà tặng
     * @param {Object} req - Request từ client
     * @param {Object} res - Response để trả JSON
     */
    Handle = async (req, res) => {
        const errors = this.Validate(req);
        if (Object.keys(errors).length > 0) {
            return res.status(400).json({ success: false, errors });
        }

        const { name, category, description, quantity_in_stock, price } = req.body;
        const { id } = req.params; // Lấy ID quà tặng từ params

        try {
            // Kiểm tra quà tặng tồn tại
            const gift = await Gift.findById(id);
            if (!gift) {
                return res.status(404).json({ success: false, message: messages.gift.notFound });
            }

            // Lấy thông tin kho quà tặng mới
            let locationId = await Location.ensureMainWarehouse();
            const location = await Location.findById(locationId._id);
            if (!location) {
                return res.status(400).json({ success: false, message: "Kho quà tặng không hợp lệ" });
            }

            // Cập nhật quà tặng
            gift.name = name || gift.name;
            gift.category = category || gift.category;
            gift.description = description || gift.description;
            gift.quantity_in_stock = quantity_in_stock || gift.quantity_in_stock;
            gift.price = price || gift.price;
            gift.location = location._id || gift.location;

            // Xử lý hình ảnh mới nếu có
            let tempImagePaths = [];
            if (req.files && req.files.length > 0) {
                tempImagePaths = req.files.map(file => `src/public/uploads/rewards/temp/${file.filename}`);
            }

            // Lưu hình ảnh và cập nhật quà tặng
            let finalImagePaths = [];
            if (tempImagePaths.length > 0) {
                for (let tempPath of tempImagePaths) {
                    const finalPath = tempPath.replace('/temp/', '/');
                    fs.renameSync(tempPath, finalPath);
                    finalImagePaths.push(finalPath.replace('src/public', ''));
                }
                gift.images = finalImagePaths;
            }

            // Lưu quà tặng đã cập nhật
            await gift.save();

            // Gửi thông báo đến người dùng
            await sendNotification({
                title: `Quà tặng "${gift.name}" đã được cập nhật.`,
                description: `Thông tin quà tặng "${gift.name}" đã được cập nhật thành công.`,
                url: `/reward/viewReward/${gift._id}`,
                role: 'gift_manager',
                type: 'success',
            });
            
            return res.status(200).json({
                success: true,
                message: messages.gift.updateSuccess,
                gift: {
                    name: gift.name,
                    category: gift.category,
                    quantity_in_stock: gift.quantity_in_stock,
                    price: gift.price,
                    location: location.name,
                    images: gift.images
                }
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: messages.gift.updateError,
                error: error.message
            });
        }
    }
}

module.exports = new UpdateGift();
