const Notification = require('../../../model/Notification');
const messages = require('../../../Extesions/messCost');

class UpdateNotificationRead {
    Handle = async (req, res) => {
        const { id } = req.params;
        const userId = req.user?.id; 

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'Người dùng không xác định'
            });
        }

        try {
            const notification = await Notification.findById(id);

            if (!notification) {
                return res.status(404).json({
                    success: false,
                    message: messages.notification.NotFound
                });
            }

            // Nếu user đã đọc thì không cần cập nhật lại
            const alreadyRead = notification.readBy?.some(uid => uid.toString() === userId.toString());
            if (alreadyRead) {
                return res.status(200).json({
                    success: true,
                    message: 'Thông báo đã được đánh dấu là đã đọc',
                    data: notification
                });
            }

            // Đánh dấu đã đọc
            notification.readBy = [...(notification.readBy || []), userId];
            await notification.save();

            return res.status(200).json({
                success: true,
                message: messages.notification.UpdatedRead,
                data: notification
            });
        } catch (error) {
            console.error('Update isRead error:', error);
            return res.status(500).json({
                success: false,
                message: messages.notification.UpdateError
            });
        }
    }
}

module.exports = new UpdateNotificationRead();
