const Acounts = require('../../../model/Account');
const Validator = require('../../../Extesions/validator');
const messages = require('../../../Extesions/messCost');
const CryptoService = require('../../../Extesions/cryptoService');
const { sendNotification } = require("../../../Extesions/notificationService");
const sendEmail = require("../../../Extesions/sendEmail");
const dotenv = require('dotenv');
dotenv.config();

/**
 * Class CreateUser - Xử lý API tạo tài khoản mới
 */
class CreateUser {

    /**
     * Kiểm tra tính hợp lệ của dữ liệu đầu vào
     * @param {Object} req - Request từ client
     * @returns {Object} errors - Đối tượng chứa các lỗi nếu có
     */
    Validate(req) {
        const { userName, fullName, birthday, numberPhone, email, address, role } = req.body;

        let errors = {};

        const userNameError =
            Validator.notEmpty(userName, 'User name') ||
            Validator.notNull(userName, 'User name') ||
            Validator.maxLength(userName, 50, 'User name') ||
            Validator.containsVietnamese(userName);
        if (userNameError) errors.userName = userNameError;

        const roleError = Validator.notEmpty(role, 'Quyền hạn')
        Validator.isEnum(role, ['system_admin', 'device_manager', 'gift_manager'], 'Quyền hạn');
        if (roleError) errors.role = roleError;

        const fullNameError =
            Validator.notEmpty(fullName, 'Họ và tên') ||
            Validator.notNull(fullName, 'Họ và tên') ||
            Validator.maxLength(fullName, 50, 'Họ và tên');
        if (fullNameError) errors.fullName = fullNameError;

        const birthdayError = Validator.isDate(birthday, 'Ngày sinh');
        if (birthdayError) errors.birthday = birthdayError;

        const numberPhoneError =
            Validator.notEmpty(numberPhone, 'Số điện thoại') ||
            Validator.isPhoneNumber(numberPhone);
        if (numberPhoneError) errors.numberPhone = numberPhoneError;

        const emailError = Validator.isEmail(email, 'Email');
        if (emailError) errors.email = emailError;

        const addressError = Validator.notEmpty(address, 'Địa chỉ') ;
        if (addressError) errors.address = addressError;

        if (req.file) {
            const avatarError = 
            Validator.maxFileSize(req.file.size, 10, 'Ảnh đại diện')||
            Validator.isImageFile(req.file);
            if (avatarError) errors.avatar = avatarError;
        }

        return errors;
    }

    /**
     * Xử lý API tạo tài khoản người dùng mới
     * @param {Object} req - Request từ client
     * @param {Object} res - Response để trả JSON
     */
    Handle = async (req, res) => {
        const errors = this.Validate(req);
        if (Object.keys(errors).length > 0) {
            return res.status(400).json({ success: false, errors });
        }

        const { userName, fullName, birthday, numberPhone, email, address, role } = req.body;

        try {
            // Kiểm tra xem username đã tồn tại chưa
            const existingAccount = await Acounts.findOne({ username: userName });
            if (existingAccount) {
                return res.status(400).json({
                    success: false,
                    errors: { userName: messages.createUser.accountExist },
                });
            }

            // Mã hóa mật khẩu
            const password = userName + "*"; // Đặt mật khẩu mặc định
            const encryptedPassword = CryptoService.encrypt(password);

            // Tạo tài khoản mới
            const newAccount = new Acounts({
                username: userName,
                password: encryptedPassword,
                role: role,
                profile: {
                    fullName: fullName,
                    birthDate: birthday ? new Date(birthday) : null,
                    avatar: req.file ? '/avatars/' + req.file.filename : null,
                    address: address,
                    phone: numberPhone,
                    email: email
                }
            });

            await newAccount.save();

            // Gửi email thông báo tạo tài khoản
            const roleName = role === 'system_admin' ? 'Quản trị viên hệ thống' : ('device_manager' ? 'Quản lý thiết bị' : (role === 'gift_manager' ? 'Quản lý quà tặng' : 'Người dùng'));
            await sendEmail({
                to: email,
                subject: 'HỆ THỐNG QUẢN LÝ THIẾT BỊ & QUÀ TẶNG - VICTORY',
                html: `
                    <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #2a2a2a; margin: 40px auto; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.3);">
                    <!-- Header -->
                    <tr>
                        <td align="center" bgcolor="#c0392b" style="padding: 30px 20px; border-bottom: 3px solid #e74c3c;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold; letter-spacing: 1px;">Chào mừng đến với hệ thống quản lý thiết bị và quà tặng của trung tâm Victory!</h1>
                        </td>
                    </tr>
                    <!-- Main Content -->
                    <tr>
                        <td style="padding: 30px 25px;">
                            <h2 style="color: #e74c3c; font-size: 22px; margin-top: 0; font自主: none;">Chào ${fullName},</h2>
                            <p style="font-size: 16px; line-height: 1.6; color: #cccccc; margin-bottom: 20px;">Bạn đã được cấp tài khoản ${roleName} trên hệ thống quản lý thiết bị và quà tặng. Dưới đây là thông tin tài khoản của bạn:</p>
                            <table width="100%" border="0" cellspacing="0" cellpadding="8" style="background-color: #3a3a3a; border-radius: 6px; margin: 20px 0;">
                                <tr>
                                    <td style="font-size: 16px; color: #e74c3c; font-weight: bold;">Tài khoản:</td>
                                    <td style="font-size: 16px; color: #ffffff;">${userName}</td>
                                </tr>
                                <tr>
                                    <td style="font-size: 16px; color: #e74c3c; font-weight: bold;">Mật khẩu:</td>
                                    <td style="font-size: 16px; color: #ffffff;">${password}</td>
                                </tr>
                            </table>
                            <p style="font-size: 16px; line-height: 1.6; color: #cccccc; margin-bottom: 20px;">Vui lòng đăng nhập và thay đổi mật khẩu ngay khi có thể để bảo vệ tài khoản của bạn.</p>
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

            // Gửi thông báo đến người dùng
            await sendNotification({
                title: `Tài khoản "${newAccount.username}" đã được tạo thành công.`,
                description: `Tài khoản "${newAccount.username}" đã được tạo.`,
                url: `/users/profile/${newAccount._id}`,
                role: `${newAccount.role}`,
                type: "info"
            });
            
            return res.status(201).json({
                success: true,
                message: messages.createUser.accountCreateSuccess,
                user: {
                    username: newAccount.username,
                    role: newAccount.role,
                    profile: newAccount.profile
                }
            });

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: messages.createUser.RegisterErorr,
                error: error.message
            });
        }
    }
}

module.exports = new CreateUser();