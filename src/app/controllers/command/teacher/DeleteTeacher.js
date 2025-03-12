const Teacher = require("../../../model/Teacher");
const BorrowRequest = require("../../../model/BorrowRequest");
const messages = require("../../../Extesions/messCost");

class DeleteTeacher {
    /**
     * API xóa giảng viên
     */
    Handle = async (req, res) => {
        const { teacherId } = req.params;

        try {
            const teacher = await Teacher.findById(teacherId);
            if (!teacher) {
                return res.status(404).json({
                    success: false,
                    message: messages.teacher.teacherNotFound
                });
            }

            // Kiểm tra xem giảng viên có đơn mượn thiết bị không
            const borrowRequests = await BorrowRequest.find({ teacher: teacherId });
            if (borrowRequests.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: messages.teacher.cannotDeleteWithBorrowRequests
                });
            }

            // Xóa giảng viên
            await Teacher.findByIdAndDelete(teacherId);

            return res.status(200).json({
                success: true,
                message: messages.teacher.deleteSuccess
            });

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: messages.teacher.deleteError,
                error: error.message
            });
        }
    };
}

module.exports = new DeleteTeacher();
