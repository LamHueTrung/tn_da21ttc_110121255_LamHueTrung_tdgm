const Teacher = require("../../../model/Teacher");
const Gift = require("../../../model/Gift");
const Order = require("../../../model/Order");
const messages = require("../../../Extesions/messCost");
const Validator = require("../../../Extesions/validator");
const { sendNotification } = require("../../../Extesions/notificationService");
const sendEmail = require("../../../Extesions/sendEmail");
const dotenv = require('dotenv');
dotenv.config();


class CreateOrder {
    Validate(req) {
        const { teacherId, gifts } = req.body;
        let errors = {};

        const teacherError = Validator.notEmpty(teacherId, "Giảng viên") || Validator.notNull(teacherId, "Giảng viên");
        if (teacherError) errors.teacherId = teacherError;

        if (!Array.isArray(gifts) || gifts.length === 0) {
            errors.gifts = messages.gift.noGiftProvided;
        } else {
            gifts.forEach((gift, index) => {
                if (!gift.giftId || !gift.quantity || gift.quantity <= 0) {
                    errors[`gifts[${index}]`] = messages.gift.invalidGift;
                }
            });
        }

        return errors;
    }

    Handle = async (req, res) => {
        const errors = this.Validate(req);
        if (Object.keys(errors).length > 0) {
            return res.status(400).json({ success: false, errors });
        }

        const IdAccount = req.user.id; 
        if (!IdAccount) {
            return res.status(401).json({
                success: false,
                message: messages.gift.accountNotFound
            });
        }
        
        const { teacherId, gifts, purposes } = req.body;

        try {
            const teacher = await Teacher.findById(teacherId);
            if (!teacher) {
                return res.status(404).json({
                    success: false,
                    message: messages.teacher.teacherNotFound
                });
            }

            let selectedGiftItems = [];

            for (const { giftId, quantity } of gifts) {
                const gift = await Gift.findById(giftId);
                if (!gift) {
                    return res.status(404).json({
                        success: false,
                        message: messages.gift.giftNotFound
                    });
                }

                if (gift.quantity_in_stock < quantity) {
                    return res.status(400).json({
                        success: false,
                        message: messages.gift.notEnoughGifts
                    });
                }

            }

            const purpose = Array.isArray(purposes)
            ? purposes.map(p => p.trim()).filter(p => p !== "").join(", ")
            : "";

            const newBorrowRequest = new Order({
                Account: IdAccount,
                teacher: teacher._id,
                orders: gifts.map(g => ({ giftId: g.giftId, quantity: g.quantity })),
                status: "Chưa duyệt",
                description: purpose || "",
            });

            await newBorrowRequest.save();

            // Gửi thông báo 
            await sendNotification({
                title: "Đơn yêu cầu mới",
                description: `Giảng viên ${teacher.name} đã yêu cầu đơn quà tặng.`,
                url: `/reward/listRequestReward`,
                role: "gift_manager",
                type: "info"
            });

            // Gửi email thông báo
            const borrowRequests = await Order.find({ _id: newBorrowRequest._id })
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

            // Gửi email
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
                message: messages.gift.createOrderSuccess,
                borrowRequest: newBorrowRequest
            });

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: messages.gift.createOrderFailed,
                error: error.message
            });
        }
    };
}

module.exports = new CreateOrder();
