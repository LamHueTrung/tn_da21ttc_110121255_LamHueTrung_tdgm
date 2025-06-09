const mongoose = require("mongoose");
const Account = require("./Account");

const teacherSchema = new mongoose.Schema({
    // idAcount: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "Account",
    //     required: true
    // },
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    department: {
        type: String,
        required: true,
        trim: true
    },
    borrowedDevices: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "BorrowRequest" // Liên kết với đơn mượn
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

// Middleware cập nhật `updated_at` trước khi lưu
teacherSchema.pre("save", function (next) {
    this.updated_at = Date.now();
    next();
});

const Teacher = mongoose.model("Teacher", teacherSchema);
module.exports = Teacher;
