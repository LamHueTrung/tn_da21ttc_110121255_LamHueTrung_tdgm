const fs = require("fs");
const multer = require("multer");
const pdf = require("pdf-parse");
const Order = require("../../../model/Order");
const Gift = require("../../../model/Gift");
const Teacher = require("../../../model/Teacher");
const upload = require("../../../Extesions/uploadFilePdf"); // Đảm bảo đúng tên

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
          .json({ success: false, message: "No file uploaded." });
      }

      const filePath = req.file.path;

      try {
        // Đọc và trích xuất dữ liệu từ file PDF
        const dataBuffer = fs.readFileSync(filePath);
        const pdfData = await pdf(dataBuffer);

        // Đảm bảo sử dụng await khi gọi extractOrderData
        const orderData = await this.extractOrderData(pdfData.text);

        if (!orderData) {
          return res
            .status(400)
            .json({
              success: false,
              message: "Could not extract order data from PDF.",
            });
        }

        // Kiểm tra nếu teacherId, giftId hoặc quantity không hợp lệ
        if (!orderData.teacherId || !orderData.giftId || !orderData.quantity) {
          return res.status(400).json({
            success: false,
            message:
              "Invalid data extracted from PDF. Ensure teacher, gift, and quantity are correctly extracted.",
          });
        }

        // Tạo đơn yêu cầu mới
        const order = new Order({
          teacher: orderData.teacherId,
          gift: orderData.giftId,
          quantity: orderData.quantity,
          status: "Chưa duyệt",
        });

        // Lưu đơn yêu cầu vào MongoDB
        await order.save();

        // Cập nhật số lượng quà tặng trong kho
        const gift = await Gift.findById(orderData.giftId);
        if (gift) {
          gift.quantity_in_stock -= orderData.quantity;
          await gift.save();
        }

        // Xóa file PDF sau khi xử lý
        fs.unlinkSync(filePath);

        return res.status(201).json({
          success: true,
          message: "Order has been created successfully.",
          order,
        });
      } catch (error) {
        console.error("Error processing PDF:", error);
        return res.status(500).json({
          success: false,
          message: "Error processing PDF file.",
          error: error.message,
        });
      }
    });
  };

  // Hàm trích xuất dữ liệu từ file PDF
  extractOrderData = async (pdfText) => {
    const orderData = {};

    // Cập nhật regex để trích xuất chính xác
    const nameMatch = pdfText.match(/Người yêu cầu:\s*([^\n]+)/);
    const giftMatches = pdfText.match(
      /- (.*) \(Danh mục: (.*)\): (\d+) món, Giá: (\d+) VND/
    );

    if (nameMatch && giftMatches) {
      // Dùng await để đợi Promise trả về
      orderData.teacherId = await this.getTeacherId(nameMatch[1]); // Tìm ID giáo viên theo tên
      orderData.giftId = await this.getGiftId(giftMatches[1]); // Tìm ID quà tặng theo tên
      orderData.quantity = parseInt(giftMatches[3], 10); // Lấy số lượng quà tặng
      return orderData;
    }

    return null;
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
