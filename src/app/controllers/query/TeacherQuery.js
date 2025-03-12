const Teacher = require("../../model/Teacher");
const messages = require("../../Extesions/messCost");

/**
 * Class TeacherQuery - Xử lý API lấy danh sách giảng viên và chi tiết giảng viên
 */
class TeacherQuery {
    /**
     * Lấy danh sách tất cả giảng viên (hỗ trợ phân trang và lọc theo bộ môn)
     * @param {Object} req - Request từ client
     * @param {Object} res - Response để trả JSON
     */
    async GetAllTeachers(req, res) {
        try {
            const { page = 1, limit = 10, department } = req.query; // Hỗ trợ phân trang và lọc theo bộ môn

            const filter = {};
            if (department) {
                filter.department = department;
            }

            const teachers = await Teacher.find(filter)
                .skip((page - 1) * limit)
                .limit(parseInt(limit))
                .lean();

            const total = await Teacher.countDocuments(filter);

            return res.status(200).json({
                success: true,
                message: messages.teacher.getAllSuccess,
                page: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalRecords: total,
                teachers,
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: messages.teacher.getAllError,
                error: error.message,
            });
        }
    }

    /**
     * Lấy thông tin chi tiết của một giảng viên theo ID
     * @param {Object} req - Request từ client
     * @param {Object} res - Response để trả JSON
     */
    async GetTeacherById(req, res) {
        const { teacherId } = req.params;

        try {
            const teacher = await Teacher.findById(teacherId).lean();

            if (!teacher) {
                return res.status(404).json({
                    success: false,
                    message: messages.teacher.teacherNotFound,
                });
            }

            return res.status(200).json({
                success: true,
                message: messages.teacher.getByIdSuccess,
                teacher,
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: messages.teacher.getByIdError,
                error: error.message,
            });
        }
    }
}

module.exports = new TeacherQuery();
