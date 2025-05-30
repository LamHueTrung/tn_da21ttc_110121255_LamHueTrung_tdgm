const Order = require("../../../model/Order");
const Gift = require("../../../model/Gift");
const { sendNotification } = require("../../../Extesions/notificationService");

class ApproveOrderController {
  // Duyệt đơn yêu cầu
  async approve(req, res) {
    try {
      const { orderId } = req.params;

      // 1. Lấy đơn yêu cầu
      const order = await Order.findById(orderId).populate("gift");
      if (!order) {
        return res.status(404).json({ success: false, message: "Đơn không tồn tại." });
      }

      // 2. Kiểm tra trạng thái hiện tại
      if (order.status !== "Chưa duyệt") {
        return res.status(400).json({ success: false, message: "Đơn đã được duyệt hoặc đã giao trước đó." });
      }

      // 3. Kiểm tra tồn kho
      const gift = order.gift;
      if (gift.quantity_in_stock < order.quantity) {
        return res.status(400).json({ success: false, message: "Không đủ số lượng quà tặng trong kho." });
      }

      // 4. Cập nhật tồn kho
      gift.quantity_in_stock -= order.quantity;
      await gift.save();

      // 5. Cập nhật đơn
      order.status = "Đã duyệt";
      order.updated_at = Date.now();
      await order.save();

      // 6. Gửi thông báo đến người dùng
      await sendNotification({
        title: `Đơn yêu cầu quà tặng đã được duyệt`,
        description: `Đơn yêu cầu quà tặng "${gift.name}" của bạn đã được duyệt.`,
        url: `/reward/listRequestReward`,
        role: 'gift_manager',
        type: 'success',
      });
      return res.status(200).json({
        success: true,
        message: "Đơn yêu cầu đã được duyệt thành công.",
        order
      });
    } catch (error) {
      console.error("Lỗi duyệt đơn:", error);
      return res.status(500).json({ success: false, message: "Lỗi hệ thống.", error: error.message });
    }
  }
}

module.exports = new ApproveOrderController();
