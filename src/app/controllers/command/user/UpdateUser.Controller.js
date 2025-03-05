const Acounts = require('../../../../model/Acount');
const Validator = require('../../../../Extesions/validator');
const messages = require('../../../../Extesions/messCost');
const CryptoService = require('../../../../Extesions/cryptoService');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const currentYear = new Date().getFullYear();

class UpdateUser {

    /**
     * Đổi mật khẩu người dùng với các bước kiểm tra xác thực và xác minh mật khẩu cũ.
     * 
     * @param {Object} req - Yêu cầu chứa thông tin token và mật khẩu.
     * @param {Object} res - Đối tượng phản hồi cho người dùng.
     */
    async ChangePassword(req, res) {
        const currentYear = new Date().getFullYear();
        const token = req.session.token;
        const jwtSecretKey = process.env.JWT_SECRET_KEY;
        const { passwordOld, passwordNew } = req.body;

        let errors = {
            passwordOld: '',
            passwordNew: ''
        };

        // Xác thực mật khẩu cũ và mới
        const passwordOldError = Validator.notEmpty(passwordOld, 'password') || Validator.notNull(passwordOld, 'password') || Validator.isPassword(passwordOld);
        if (passwordOldError) errors.passwordOld = passwordOldError;

        const passwordNewError = Validator.notEmpty(passwordNew, 'password') || Validator.notNull(passwordNew, 'password') || Validator.isPassword(passwordNew);
        if (passwordNewError) errors.passwordNew = passwordNewError;

        jwt.verify(token, jwtSecretKey, async (err, decoded) => {
            if (err) {
                console.error(messages.token.tokenVerificationFailed, err);
                return res.status(401).send(messages.token.tokenVerificationSucces);
            }

            req.userId = decoded.id; // Đặt ID người dùng trong yêu cầu sau khi xác minh

            try {
                const admin = await Acounts.findById(req.userId);
                if (!admin) {
                    return res.status(404).send(messages.token.tokenNotFound); 
                }

                const hasErrors = Object.values(errors).some(error => error !== '');
                if (hasErrors) {
                    return res.render('pages/admin/profile', {
                        layout: 'admin',
                        errors,
                        passwordOld: req.body.passwordOld,
                        passwordNew: req.body.passwordNew,
                        data: {
                            role: admin.role === 'system_admin' ? 'SYSTEM ADMIN' : 'SUB ADMIN',
                            fullName: admin.profile.fullName,
                            birthDate: admin.profile.birthDate,
                            specialty: admin.profile.specialty,
                            avatar: admin.profile.avatar,
                            address: admin.profile.address,
                            phone: admin.profile.phone,
                        },
                        year: currentYear
                    });
                } 

                // Giải mã và so sánh mật khẩu
                const decryptedPassword = CryptoService.decrypt(admin.password);
                if (passwordOld !== decryptedPassword) {
                    errors.passwordOld = messages.updateUser.changePasswordDecrypt;
                    return res.render('pages/admin/profile', {
                        layout: 'admin',
                        errors,
                        passwordOld,
                        passwordNew,
                        data: {
                            role: admin.role === 'system_admin' ? 'SYSTEM ADMIN' : 'SUB ADMIN',
                            fullName: admin.profile.fullName,
                            birthDate: admin.profile.birthDate,
                            specialty: admin.profile.specialty,
                            avatar: admin.profile.avatar,
                            address: admin.profile.address,
                            phone: admin.profile.phone,
                        },
                        year: currentYear
                    });
                }

                // Mã hóa mật khẩu mới và lưu thay đổi
                const encryptedPassword = CryptoService.encrypt(passwordNew);
                admin.password = encryptedPassword;
                await admin.save();
                req.session.isChangePassword = true;

                return res.render('pages/admin/profile', {
                    layout: 'admin',
                    data: {
                        role: admin.role === 'system_admin' ? 'SYSTEM ADMIN' : 'SUB ADMIN',
                        fullName: admin.profile.fullName,
                        birthDate: admin.profile.birthDate,
                        specialty: admin.profile.specialty,
                        avatar: admin.profile.avatar,
                        address: admin.profile.address,
                        phone: admin.profile.phone,
                    },
                    year: currentYear,
                    isChangePassword: req.session.isChangePassword
                });
                
            } catch (error) {
                console.error(messages.updateUser.changePasswordError, error);
                return res.status(500).json({ message: messages.serverError });
            }
        });
    }

    /**
     * Xác thực dữ liệu người dùng trước khi cập nhật thông tin.
     * 
     * @param {Object} req - Yêu cầu từ người dùng.
     * @param {Object} currentData - Dữ liệu hiện tại của người dùng.
     * @returns {Object} Đối tượng chứa thông tin lỗi và giá trị hợp lệ.
     */
    async Validate(req, currentData) {
        const {
            fullName = currentData.profile.fullName,
            birthday = currentData.profile.birthDate,
            specialty = currentData.profile.specialty,
            numberPhone = currentData.profile.phone,
            address = currentData.profile.address,
            role = currentData.role,
        } = req.body;

        let errors = {
            fullName: '',
            birthday: '',
            specialty: '',
            numberPhone: '',
            address: '',
            avatar: '',
            role: ''
        };

        const fullNameError = Validator.maxLength(fullName, 50, 'Họ và tên');
        if (fullNameError) errors.fullName = fullNameError;

        const birthdayError = Validator.isDate(birthday, 'Ngày sinh');
        if (birthdayError) errors.birthday = birthdayError;

        const specialtyError = Validator.maxLength(specialty, 100, 'Chuyên ngành');
        if (specialtyError) errors.specialty = specialtyError;

        const numberPhoneError = Validator.isPhoneNumber(numberPhone);
        if (numberPhoneError) errors.numberPhone = numberPhoneError;

        if (req.file) {
            const avatarError = Validator.maxFileSize(req.file.size, 10, 'Ảnh đại diện');
            if (avatarError) errors.avatar = avatarError;
        }

        const roleError = Validator.isEnum(role, ['sub_admin', 'user'], 'Vai trò');
        if (roleError) errors.role = roleError;

        return { errors, values: { fullName, birthday, specialty, numberPhone, address, role } };
    }

    /**
     * Xử lý cập nhật thông tin người dùng.
     * 
     * @param {Object} req - Yêu cầu từ người dùng.
     * @param {Object} res - Phản hồi gửi tới người dùng.
     */
    Handle = async (req, res) => {
        try {
            const currentUser = await Acounts.findById(req.params.id); 
            if (!currentUser) {
                return res.status(404).json({ message: messages.updateUser.notFound });
            }

            const { errors, values } = await this.Validate(req, currentUser);

            const hasErrors = Object.values(errors).some(error => error !== '');
            if (hasErrors) {
                return res.render('pages/admin/updateUser', {
                    layout: 'admin',
                    errors,
                    ...values,
                    currentYear: currentYear
                });
            }

            const updatedData = {
                username: values.userName || currentUser.username,
                role: values.role || currentUser.role,
                profile: {
                    fullName: values.fullName || currentUser.profile.fullName,
                    birthDate: new Date(values.birthday) || currentUser.profile.birthDate,
                    specialty: values.specialty || currentUser.profile.specialty,
                    avatar: req.file ? '/avatars/' + req.file.filename : currentUser.profile.avatar,
                    address: values.address || currentUser.profile.address,
                    phone: values.numberPhone || currentUser.profile.phone,
                }
            };

            // Xóa ảnh đại diện cũ nếu có file mới
            if (req.file) {
                const oldAvatarPath = path.join(__dirname, '../../../../../public', currentUser.profile.avatar); 
                if (fs.existsSync(oldAvatarPath)) {
                    fs.unlinkSync(oldAvatarPath); 
                }
            }
            
            await Acounts.findByIdAndUpdate(req.params.id, updatedData);
            req.session.isUpdate = true;

            return res.render('pages/admin/updateUser', {
                layout: 'admin',
                isUpdate: req.session.isUpdate,
                currentYear: currentYear
            });

        } catch (error) {
            console.error(messages.createUser.updateError, error);
            return res.status(500).json({ message: messages.serverError });
        } finally {
            delete req.session.isUpdate;
        }
    }
}

module.exports = new UpdateUser();
