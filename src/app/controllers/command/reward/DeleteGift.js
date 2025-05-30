const Gift = require('../../../model/Gift');
const fs = require('fs');
const path = require('path');
const { sendNotification } = require("../../../Extesions/notificationService");

class DeleteGift {
    /**
     * Xử lý API xóa quà tặng
     * @param {Object} req - Request từ client
     * @param {Object} res - Response trả về JSON
     */
    Handle = async (req, res) => {
        const { giftId } = req.params; // Lấy giftId từ params

        try {
            // Kiểm tra xem quà tặng có tồn tại không
            const gift = await Gift.findById(giftId);
            if (!gift) {
                return res.status(404).json({ success: false, message: "Quà tặng không tồn tại" });
            }

            // Xóa hình ảnh nếu có
            if (gift.images && gift.images.length > 0) {
                gift.images.forEach((imagePath) => {
                    const imageFullPath = path.join(__dirname, `../../../public${imagePath}`);
                    if (fs.existsSync(imageFullPath)) {
                        fs.unlinkSync(imageFullPath); // Xóa ảnh khỏi thư mục
                    }
                });
            }

            // Xóa quà tặng khỏi cơ sở dữ liệu
            await Gift.findByIdAndDelete(giftId);

            // Gửi thông báo đến người dùng
            await sendNotification({
                title: `Quà tặng "${gift.name}" đã bị xóa.`,
                description: `Quà tặng "${gift.name}" đã được xóa khỏi hệ thống.`,
                url: `/reward/home`, 
                role: 'gift_manager',
                type: 'warning',
            });

            return res.status(200).json({
                success: true,
                message: "Quà tặng đã được xóa thành công"
            });

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Lỗi khi xóa quà tặng",
                error: error.message
            });
        }
    }
}

module.exports = new DeleteGift();
