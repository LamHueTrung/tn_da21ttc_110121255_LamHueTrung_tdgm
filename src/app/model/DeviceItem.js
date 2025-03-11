const mongoose = require('mongoose');

const deviceItemSchema = new mongoose.Schema({
    device: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Device',
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: ['Mới', 'Hoạt động', 'Đang sử dụng', 'Hỏng', 'Bảo trì'],
        default: 'Hoạt động'
    },
    room: { // 🔥 Thay `location` bằng `room`
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room',
        required: true
    },
    last_maintenance: {
        type: Date,
        default: null
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    }
});

// Middleware: Gán phòng mặc định nếu chưa có
deviceItemSchema.pre('save', async function (next) {
    if (!this.room) {
        let mainRoom = await mongoose.model('Room').findOne({ name: "Kho chính" });
        if (!mainRoom) {
            mainRoom = await mongoose.model('Room').create({ name: "Kho chính", description: "Kho mặc định" });
        }
        this.room = mainRoom._id;
    }
    this.updated_at = Date.now();
    next();
});

const DeviceItem = mongoose.model('DeviceItem', deviceItemSchema);
module.exports = DeviceItem;
