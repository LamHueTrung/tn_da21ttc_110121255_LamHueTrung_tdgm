const Acounts = require('../../../model/Account');
const Validator = require('../../../Extesions/validator');
const messages = require('../../../Extesions/messCost');
const CryptoService = require('../../../Extesions/cryptoService');

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
        const { userName, fullName, birthday, numberPhone, address } = req.body;

        let errors = {};

        const userNameError =
            Validator.notEmpty(userName, 'User name') ||
            Validator.notNull(userName, 'User name') ||
            Validator.maxLength(userName, 50, 'User name') ||
            Validator.containsVietnamese(userName);
        if (userNameError) errors.userName = userNameError;

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

        const { userName, fullName, birthday, numberPhone, address } = req.body;

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
                role: 'sub_admin',
                profile: {
                    fullName: fullName,
                    birthDate: birthday ? new Date(birthday) : null,
                    avatar: req.file ? '/avatars/' + req.file.filename : null,
                    address: address,
                    phone: numberPhone,
                }
            });

            await newAccount.save();

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