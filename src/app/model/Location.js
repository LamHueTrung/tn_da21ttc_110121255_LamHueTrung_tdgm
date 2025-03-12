const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    description: {
        type: String,
        default: '',
        trim: true
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

locationSchema.pre('save', function (next) {
    this.updated_at = Date.now();
    next();
});

// Hàm tạo "Kho chính" nếu chưa có
locationSchema.statics.ensureMainWarehouse = async function () {
    let mainWarehouse = await this.findOne({ name: 'Kho chính' });
    if (!mainWarehouse) {
        mainWarehouse = await this.create({ name: 'Kho chính', description: 'Kho mặc định cho thiết bị' });
    }
    return mainWarehouse;
};

locationSchema.statics.ensurePersonalUseLocation = async function () {
    let personalLocation = await this.findOne({ name: "Giáo viên đang giữ" });
    if (!personalLocation) {
        personalLocation = await this.create({ name: "Giáo viên đang giữ", description: "Thiết bị đang được giáo viên sử dụng cá nhân." });
    }
    return personalLocation;
};

const Location = mongoose.model('Location', locationSchema);
module.exports = Location;
