const Order = require("../../../model/Order");
const Gift = require("../../../model/Gift");
const { sendNotification } = require("../../../Extesions/notificationService");
const messages = require("../../../Extesions/messCost");

class ApproveOrderController {
  // Duyệt đơn yêu cầu
  async approve(req, res) {
    try {
      const { orderId } = req.params;

      const IdAccount = req.user.id;
      if (!IdAccount) {
        return res.status(401).json({
            success: false,
            message: messages.borrowRequest.accountNotFound
        });
      }

      const order = await Order.findById(orderId).populate("gift");
      if (!order) {
        return res.status(404).json({ success: false, message: "Đơn không tồn tại." });
      }

      if (order.status !== "Chưa duyệt") {
        return res.status(400).json({ success: false, message: "Đơn đã được duyệt hoặc đã giao trước đó." });
      }

      const gift = order.gift;
      if (gift.quantity_in_stock < order.quantity) {
        return res.status(400).json({ success: false, message: "Không đủ số lượng quà tặng trong kho." });
      }

      gift.quantity_in_stock -= order.quantity;
      await gift.save();

      order.status = "Đã duyệt";
      order.approved_by = IdAccount; 
      order.updated_at = Date.now();
      await order.save();

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
