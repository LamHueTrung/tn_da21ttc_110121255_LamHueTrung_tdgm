const mongoose = require('mongoose');
const Location = require("./Location");

const roomSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    location: {  // 🔥 Liên kết phòng với `Location`
        type: mongoose.Schema.Types.ObjectId,
        ref: "Location",
        required: false
    },
    capacity: { // Số lượng thiết bị tối đa trong phòng
        type: Number,
        required: false,
        min: 1
    },
    description: {
        type: String,
        default: '',
        trim: true
    },
    deviceItems: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "DeviceItem"
        }
    ],
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    }
});

roomSchema.statics.ensureMainWarehouse = async function () {
    let mainWarehouse = await this.findOne({ name: 'Kho chính' });
    if (!mainWarehouse) {
        const location = await Location.ensureMainWarehouse(); // 🛠 await ở đây
        mainWarehouse = await this.create({
            name: 'Kho chính',
            description: 'Kho mặc định cho thiết bị',
            location: location._id // ✅ Lấy _id sau khi đã await
        });
    }

    return mainWarehouse;
};

// Middleware cập nhật `updated_at`
roomSchema.pre('save', function (next) {
    this.updated_at = Date.now();
    next();
});

const Room = mongoose.model('Room', roomSchema);
module.exports = Room;
