const Teacher = require("../../../model/Teacher");
const Validator = require("../../../Extesions/validator");
const messages = require("../../../Extesions/messCost");

class CreateTeacher {
    /**
     * Kiểm tra tính hợp lệ của dữ liệu đầu vào
     * @param {Object} req - Request từ client
     * @returns {Object} errors - Danh sách lỗi nếu có
     */
    Validate(req) {
        const { name, email, phone, department } = req.body;
        let errors = {};

        const nameError = Validator.notEmpty(name, "Tên giảng viên") ||
            Validator.notNull(name, "Tên giảng viên") ||
            Validator.maxLength(name, 100, "Tên giảng viên");
        if (nameError) errors.name = nameError;

        const emailError = Validator.notEmpty(email, "Email") ||
            Validator.notNull(email, "Email") ||
            Validator.isEmail(email);
        if (emailError) errors.email = emailError;

        const phoneError = Validator.notEmpty(phone, "Số điện thoại") ||
            Validator.isPhoneNumber(phone);
        if (phoneError) errors.phone = phoneError;

        const departmentError = Validator.notEmpty(department, "Bộ môn");
        if (departmentError) errors.department = departmentError;

        return errors;
    }

    /**
     * API thêm giảng viên mới
     */
    Handle = async (req, res) => {
        const errors = this.Validate(req);
        if (Object.keys(errors).length > 0) {
            return res.status(400).json({ success: false, errors });
        }

        const { name, email, phone, department } = req.body;

        try {
            // Kiểm tra email đã tồn tại chưa
            const existingTeacher = await Teacher.findOne({ email });
            if (existingTeacher) {
                return res.status(400).json({
                    success: false,
                    message: messages.teacher.duplicateEmail
                });
            }

            const newTeacher = new Teacher({ name, email, phone, department });
            await newTeacher.save();

            return res.status(201).json({
                success: true,
                message: messages.teacher.createSuccess,
                teacher: newTeacher
            });

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: messages.teacher.createError,
                error: error.message
            });
        }
    };
}

module.exports = new CreateTeacher();
