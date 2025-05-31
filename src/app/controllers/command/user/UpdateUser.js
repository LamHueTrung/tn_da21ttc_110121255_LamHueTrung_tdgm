const Acounts = require('../../../model/Account');
const Validator = require('../../../Extesions/validator');
const messages = require('../../../Extesions/messCost');
const CryptoService = require('../../../Extesions/cryptoService');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const { sendNotification } = require("../../../Extesions/notificationService");
const sendEmail = require("../../../Extesions/sendEmail");
const dotenv = require('dotenv');
dotenv.config();

class UpdateUser {

    /**
     * Đổi mật khẩu người dùng.
     * @param {Object} req - Request chứa token và mật khẩu.
     * @param {Object} res - Response JSON.
     */
    async ChangePassword(req, res) {
        try {
            const { passwordOld, passwordNew } = req.body;

            let errors = {
                passwordOld: Validator.notEmpty(passwordOld, 'password') || Validator.isPassword(passwordOld),
                passwordNew: Validator.notEmpty(passwordNew, 'password') || Validator.isPassword(passwordNew),
            };

            // Kiểm tra lỗi nhập liệu
            if (errors.passwordOld || errors.passwordNew) {
                return res.status(400).json({ success: false, errors });
            }

            // Xác thực token
            const decoded = req.user;
            const admin = await Acounts.findById(decoded.id);
            if (!admin) return res.status(404).json({ success: false, message: messages.token.tokenNotFound });

            // Kiểm tra mật khẩu cũ
            const decryptedPassword = CryptoService.decrypt(admin.password);
            if (passwordOld !== decryptedPassword) {
                return res.status(403).json({ success: false, 
                    errors: { passwordOld: messages.updateUser.changePasswordDecrypt } });
            }

            // Cập nhật mật khẩu mới
            admin.password = CryptoService.encrypt(passwordNew);
            await admin.save();

            // Gửi email thông báo thay đổi mật khẩu
            await sendEmail({
                to: admin.profile.email,
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
                        <h2 style="color: #e74c3c; font-size: 22px; margin-top: 0;">Chào ${admin.profile.fullName},</h2>
                        <p style="font-size: 16px; line-height: 1.6; color: #cccccc; margin-bottom: 20px;">Tài khoản của bạn vừa thay đổi mật khẩu. Dưới đây là thông tin liên quan:</p>
                        <table width="100%" border="0" cellspacing="0" cellpadding="8" style="background-color: #3a3a3a; border-radius: 6px; margin: 20px 0;">
                            <tr>
                                <td style="font-size: 16px; color: #e74c3c; font-weight: bold;">Mật khẩu cũ:</td>
                                <td style="font-size: 16px; color: #ffffff;">${passwordOld}</td>
                                <td style="font-size: 16px; color: #e74c3c; font-weight: bold;">Mật khẩu mới:</td>
                                <td style="font-size: 16px; color: #ffffff;">${passwordNew}</td>
                            </tr>
                        </table>
                        <p style="font-size: 16px; line-height: 1.6; color: #cccccc; margin-bottom: 20px;">Vui lòng đăng nhập với mật khẩu mới và tiếp tục.</p>
                        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 30px;">
                            <tr>
                                <td align="center">
                                    <a href="${process.env.API_URL}" style="background-color: #e74c3c; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: bold; padding: 12px 30px; border-radius: 5px; display: inline-block; transition: background-color 0.3s ease;">Đăng nhập ngay</a>
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
            return res.status(200).json({ success: true, message: admin });

        } catch (error) {
            return res.status(500).json({ success: false, message: messages.serverError, error: error.message });
        }
    }

    /**
     * Xác thực dữ liệu người dùng trước khi cập nhật.
     * @param {Object} req - Request từ client.
     * @param {Object} currentData - Dữ liệu hiện tại của user.
     * @returns {Object} Lỗi nếu có, hoặc giá trị hợp lệ.
     */
    Validate(req, currentData) {
        const {
            fullName = currentData.profile.fullName,
            birthday = currentData.profile.birthDate,
            numberPhone = currentData.profile.phone,
            email = currentData.profile.email,
            address = currentData.profile.address,
            role = currentData.role,
        } = req.body;

        let errors = {
            fullName: '',
            birthday: '',
            numberPhone: '',
            email: '',
            address: '',
            avatar: '',
        };

        const fullNameError = Validator.maxLength(fullName, 50, 'Họ và tên');
        if (fullNameError) errors.fullName = fullNameError;

        const roleError = Validator.notEmpty(role, 'Quyền hạn')
        Validator.isEnum(role, ['system_admin', 'device_manager', 'gift_manager'], 'Quyền hạn');
        if (roleError) errors.role = roleError;

        const birthdayError = Validator.isDate(birthday, 'Ngày sinh');
        if (birthdayError) errors.birthday = birthdayError;

        const numberPhoneError = Validator.isPhoneNumber(numberPhone);
        if (numberPhoneError) errors.numberPhone = numberPhoneError;

        const emailError = Validator.isEmail(email, 'Email');
        if (emailError) errors.email = emailError;

        if (req.file) {
            const avatarError = Validator.maxFileSize(req.file.size, 10, 'Ảnh đại diện');
            if (avatarError) errors.avatar = avatarError;
        }

        return { errors, values: { fullName, birthday, numberPhone, address } };
    }

    /**
     * Cập nhật thông tin người dùng.
     * @param {Object} req - Request từ client.
     * @param {Object} res - Response JSON.
     */
    /**
     * Xử lý API cập nhật người dùng theo ID
     * @param {Object} req - Request từ client
     * @param {Object} res - Response để trả JSON
     */
    Handle = async (req, res) => {
        try {
            const { id } = req.params; // Lấy ID từ URL

            // Kiểm tra xem người dùng có tồn tại không
            const currentUser = await Acounts.findById(id);
            if (!currentUser) {
                return res.status(404).json({ success: false, 
                    error: messages.updateUser.userNotFound });
            }

            // Lấy dữ liệu cần cập nhật từ request
            const { userName, fullName, birthday, address, numberPhone, email, role } = req.body;

            // Tạo dữ liệu cập nhật, giữ nguyên dữ liệu cũ nếu không có giá trị mới
            const updatedData = {
                username: userName,
                role: role,
                profile: {
                    fullName: fullName || currentUser.profile.fullName,
                    birthDate: birthday ? new Date(birthday) : currentUser.profile.birthDate,
                    avatar: req.file ? '/avatars/' + req.file.filename : currentUser.profile.avatar,
                    address: address || currentUser.profile.address,
                    phone: numberPhone || currentUser.profile.phone,
                    email: email || currentUser.profile.email
                }
            };

            // Xóa avatar cũ nếu có file mới
            if (req.file && currentUser.profile.avatar) {
                const oldAvatarPath = path.join(__dirname, '../../../../../public', currentUser.profile.avatar);
                if (fs.existsSync(oldAvatarPath)) {
                    fs.unlinkSync(oldAvatarPath);
                }
            }

            // Cập nhật thông tin người dùng trong database
            await Acounts.findByIdAndUpdate(id, updatedData, { new: true });

            return res.status(200).json({ success: true, message: messages.updateUser.updateSuccess });

        } catch (error) {
            return res.status(500).json({ success: false, message: messages.serverError, error: error.message });
        }
    };

    /**
     * Khôi phục tài khoản người dùng bằng cách đặt thuộc tính `isDeleted` thành `false`.
     * Nếu không tìm thấy người dùng hoặc có lỗi xảy ra, trả về thông báo lỗi.
     * 
     * @param {Object} req - Yêu cầu chứa thông tin ID người dùng.
     * @param {Object} res - Phản hồi chứa thông báo kết quả.
     */
    async restore(req, res) {
        const { id } = req.params;

        try {
            // Cập nhật trạng thái isDeleted của người dùng thành false
            const result = await Acounts.findByIdAndUpdate(id, { isDeleted: false }, { new: true });

            req.session.isRestore = true; // Đánh dấu trạng thái đã khôi phục
            if (!result) {
                req.session.isRestore = false;
                return res.status(404).json({ success: false, message: messages.restoreUser.restoreError });
            }
            
            // Gửi thông báo đến người dùng
            const user = await Acounts.findById(id);
            await sendNotification({
                title: "Tài khoản đã được khôi phục",
                description: `Tài khoản "${user.profile.fullName}" đã được khôi phục.`,
                url: "users/listAllUser",
                role: user.role,
                type: "success"
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
                        <p style="font-size: 16px; line-height: 1.6; color: #cccccc; margin-bottom: 20px;">Chúng tôi thông báo rằng tài khoản ${roleName} của bạn trên hệ thống quản lý thiết bị và quà tặng đã được khôi phục. Dưới đây là thông tin liên quan:</p>
                        <table width="100%" border="0" cellspacing="0" cellpadding="8" style="background-color: #3a3a3a; border-radius: 6px; margin: 20px 0;">
                            <tr>
                                <td style="font-size: 16px; color: #e74c3c; font-weight: bold;">Tài khoản:</td>
                                <td style="font-size: 16px; color: #ffffff;">${user.username}</td>
                            </tr>
                        </table>
                        <p style="font-size: 16px; line-height: 1.6; color: #cccccc; margin-bottom: 20px;">Chúng tôi đã xem xét và quyết định khôi phục tài khoản của bạn, mọi chi tiết vui lòng liên hệ qua thông tin bên dưới.</p>
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

            return res.status(200).json({ success: true, message: messages.restoreUser.restoreSuccess });
        } catch (error) {
            console.error(messages.restoreUser.restoreError, error);
            return res.status(500).json({ success: false, message: messages.restoreUser.restoreError });
        }
    }
}

module.exports = new UpdateUser();
