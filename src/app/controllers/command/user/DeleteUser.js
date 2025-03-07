const messages = require('../../../Extesions/messCost');
const Acounts = require('../../../model/Account');
const fs = require('fs');
const path = require('path');

class DeleteUser {
    
    /**
     * Vô hiệu hóa tài khoản người dùng bằng cách đặt thuộc tính `isDeleted` thành `true`.
     * Nếu không tìm thấy người dùng hoặc có lỗi xảy ra, trả về thông báo lỗi.
     * 
     * @param {Object} req - Yêu cầu chứa thông tin ID người dùng.
     * @param {Object} res - Phản hồi chứa thông báo kết quả.
     */
    async disable(req, res) {
        const { id } = req.params;  

        try {
            // Cập nhật trạng thái isDeleted của người dùng thành true
            const result = await Acounts.findByIdAndUpdate(id, { isDeleted: true }, { new: true });

            req.session.isSoftDelete = true; // Đánh dấu trạng thái đã vô hiệu hóa
            if (!result) {
                req.session.isSoftDelete = false;
                return res.status(404).json({ success: false, message: messages.deleteUser.softDeleteError });
            }
            
            return res.status(200).json({ success: true, message: messages.deleteUser.softDeleteSuccess });
        } catch (error) {
            console.error(messages.deleteUser.softDeleteError, error);
            return res.status(500).json({ success: false, message: messages.deleteUser.softDeleteError });
        }
    }
    
    /**
     * 🔥 Xóa vĩnh viễn tài khoản người dùng và xóa ảnh đại diện (nếu có).
     * @param {Object} req - Yêu cầu chứa ID người dùng.
     * @param {Object} res - Phản hồi JSON kết quả.
     */
    async delete(req, res) {
        const { id } = req.params;

        try {
            // 🔹 Tìm và xóa người dùng
            const user = await Acounts.findByIdAndDelete(id);
            if (!user) {
                return res.status(404).json({ success: false, message: messages.deleteUser.deleteError });
            }

            // 🔹 Kiểm tra và xóa ảnh đại diện (nếu có)
            if (user.profile && user.profile.avatar && typeof user.profile.avatar === "string" && user.profile.avatar.trim() !== "") {
                const avatarPath = path.join(__dirname, '../../../../../public', user.profile.avatar);

                try {
                    if (fs.existsSync(avatarPath)) {
                        await fs.promises.unlink(avatarPath); // Xóa file bất đồng bộ
                        console.log("Ảnh đại diện đã được xóa:", user.profile.avatar);
                    } 
                } catch (err) {
                    console.error("Lỗi khi xóa ảnh đại diện:", err);
                }
            }

            return res.status(200).json({ success: true, message: messages.deleteUser.deleteSuccess });

        } catch (error) {
            console.error(messages.deleteUser.deleteError, error);
            return res.status(500).json({ success: false, message: "Lỗi khi xóa tài khoản.", error: error.message });
        }
    }
}

module.exports = new DeleteUser();
