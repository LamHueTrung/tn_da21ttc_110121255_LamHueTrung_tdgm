const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        required: true,
        enum: ['Máy tính', 'Máy chiếu', 'Bảng trắng', 'Loa', 'Thiết bị mạng', 'Khác']
    },
    description: {
        type: String,
        default: '',
        trim: true
    },
    images: [
        {
            type: String, // Lưu danh sách đường dẫn hình ảnh
            default: []
        }
    ],
    total_quantity: {
        type: Number,
        required: true,
        min: 0,
        default: 0
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

// Middleware cập nhật updated_at trước khi lưu
deviceSchema.pre('save', function (next) {
    this.updated_at = Date.now();
    next();
});

const Device = mongoose.model('Device', deviceSchema);
module.exports = Device;
