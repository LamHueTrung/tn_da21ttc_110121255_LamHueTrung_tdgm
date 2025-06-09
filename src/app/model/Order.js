const mongoose = require("mongoose");
const Teacher = require("./Teacher"); // Liên kết với model Teacher
const Gift = require("./Gift"); // Liên kết với model Gift

const orderSchema = new mongoose.Schema({
    Account: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Account",
        required: true
    },
    approved_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Account",
        default: null 
    },
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Teacher",
        required: true
    },
    gift: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Gift",
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    status: {
        type: String,
        enum: ["Chưa duyệt", "Đã duyệt", "Đã giao"],
        default: "Chưa duyệt"
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

// Middleware cập nhật `updated_at` trước khi lưu
orderSchema.pre("save", function (next) {
    this.updated_at = Date.now();
    next();
});

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
