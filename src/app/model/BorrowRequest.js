const mongoose = require("mongoose");
const Location = require("./Location"); // Import Location model

const borrowRequestSchema = new mongoose.Schema({
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Teacher",
        required: true
    },
    room: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Room",
        required: false // Nếu null, gán location "Giáo viên đang giữ"
    },
    devices: [
        {
            device: { type: mongoose.Schema.Types.ObjectId, ref: "Device", required: true },
            quantity: { type: Number, required: true, min: 1 }
        }
    ],
    deviceItems: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "DeviceItem"
        }
    ],
    status: {
        type: String,
        enum: ["Đang mượn", "Đã trả", "Quá hạn"],
        default: "Đang mượn"
    },
    IdAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account',
        required: true
    },
    borrow_date: {
        type: Date,
        default: Date.now
    },
    return_date: {
        type: Date
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

// Middleware cập nhật `updated_at` & tự động gán Location nếu không có Room
borrowRequestSchema.pre("save", async function (next) {
    this.updated_at = Date.now();

    // Nếu không có `room`, tự động gán `location = "Giáo viên đang giữ"`
    if (!this.room) {
        const personalUseLocation = await Location.ensurePersonalUseLocation();
        
        // Cập nhật tất cả `DeviceItem` được mượn để có `location` đúng
        await mongoose.model("DeviceItem").updateMany(
            { _id: { $in: this.deviceItems } },
            { $set: { location: personalUseLocation._id, room: null } }
        );
    } else {
        // Nếu có `room`, cập nhật thiết bị vào phòng đó
        await mongoose.model("DeviceItem").updateMany(
            { _id: { $in: this.deviceItems } },
            { $set: { room: this.room, location: null } }
        );
    }

    next();
});

const BorrowRequest = mongoose.model("BorrowRequest", borrowRequestSchema);
module.exports = BorrowRequest;
