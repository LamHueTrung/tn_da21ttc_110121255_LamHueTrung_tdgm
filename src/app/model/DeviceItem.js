const mongoose = require('mongoose');
const Location = require('./Location'); // Import model Location

const deviceItemSchema = new mongoose.Schema({
    device: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Device',
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: ['Mới', 'Hoạt động', 'Hỏng', 'Bảo trì'],
        default: 'Hoạt động'
    },
    location: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Location',
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

// Middleware: Gán vị trí mặc định là "Kho chính" nếu không có
deviceItemSchema.pre('save', async function (next) {
    if (!this.location) {
        const mainWarehouse = await Location.ensureMainWarehouse();
        this.location = mainWarehouse._id;
    }
    this.updated_at = Date.now();
    next();
});

const DeviceItem = mongoose.model('DeviceItem', deviceItemSchema);
module.exports = DeviceItem;
