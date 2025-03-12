const fs = require("fs");
const csvParser = require("csv-parser");
const Teacher = require("../../../model/Teacher");
const Validator = require("../../../Extesions/validator");
const messages = require("../../../Extesions/messCost");
const upload = require("../../../Extesions/uploadFile");

/**
 * Tự động phát hiện dấu phân cách CSV (`,` hoặc `;`).
 * @param {string} filePath - Đường dẫn file CSV.
 * @returns {Promise<string>} - Dấu phân cách CSV (`;` hoặc `,`).
 */
async function detectSeparator(filePath) {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, "utf8", (err, data) => {
            if (err) return reject(err);
            const firstLine = data.split("\n")[0];
            resolve(firstLine.includes(";") ? ";" : ",");
        });
    });
}

class ImportTeachers {
    /**
     * Xử lý import danh sách giảng viên từ file CSV.
     */
    Handle = async (req, res) => {
        upload(req, res, async (err) => {
            if (err) {
                return res.status(400).json({ success: false, message: err.message });
            }

            if (!req.file) {
                return res.status(400).json({ success: false, message: messages.teacher.noFile });
            }

            const filePath = req.file.path;
            const teachersToInsert = [];
            const errors = new Set();
            const processedTeachers = new Set();

            try {
                // Xác định dấu phân cách CSV
                const separator = await detectSeparator(filePath);
                console.log("🔍 Dấu phân cách phát hiện:", separator);

                const rows = [];

                // Đọc file CSV với dấu phân cách đã phát hiện
                await new Promise((resolve, reject) => {
                    fs.createReadStream(filePath)
                        .pipe(csvParser({ separator, mapHeaders: ({ header }) => header.trim().replace(/^﻿/, "") }))
                        .on("data", (row) => rows.push(row))
                        .on("end", resolve)
                        .on("error", reject);
                });

                // Kiểm tra file có dữ liệu hay không
                if (rows.length === 0) {
                    return res.status(400).json({ success: false, message: messages.teacher.emptyFile });
                }

                // Xử lý từng dòng trong CSV
                for (const row of rows) {
                    const name = row.name?.trim();
                    const email = row.email?.trim();
                    const phone = row.phone?.trim();
                    const department = row.department?.trim();

                    // Kiểm tra dữ liệu hợp lệ bằng Validator
                    const errorsInRow = {
                        name: Validator.notEmpty(name, "Tên giảng viên") || Validator.maxLength(name, 100, "Tên giảng viên"),
                        email: Validator.notEmpty(email, "Email") || Validator.isEmail(email),
                        phone: Validator.notEmpty(phone, "Số điện thoại") || Validator.isPhoneNumber(phone),
                        department: Validator.notEmpty(department, "Bộ môn") || Validator.maxLength(department, 100, "Bộ môn")
                    };

                    // Nếu có lỗi, thêm vào danh sách lỗi
                    if (Object.values(errorsInRow).some(error => error)) {
                        errors.add({ row, error: errorsInRow });
                        continue;
                    }

                    try {
                        // Kiểm tra dòng trùng lặp trong CSV
                        if (processedTeachers.has(email)) {
                            continue;
                        }
                        processedTeachers.add(email);

                        // Kiểm tra giảng viên đã tồn tại trong DB
                        const existingTeacher = await Teacher.findOne({ email });
                        if (!existingTeacher) {
                            teachersToInsert.push({ name, email, phone, department });
                        }
                    } catch (error) {
                        errors.add({ row, error: error.message });
                    }
                }

                // Thêm giảng viên hợp lệ vào database
                if (teachersToInsert.length > 0) {
                    await Teacher.insertMany(teachersToInsert);
                }

                // Xóa file CSV sau khi xử lý xong
                fs.unlinkSync(filePath);

                return res.status(200).json({
                    success: true,
                    message: messages.teacher.importSuccess,
                    inserted: teachersToInsert.length,
                    errors: Array.from(errors)
                });

            } catch (error) {
                return res.status(500).json({
                    success: false,
                    message: messages.teacher.importError,
                    error: error.message
                });
            }
        });
    };
}

module.exports = new ImportTeachers();
