const Teacher = require("../../../model/Teacher");
const Validator = require("../../../Extesions/validator");
const messages = require("../../../Extesions/messCost");

class UpdateTeacher {
    /**
     * Kiểm tra tính hợp lệ của dữ liệu đầu vào
     * @param {Object} req - Request từ client
     * @returns {Object} errors - Danh sách lỗi nếu có
     */
    Validate(req) {
        const { name, email, phone, department } = req.body;
        let errors = {};

        if (name) {
            const nameError = Validator.notEmpty(name, "Tên giảng viên") ||
                Validator.maxLength(name, 100, "Tên giảng viên");
            if (nameError) errors.name = nameError;
        }

        if (email) {
            const emailError = Validator.isEmail(email);
            if (emailError) errors.email = emailError;
        }

        if (phone) {
            const phoneError = Validator.isPhoneNumber(phone);
            if (phoneError) errors.phone = phoneError;
        }

        if (department) {
            const departmentError = Validator.notEmpty(department, "Bộ môn");
            if (departmentError) errors.department = departmentError;
        }

        return errors;
    }

    /**
     * API cập nhật thông tin giảng viên
     */
    Handle = async (req, res) => {
        const { teacherId } = req.params;
        const errors = this.Validate(req);

        if (Object.keys(errors).length > 0) {
            return res.status(400).json({ success: false, errors });
        }

        try {
            let teacher = await Teacher.findById(teacherId);
            if (!teacher) {
                return res.status(404).json({
                    success: false,
                    message: messages.teacher.teacherNotFound
                });
            }

            const { name, email, phone, department } = req.body;

            // Cập nhật thông tin, nếu có giá trị mới thì cập nhật, nếu không thì giữ nguyên
            teacher.name = name || teacher.name;
            teacher.email = email || teacher.email;
            teacher.phone = phone || teacher.phone;
            teacher.department = department || teacher.department;

            await teacher.save();

            return res.status(200).json({
                success: true,
                message: messages.teacher.updateSuccess,
                teacher
            });

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: messages.teacher.updateError,
                error: error.message
            });
        }
    };
}

module.exports = new UpdateTeacher();
