const fs = require("fs");
const multer = require("multer");
const pdf = require("pdf-parse");
const Order = require("../../../model/Order");
const Gift = require("../../../model/Gift");
const Teacher = require("../../../model/Teacher");
const upload = require("../../../Extesions/uploadFilePdf"); // Đảm bảo đúng tên
const { sendNotification } = require("../../../Extesions/notificationService");
const sendEmail = require("../../../Extesions/sendEmail");
const messages = require("../../../Extesions/messCost");

class ImportOrder {
  // API xử lý tải lên file PDF và tạo đơn yêu cầu
  Handle = async (req, res) => {
    upload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ success: false, message: err.message });
      }

      if (!req.file) {
        return res
          .status(400)
          .json({ success: false, message: messages.Order.fileNotFound });
      }

      const IdAccount = req.user.id; 
        if (!IdAccount) {
            return res.status(401).json({
                success: false,
                message: messages.borrowRequest.accountNotFound
            });
        }

      const filePath = req.file.path;
      
      try {
        // Đọc và trích xuất dữ liệu từ file PDF
        const dataBuffer = fs.readFileSync(filePath);
        const pdfData = await pdf(dataBuffer);

        const orderData = await this.extractOrderData(pdfData.text);

        if (!orderData) {
          return res
            .status(400)
            .json({
              success: false,
              message: messages.Order.invalidDataExtracted,
            });
        }

        if (orderData.teacherId == 'Không xác định' ) {
          return res.status(400).json({
            success: false,
            message: messages.Order.teacherNotFound,
          });
        }
        if (orderData.gifts.length === 0) {
          return res.status(400).json({
            success: false,
            message: messages.Order.giftNotFound,
          });
        }

        const purpose = Array.isArray(orderData.purposes)
            ? orderData.purposes.map(p => p.trim()).filter(p => p !== "").join(", ")
            : "";
        // Tạo đơn yêu cầu mới
        const order = new Order({
          Account: IdAccount,
          teacher: orderData.teacherId,
          description: purpose,
          orders: orderData.gifts.map(gift => ({
            giftId: gift.giftId,
            quantity: gift.quantity,
          })),
          status: "Chưa duyệt",
        });

        // Lưu đơn yêu cầu vào MongoDB
        await order.save();

        // Xóa file PDF sau khi xử lý
        fs.unlinkSync(filePath);
        
        // Gửi email thông báo
        const borrowRequests = await Order.find({ _id: order._id })
        .sort({ created_at: -1 })
        .populate("teacher", "name email phone department")
        .populate({
            path: "orders.giftId",
            select: "name category"
        })
        .lean();

        // Kiểm tra dữ liệu borrowRequests
        if (!borrowRequests || borrowRequests.length === 0) {
            throw new Error('Không tìm thấy đơn yêu cầu quà tặng.');
        }

        const borrowRequest = borrowRequests[0];

        const giftNames = borrowRequest.orders?.length
            ? borrowRequest.orders.map(gift => gift.giftId?.name || 'Không xác định').join(', ')
            : 'Không có quà tặng';
        const giftQuantities = borrowRequest.orders?.length
            ? borrowRequest.orders.map(gift => gift.quantity || '0').join(', ')
            : '0';

        // Gửi thông báo đến người dùng
        await sendNotification({
          title: `Đơn yêu cầu mới từ ${borrowRequest.teacher?.name}`,
          description: `Đơn yêu cầu quà tặng "${giftNames}" đã được tạo với số lượng ${giftQuantities}.`,
          url: `/reward/listRequestReward`,
          role: "gift_manager",
          type: "info",
        });

        await sendEmail({
          to: borrowRequest.teacher?.email || 'unknown@example.com',
          subject: 'HỆ THỐNG QUẢN LÝ THIẾT BỊ & QUÀ TẶNG - VICTORY',
          html: `
              <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #2a2a2a; margin: 40px auto; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.3);">
                  <!-- Header -->
                  <tr>
                      <td align="center" bgcolor="#c0392b" style="padding: 30px 20px; border-bottom: 3px solid #e74c3c;">
                          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold; letter-spacing: 1px;">THÔNG BÁO YÊU CẦU QUÀ TẶNG</h1>
                      </td>
                  </tr>
                  <!-- Main Content -->
                  <tr>
                      <td style="padding: 30px 25px;">
                          <h2 style="color: #e74c3c; font-size: 22px; margin-top: 0;">Xin chào,</h2>
                          <p style="font-size: 16px; line-height: 1.6; color: #cccccc; margin-bottom: 20px;">Giảng viên <strong>${borrowRequest.teacher?.name || 'Không xác định'}</strong> đã yêu cầu cấp quà tặng với lý do: ${borrowRequest.description}.</p>
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
        return res.status(201).json({
          success: true,
          message: messages.Order.orderCreatedSuccessfully,
          order,
        });
      } catch (error) {
        console.error("Error processing PDF:", error);
        return res.status(500).json({
          success: false,
          message: messages.Order.errorProcessingPDF,
          error: error.message,
        });
      }
    });
  };

  // Hàm trích xuất dữ liệu từ file PDF
  extractOrderData = async (pdfText) => {
    const orderData = {
      gifts: [],
      purposes: [],
      teacherId: 'Không xác định',
    };

    // 1. Lấy tên người đề nghị
    const nameMatch = pdfText.match(/Người đề nghị:\s*(.*)/);
    if (nameMatch) {
      const Id = await this.getTeacherId(nameMatch[1].trim())
      orderData.teacherId = Id ? Id : 'Không xác định';
    }

    // 2. Trích xuất danh sách quà tặng từ bảng
    // Mỗi dòng có thể có định dạng: 1 Bình giữ nhiệt Đối tác 20
    const giftRegex = /^\d+\s+(.+?)\s{2,}(.+?)\s+(\d+)\s*$/gm;
    let match;
    while ((match = giftRegex.exec(pdfText)) !== null) {
      const giftName = match[1].trim();
      const quantity = parseInt(match[3], 10);

      console.log("Extracted Gift Name:", giftName, "Quantity:", quantity);
      const giftId = await this.getGiftId(giftName);
      if (giftId) {
        orderData.gifts.push({ giftId, quantity });
      }
    }

    // 3. Mục đích sử dụng
    const purposes = [];
    const purposeList = [
      "Công tác/nghiên cứu ở nước ngoài",
      "Tiếp đón khách trong/ngoài nước",
      "Tổ chức hội nghị/hội thảo",
      "Giao lưu, trao đổi học thuật",
    ];
    for (const p of purposeList) {
      if (pdfText.includes(p)) {
        purposes.push(p);
      }
    }
    orderData.purposes = purposes;

    console.log("Extracted Order Data:", orderData);
    return orderData.teacherId && orderData.gifts.length > 0
      ? orderData
      : null;
  };

  // Hàm tìm kiếm Teacher theo tên
  async getTeacherId(name) {
    const teacher = await Teacher.findOne({ name: name });
    return teacher ? teacher._id : null;
  }

  // Hàm tìm kiếm Gift theo tên
  async getGiftId(name) {
    const gift = await Gift.findOne({ name: name });
    return gift ? gift._id : null;
  }
}

module.exports = new ImportOrder();
