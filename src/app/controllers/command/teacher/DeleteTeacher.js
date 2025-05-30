const Teacher = require("../../../model/Teacher");
const BorrowRequest = require("../../../model/BorrowRequest");
const messages = require("../../../Extesions/messCost");
const { sendNotification } = require("../../../Extesions/notificationService");

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

            // Gửi thông báo đến người dùng
            await sendNotification({
                title: "Thông báo xóa giảng viên",
                description: `Giảng viên ${teacher.name} đã được xóa thành công.`,
                url: "/users/ListAllTeacher",
                role: "system_admin",
                type: "warning"
            });
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
