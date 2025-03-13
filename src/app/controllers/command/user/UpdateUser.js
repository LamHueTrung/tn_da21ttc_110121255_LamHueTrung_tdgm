const Acounts = require('../../../model/Account');
const Validator = require('../../../Extesions/validator');
const messages = require('../../../Extesions/messCost');
const CryptoService = require('../../../Extesions/cryptoService');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

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
            address = currentData.profile.address,
        } = req.body;

        let errors = {
            fullName: '',
            birthday: '',
            numberPhone: '',
            address: '',
            avatar: '',
        };

        const fullNameError = Validator.maxLength(fullName, 50, 'Họ và tên');
        if (fullNameError) errors.fullName = fullNameError;

        const birthdayError = Validator.isDate(birthday, 'Ngày sinh');
        if (birthdayError) errors.birthday = birthdayError;

        const numberPhoneError = Validator.isPhoneNumber(numberPhone);
        if (numberPhoneError) errors.numberPhone = numberPhoneError;

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
            const { userName, fullName, birthday, address, numberPhone } = req.body;

            // Tạo dữ liệu cập nhật, giữ nguyên dữ liệu cũ nếu không có giá trị mới
            const updatedData = {
                username: userName,
                role: currentUser.role,
                profile: {
                    fullName: fullName || currentUser.profile.fullName,
                    birthDate: birthday ? new Date(birthday) : currentUser.profile.birthDate,
                    avatar: req.file ? '/avatars/' + req.file.filename : currentUser.profile.avatar,
                    address: address || currentUser.profile.address,
                    phone: numberPhone || currentUser.profile.phone,
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
            
            return res.status(200).json({ success: true, message: messages.restoreUser.restoreSuccess });
        } catch (error) {
            console.error(messages.restoreUser.restoreError, error);
            return res.status(500).json({ success: false, message: messages.restoreUser.restoreError });
        }
    }
}

module.exports = new UpdateUser();
