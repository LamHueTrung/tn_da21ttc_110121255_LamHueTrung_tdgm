const BorrowRequest = require("../../../model/BorrowRequest");
const DeviceItem = require("../../../model/DeviceItem");
const Device = require("../../../model/Device");
const Location = require("../../../model/Location");
const Room = require("../../../model/Room");
const messages = require("../../../Extesions/messCost");

class ReturnBorrowRequest {
    Handle = async (req, res) => {
        const { borrowRequestId } = req.params;

        try {
            // Kiểm tra xem đơn mượn có tồn tại không
            const borrowRequest = await BorrowRequest.findById(borrowRequestId);
            if (!borrowRequest) {
                return res.status(404).json({
                    success: false,
                    message: messages.borrowRequest.borrowNotFound
                });
            }

            // Nếu đơn mượn đã trả hết rồi
            if (borrowRequest.status === "Đã trả" || borrowRequest.deviceItems.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: messages.borrowRequest.alreadyReturned
                });
            }

            // Lấy "Kho chính"
            const mainWarehouse = await Room.ensureMainWarehouse();
            
            for (const itemId of borrowRequest.deviceItems) {
                const item = await DeviceItem.findById(itemId);
                if (!item) continue;

                // Cập nhật trạng thái `DeviceItem`
                item.status = "Mới";
                item.room = mainWarehouse._id;  // ✅ Gán về "Kho chính" thay vì `null`
                item.location = mainWarehouse.location;  // ✅ Gán về "Kho chính" thay vì `null`
                item.borrowedBy = null;
                await item.save();

                // Cập nhật số lượng thiết bị
                await Device.findByIdAndUpdate(item.device, { $inc: { total_quantity: 1 } });
            }

            // Xóa tất cả `DeviceItem` khỏi đơn mượn
            borrowRequest.deviceItems = [];
            borrowRequest.status = "Đã trả";
            borrowRequest.return_date = new Date();
            await borrowRequest.save();

            return res.status(200).json({
                success: true,
                message: messages.borrowRequest.returnSuccess,
                borrowRequest
            });

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: messages.borrowRequest.returnError,
                error: error.message
            });
        }
    };
}

module.exports = new ReturnBorrowRequest();
