const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
    fullName: { type: String, required: true, trim: true },
    birthDate: Date,
    avatar: { type: String, default: null },
    address: String,
    phone: { type: String, match: [/^\d{10,15}$/, 'Số điện thoại không hợp lệ'] }
});

const accountSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['system_admin', 'sub_admin'], required: true },
    profile: profileSchema,
    isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

const Account = mongoose.model('Account', accountSchema);

module.exports = Account;
