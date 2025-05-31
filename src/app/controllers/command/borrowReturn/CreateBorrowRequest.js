const BorrowRequest = require("../../../model/BorrowRequest");
const Device = require("../../../model/Device");
const DeviceItem = require("../../../model/DeviceItem");
const Teacher = require("../../../model/Teacher");
const Room = require("../../../model/Room");
const Location = require("../../../model/Location");
const messages = require("../../../Extesions/messCost");
const Validator = require("../../../Extesions/validator");
const { sendNotification } = require("../../../Extesions/notificationService");
const sendEmail = require("../../../Extesions/sendEmail");
const dotenv = require('dotenv');
dotenv.config();


class CreateBorrowRequest {
    Validate(req) {
        const { teacherId, roomId, devices } = req.body;
        let errors = {};

        const teacherError = Validator.notEmpty(teacherId, "Giảng viên") || Validator.notNull(teacherId, "Giảng viên");
        if (teacherError) errors.teacherId = teacherError;

        if (!Array.isArray(devices) || devices.length === 0) {
            errors.devices = messages.borrowRequest.noDevicesProvided;
        } else {
            devices.forEach((device, index) => {
                if (!device.deviceId || !device.quantity || device.quantity <= 0) {
                    errors[`devices[${index}]`] = messages.borrowRequest.invalidDevice;
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

        const { teacherId, roomId, devices } = req.body;

        try {
            const teacher = await Teacher.findById(teacherId);
            if (!teacher) {
                return res.status(404).json({
                    success: false,
                    message: messages.borrowRequest.teacherNotFound
                });
            }

            let room = null;
            if (roomId) {
                room = await Room.findById(roomId);
                if (!room) {
                    return res.status(404).json({
                        success: false,
                        message: messages.borrowRequest.roomNotFound
                    });
                }
            } else {
                room = null;
            }

            let personalLocation = null;
            if (!room) {
                personalLocation = await Location.ensurePersonalUseLocation();
            }

            let selectedDeviceItems = [];
            let updateDeviceQuantities = [];

            for (const { deviceId, quantity } of devices) {
                const device = await Device.findById(deviceId);
                if (!device) {
                    return res.status(404).json({
                        success: false,
                        message: messages.borrowRequest.deviceNotFound
                    });
                }

                const availableItems = await DeviceItem.find({
                    device: deviceId,
                    status: { $in: ["Mới", "Hoạt động"] }
                }).limit(quantity);

                if (availableItems.length < quantity) {
                    return res.status(400).json({
                        success: false,
                        message: messages.borrowRequest.notEnoughDevices.replace("{device}", device.name)
                    });
                }

                for (const item of availableItems) {
                    item.status = "Đang sử dụng";
                    item.room = room ? room._id : null;
                    item.location = room ? null : personalLocation._id;
                    item.borrowedBy = teacher._id;
                    await item.save();
                    selectedDeviceItems.push(item._id);
                }

                updateDeviceQuantities.push({
                    deviceId,
                    newQuantity: device.total_quantity - quantity
                });
            }

            for (const { deviceId, newQuantity } of updateDeviceQuantities) {
                await Device.findByIdAndUpdate(deviceId, { total_quantity: newQuantity });
            }

            const newBorrowRequest = new BorrowRequest({
                teacher: teacher._id,
                room: room ? room._id : null,
                devices: devices.map(d => ({ device: d.deviceId, quantity: d.quantity })),
                deviceItems: selectedDeviceItems
            });

            await newBorrowRequest.save();

            if(room) {
                // Gửi thông báo 
                await sendNotification({
                    title: "Đơn mượn mới",
                    description: `Giảng viên ${teacher.name} đã mượn thiết bị cho phòng ${room.name}.`,
                    url: `/borrowRepay/home`,
                    role: "device_manager",
                    type: "info"
                });
            } else {
                // Gửi thông báo cá nhân
                await sendNotification({
                    title: "Đơn mượn mới",
                    description: `Giảng viên ${teacher.name} đã mượn thiết bị cá nhân.`,
                    url: `/borrowRepay/home`,
                    role: "device_manager",
                    type: "info"
                });

                // Gửi email thông báo
                const borrowRequests = await BorrowRequest.find({ _id: newBorrowRequest._id })
                .sort({ created_at: -1 })
                .populate("teacher", "name email phone department")
                .populate("room", "name location")
                .populate({
                    path: "devices.device",
                    select: "name category"
                })
                .populate({
                    path: "deviceItems",
                    populate: { path: "device", select: "name category" }
                })
                .lean();

            // Kiểm tra dữ liệu borrowRequests
            if (!borrowRequests || borrowRequests.length === 0) {
                throw new Error('Không tìm thấy yêu cầu mượn thiết bị.');
            }

            // Lấy yêu cầu đầu tiên
            const borrowRequest = borrowRequests[0];

            // Kiểm tra và log danh sách thiết bị
            const deviceNames = borrowRequest.devices?.length
                ? borrowRequest.devices.map(device => device.device?.name || 'Không xác định').join(', ')
                : 'Không có thiết bị';
            const deviceQuantities = borrowRequest.devices?.length
                ? borrowRequest.devices.map(device => device.quantity || '0').join(', ')
                : '0';

            console.log(deviceNames);

            // Gửi email
            await sendEmail({
                to: borrowRequest.teacher?.email || 'unknown@example.com',
                subject: 'HỆ THỐNG QUẢN LÝ THIẾT BỊ & QUÀ TẶNG - VICTORY',
                html: `
                    <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #2a2a2a; margin: 40px auto; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.3);">
                        <!-- Header -->
                        <tr>
                            <td align="center" bgcolor="#c0392b" style="padding: 30px 20px; border-bottom: 3px solid #e74c3c;">
                                <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold; letter-spacing: 1px;">THÔNG BÁO MƯỢN THIẾT BỊ</h1>
                            </td>
                        </tr>
                        <!-- Main Content -->
                        <tr>
                            <td style="padding: 30px 25px;">
                                <h2 style="color: #e74c3c; font-size: 22px; margin-top: 0;">Xin chào,</h2>
                                <p style="font-size: 16px; line-height: 1.6; color: #cccccc; margin-bottom: 20px;">Giảng viên <strong>${borrowRequest.teacher?.name || 'Không xác định'}</strong> đã mượn thiết bị cá nhân.</p>
                                <p style="font-size: 16px; line-height: 1.6; color: #cccccc; margin-bottom: 20px;">Thông tin chi tiết:</p>
                                <table width="100%" border="0" cellspacing="0" cellpadding="10" style="background-color: #3a3a3a; border-radius: 6px; margin-bottom: 20px;">
                                    <tr>
                                        <td style="font-size: 16px; color: #e74c3c; font-weight: bold; border-bottom: 1px solid #444444;">Giảng viên:</td>
                                        <td style="font-size: 16px; color: #ffffff; border-bottom: 1px solid #444444;">${borrowRequest.teacher?.name || 'Không xác định'}</td>
                                    </tr>
                                    <tr>
                                        <td style="font-size: 16px; color: #e74c3c; font-weight: bold; border-bottom: 1px solid #444444;">Thiết bị:</td>
                                        <td style="font-size: 16px; color: #ffffff; border-bottom: 1px solid #444444;">${deviceNames}</td>
                                    </tr>
                                    <tr>
                                        <td style="font-size: 16px; color: #e74c3c; font-weight: bold;">Số lượng:</td>
                                        <td style="font-size: 16px; color: #ffffff;">${deviceQuantities}</td>
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
            }

            return res.status(201).json({
                success: true,
                message: messages.borrowRequest.createSuccess,
                borrowRequest: newBorrowRequest
            });

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: messages.borrowRequest.createError,
                error: error.message
            });
        }
    };
}

module.exports = new CreateBorrowRequest();
