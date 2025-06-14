const Order = require("../../../model/Order");
const Gift = require("../../../model/Gift");
const { sendNotification } = require("../../../Extesions/notificationService");
const sendEmail = require("../../../Extesions/sendEmail");
const messages = require("../../../Extesions/messCost");

class ReturnOrder {
  // Trả quà tặng
  async Handle(req, res) {
    try {
      const { orderId } = req.params;
      const returns = req.body.returns || [];
      
      const IdAccount = req.user.id;
      if (!IdAccount) {
        return res.status(401).json({
            success: false,
            message: messages.borrowRequest.accountNotFound
        });
      }

      const order = await Order.findById(orderId).populate('orders.giftId', 'name category price');
      if (!order) {
        return res.status(404).json({ success: false, message: messages.Order.orderNotFound });
      }

      if (order.status !== "Đã duyệt") {
        return res.status(400).json({ success: false, message: messages.Order.orderNotApproved });
      }

      for( const item of returns) {
        if (!item.giftId) {
          return res.status(400).json({ success: false, message: messages.Order.giftNotFound });
        }

        const gift = await Gift.findById(item.giftId);
        if (item.quantity <= 0) {
          return res.status(400).json({ success: false, message: messages.Order.invalidQuantity });
        }

        gift.quantity_in_stock += item.quantity;
        order.orders.forEach(orderItem => {
          if (orderItem.giftId._id.toString() == item.giftId.toString()) {
            orderItem.quantity -= item.quantity;
            if (orderItem.quantity < 1) {
              return res.status(400).json({ success: false, message: messages.Order.quantityExceeds });
            }
          }
        });

        order.returned.push({
          giftId: item.giftId,
          quantity: item.quantity,
          returned_at: Date.now()
        })


        await gift.save();
      }


      order.status = "Có hoàn trả";
      order.approved_by = IdAccount; 
      order.updated_at = Date.now();
      await order.save();

      await sendNotification({
        title: `Quà tặng đã được trả`,
        description: `Đơn yêu cầu quà tặng của giảng viên ${order.teacher.name} đã được trả thành công.`,
        url: `/reward/listRequestReward`,
        role: 'gift_manager',
        type: 'success',
      });
      
      // Gửi email thông báo
      const borrowRequests = await Order.find({ _id: order._id })
      .sort({ created_at: -1 })
      .populate("teacher", "name email phone department")
      .populate({
          path: "returned.giftId",
          select: "name category"
      })
      .lean();

      // Kiểm tra dữ liệu borrowRequests
      if (!borrowRequests || borrowRequests.length === 0) {
          throw new Error('Không tìm thấy đơn yêu cầu quà tặng.');
      }

      const borrowRequest = borrowRequests[0];

      const giftNames = borrowRequest.returned?.length
          ? borrowRequest.returned.map(gift => gift.giftId?.name || 'Không xác định').join(', ')
          : 'Không có quà tặng';
      const giftQuantities = borrowRequest.returned?.length
          ? borrowRequest.returned.map(gift => gift.quantity || '0').join(', ')
          : '0';

      // Gửi email
      await sendEmail({
          to: borrowRequest.teacher?.email || 'unknown@example.com',
          subject: 'HỆ THỐNG QUẢN LÝ THIẾT BỊ & QUÀ TẶNG - VICTORY',
          html: `
              <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #2a2a2a; margin: 40px auto; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.3);">
                  <!-- Header -->
                  <tr>
                      <td align="center" bgcolor="#c0392b" style="padding: 30px 20px; border-bottom: 3px solid #e74c3c;">
                          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold; letter-spacing: 1px;">THÔNG BÁO HOÀN TRẢ QUÀ TẶNG THÀNH CÔNG</h1>
                      </td>
                  </tr>
                  <!-- Main Content -->
                  <tr>
                      <td style="padding: 30px 25px;">
                          <h2 style="color: #e74c3c; font-size: 22px; margin-top: 0;">Xin chào,</h2>
                          <p style="font-size: 16px; line-height: 1.6; color: #cccccc; margin-bottom: 20px;">Đơn yêu cầu quà tặng của giảng viên <strong>${borrowRequest.teacher?.name || 'Không xác định'}</strong> đã hoàn trả thành công.</p>
                          <p style="font-size: 16px; line-height: 1.6; color: #cccccc; margin-bottom: 20px;">Thông tin chi tiết:</p>
                          <table width="100%" border="0" cellspacing="0" cellpadding="10" style="background-color: #3a3a3a; border-radius: 6px; margin-bottom: 20px;">
                              <tr>
                                  <td style="font-size: 16px; color: #e74c3c; font-weight: bold; border-bottom: 1px solid #444444;">Giảng viên:</td>
                                  <td style="font-size: 16px; color: #ffffff; border-bottom: 1px solid #444444;">${borrowRequest.teacher?.name || 'Không xác định'}</td>
                              </tr>
                              <tr>
                                  <td style="font-size: 16px; color: #e74c3c; font-weight: bold; border-bottom: 1px solid #444444;">Quà tặng:</td>
                                  <td style="font-size: 16px; color: #ffffff; border-bottom: 1px solid #444444;">${giftNames}</td>
                              </tr>
                              <tr>
                                  <td style="font-size: 16px; color: #e74c3c; font-weight: bold;">Số lượng:</td>
                                  <td style="font-size: 16px; color: #ffffff;">${giftQuantities}</td>
                              </tr>
                          </table>
                          <p style="font-size: 16px; line-height: 1.6; color: #cccccc; margin-bottom: 20px;">Vui lòng kiểm tra hệ thống để biết thêm chi tiết.</p>
                          <p style="font-size: 16px; line-height: 1.6; color: #cccccc; margin-bottom: 20px;">Thời gian gửi: ${new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}</p>
                      </td>
                  </tr>
                  <!-- Footer -->
                  <tr>
                      <td align="center" style="padding: 20px; font-size: 12px; color: #999999; border-top: 1px solid #444444; background-color: #222222;">
                          <p style="margin: 0;">© 2025 Lâm Huệ Trung. Đã đăng ký bản quyền.</p>
                          <p style="margin: 5px 0 0;">Liên hệ: <a href="mailto:lamhuetrung@gmail.com" style="color: #e74c3c; text-decoration: none;">lamhuetrung@gmail.com</a> | Tel: +84 076 384 9007</p>
                      </td>
                  </tr>
              </table>
          `
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

module.exports = new ReturnOrder();
