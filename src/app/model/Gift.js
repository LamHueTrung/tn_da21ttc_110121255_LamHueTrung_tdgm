const mongoose = require("mongoose");
const Location = require("./Location");

const giftSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        default: "",
        trim: true
    },
    category: {
        type: String,
        enum: ["Học viên", "Đối tác", "Khác"],
        required: true
    },
    quantity_in_stock: {
        type: Number,
        default: 0,
        min: 0
    },
    location: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Location",
        required: true
    },
    price: {
        type: Number,
        default: 0
    },
    images: {
        type: [String], // Mảng lưu đường dẫn các ảnh
        default: []
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

giftSchema.pre("save", function(next) {
    this.updated_at = Date.now();
    next();
});

const Gift = mongoose.model("Gift", giftSchema);
module.exports = Gift;
