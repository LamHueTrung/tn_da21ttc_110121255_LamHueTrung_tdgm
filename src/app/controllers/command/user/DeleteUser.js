const messages = require('../../../Extesions/messCost');
const Acounts = require('../../../model/Account');
const { sendNotification } = require("../../../Extesions/notificationService");
const sendEmail = require("../../../Extesions/sendEmail");
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
            
            // Gửi thông báo đến người dùng
            const user = await Acounts.findById(id);
            await sendNotification({
                title: "Tài khoản đã bị vô hiệu hóa",
                description: `Tài khoản "${user.profile.fullName}" đã được vô hiệu hóa.`,
                url: "users/listAllUser",
                role: user.role,
                type: "warning"
            });

            // Gửi email thông báo
            const roleName = user.role === 'system_admin' ? 'Quản trị viên hệ thống' : ('device_manager' ? 'Quản lý thiết bị' : (role === 'gift_manager' ? 'Quản lý quà tặng' : 'Người dùng'));

            await sendEmail({
                to: user.profile.email,
                subject: 'HỆ THỐNG QUẢN LÝ THIẾT BỊ & QUÀ TẶNG - VICTORY',
                html: `
                <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #2a2a2a; margin: 40px auto; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.3);">
                <!-- Header -->
                <tr>
                    <td align="center" bgcolor="#c0392b" style="padding: 30px 20px; border-bottom: 3px solid #e74c3c;">
                        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold; letter-spacing: 1px;">Thông báo từ trung tâm Victory!</h1>
                    </td>
                </tr>
                <!-- Main Content -->
                <tr>
                    <td style="padding: 30px 25px;">
                        <h2 style="color: #e74c3c; font-size: 22px; margin-top: 0;">Chào ${user.profile.fullName},</h2>
                        <p style="font-size: 16px; line-height: 1.6; color: #cccccc; margin-bottom: 20px;">Chúng tôi rất tiếc phải thông báo rằng tài khoản ${roleName} của bạn trên hệ thống quản lý thiết bị và quà tặng đã bị vô hiệu hóa. Dưới đây là thông tin liên quan:</p>
                        <table width="100%" border="0" cellspacing="0" cellpadding="8" style="background-color: #3a3a3a; border-radius: 6px; margin: 20px 0;">
                            <tr>
                                <td style="font-size: 16px; color: #e74c3c; font-weight: bold;">Tài khoản:</td>
                                <td style="font-size: 16px; color: #ffffff;">${user.username}</td>
                            </tr>
                        </table>
                        <p style="font-size: 16px; line-height: 1.6; color: #cccccc; margin-bottom: 20px;">Lý do vô hiệu hóa: Tài khoản của bạn có thể đã vi phạm chính sách sử dụng hoặc không được sử dụng trong thời gian dài. Nếu bạn cho rằng đây là nhầm lẫn, vui lòng liên hệ với chúng tôi để được hỗ trợ.</p>
                        <p style="font-size: 16px; line-height: 1.6; color: #cccccc; margin-bottom: 20px;">Để biết thêm chi tiết hoặc khôi phục tài khoản, vui lòng liên hệ qua thông tin bên dưới.</p>
                        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 30px;">
                            <tr>
                                <td align="center">
                                    <a href="mailto:lamhuetrung@gmail.com" style="background-color: #e74c3c; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: bold; padding: 12px 30px; border-radius: 5px; display: inline-block;">Liên hệ hỗ trợ</a>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
                <!-- Footer -->
                <tr>
                    <td align="center" style="padding: 20px; font-size: 12px; color: #999999; border-top: 1px solid #444444; background-color: #222222;">
                        <p style="margin: 0;">© 2025 Lâm Huệ Trung. Đã đăng ký bản quyền.</p>
                        <p style="margin: 5px 0 0;">Liên hệ: <a href="mailto:lamhuetrung@gmail.com" style="color: #e74c3c; text-decoration: none;">lamhuetrung@gmail.com</a> | Tel: +84 076 384 9007</p>
                    </td>
                </tr>
            </table>
                `
            });

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

            // 🔹 Gửi thông báo đến người dùng
            await sendNotification({
                title: "Tài khoản đã bị xóa",
                description: `Tài khoản "${user.profile.fullName}" đã được xóa vĩnh viễn.`,
                url: "users/listAllUser", 
                role: user.role,
                type: "warning"
            });
            
            // Gửi email thông báo
            const roleName = user.role === 'system_admin' ? 'Quản trị viên hệ thống' : ('device_manager' ? 'Quản lý thiết bị' : (role === 'gift_manager' ? 'Quản lý quà tặng' : 'Người dùng'));

            await sendEmail({
                to: user.profile.email,
                subject: 'HỆ THỐNG QUẢN LÝ THIẾT BỊ & QUÀ TẶNG - VICTORY',
                html: `
                <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #2a2a2a; margin: 40px auto; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.3);">
                <!-- Header -->
                <tr>
                    <td align="center" bgcolor="#c0392b" style="padding: 30px 20px; border-bottom: 3px solid #e74c3c;">
                        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold; letter-spacing: 1px;">Thông báo từ trung tâm Victory!</h1>
                    </td>
                </tr>
                <!-- Main Content -->
                <tr>
                    <td style="padding: 30px 25px;">
                        <h2 style="color: #e74c3c; font-size: 22px; margin-top: 0;">Chào ${user.profile.fullName},</h2>
                        <p style="font-size: 16px; line-height: 1.6; color: #cccccc; margin-bottom: 20px;">Chúng tôi rất tiếc phải thông báo rằng tài khoản ${roleName} của bạn trên hệ thống quản lý thiết bị và quà tặng đã bị xoá vĩnh viễn. Dưới đây là thông tin liên quan:</p>
                        <table width="100%" border="0" cellspacing="0" cellpadding="8" style="background-color: #3a3a3a; border-radius: 6px; margin: 20px 0;">
                            <tr>
                                <td style="font-size: 16px; color: #e74c3c; font-weight: bold;">Tài khoản:</td>
                                <td style="font-size: 16px; color: #ffffff;">${user.username}</td>
                            </tr>
                        </table>
                        <p style="font-size: 16px; line-height: 1.6; color: #cccccc; margin-bottom: 20px;">Lý do vô hiệu hóa: Tài khoản của bạn có thể đã vi phạm chính sách sử dụng hoặc không được sử dụng trong thời gian dài. Nếu bạn cho rằng đây là nhầm lẫn, vui lòng liên hệ với chúng tôi để được hỗ trợ.</p>
                        <p style="font-size: 16px; line-height: 1.6; color: #cccccc; margin-bottom: 20px;">Để biết thêm chi tiết hoặc khôi phục tài khoản, vui lòng liên hệ qua thông tin bên dưới.</p>
                        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 30px;">
                            <tr>
                                <td align="center">
                                    <a href="mailto:lamhuetrung@gmail.com" style="background-color: #e74c3c; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: bold; padding: 12px 30px; border-radius: 5px; display: inline-block;">Liên hệ hỗ trợ</a>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
                <!-- Footer -->
                <tr>
                    <td align="center" style="padding: 20px; font-size: 12px; color: #999999; border-top: 1px solid #444444; background-color: #222222;">
                        <p style="margin: 0;">© 2025 Lâm Huệ Trung. Đã đăng ký bản quyền.</p>
                        <p style="margin: 5px 0 0;">Liên hệ: <a href="mailto:lamhuetrung@gmail.com" style="color: #e74c3c; text-decoration: none;">lamhuetrung@gmail.com</a> | Tel: +84 076 384 9007</p>
                    </td>
                </tr>
            </table>
                `
            });

            return res.status(200).json({ success: true, message: messages.deleteUser.deleteSuccess });

        } catch (error) {
            console.error(messages.deleteUser.deleteError, error);
            return res.status(500).json({ success: false, message: "Lỗi khi xóa tài khoản.", error: error.message });
        }
    }
}

module.exports = new DeleteUser();
