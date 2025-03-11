const mongoose = require('mongoose');

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
        required: true
    },
    capacity: { // Số lượng thiết bị tối đa trong phòng
        type: Number,
        required: true,
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

// Middleware cập nhật `updated_at`
roomSchema.pre('save', function (next) {
    this.updated_at = Date.now();
    next();
});

const Room = mongoose.model('Room', roomSchema);
module.exports = Room;
