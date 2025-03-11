const fs = require("fs");
const csvParser = require("csv-parser");
const Room = require("../../../model/Room");
const Location = require("../../../model/Location");
const Validator = require("../../../Extesions/validator");
const messages = require("../../../Extesions/messCost");
const upload = require("../../../Extesions/uploadFile");

/**
 * Tự động phát hiện dấu phân cách CSV (`,` hoặc `;`).
 * @param {string} filePath - Đường dẫn file CSV.
 * @returns {Promise<string>} - Dấu phân cách CSV.
 */
async function detectSeparator(filePath) {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, "utf8", (err, data) => {
            if (err) return reject(err);
            const firstLine = data.split("\n")[0];
            if (firstLine.includes(";")) {
                resolve(";");
            } else {
                resolve(",");
            }
        });
    });
}

class ImportRooms {
    /**
     * Xử lý import danh sách phòng từ file CSV.
     */
    Handle = async (req, res) => {
        upload(req, res, async (err) => {
            if (err) {
                return res.status(400).json({ success: false, message: err.message });
            }

            if (!req.file) {
                return res.status(400).json({ success: false, message: messages.importRooms.noFile });
            }

            const filePath = req.file.path;
            const roomsToInsert = [];
            const errors = new Set();
            const processedRooms = new Set();

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
                    return res.status(400).json({ success: false, message: messages.importRooms.emptyFile });
                }

                // Xử lý từng dòng trong CSV
                for (const row of rows) {
                    const name = row.name?.trim();
                    const location = row.location?.trim();
                    const capacity = row.capacity?.trim();

                    // Kiểm tra dữ liệu hợp lệ bằng Validator
                    const errorsInRow = {
                        name: Validator.notEmpty(name, "Tên phòng") || Validator.maxLength(name, 100, "Tên phòng"),
                        location: Validator.notEmpty(location, "Tòa nhà") || Validator.maxLength(location, 100, "Tòa nhà"),
                        capacity: Validator.isPositiveNumber(capacity, "Sức chứa")
                    };

                    // Nếu có lỗi, thêm vào danh sách lỗi
                    if (Object.values(errorsInRow).some(error => error)) {
                        errors.add({ row, error: errorsInRow });
                        continue;
                    }

                    try {
                        // Kiểm tra dòng trùng lặp trong CSV
                        const uniqueKey = `${name}-${location}`;
                        if (processedRooms.has(uniqueKey)) {
                            continue;
                        }
                        processedRooms.add(uniqueKey);

                        // Kiểm tra hoặc tạo `Location`
                        let locationRecord = await Location.findOne({ name: location });
                        if (!locationRecord) {
                            locationRecord = await Location.create({ name: location, description: messages.location.defaultDescription });
                        }

                        // Kiểm tra phòng đã tồn tại trong DB
                        const existingRoom = await Room.findOne({ name, location: locationRecord._id });
                        if (!existingRoom) {
                            roomsToInsert.push({
                                name,
                                location: locationRecord._id,
                                capacity: parseInt(capacity, 10),
                                description: messages.room.importDescription
                            });
                        }
                    } catch (error) {
                        errors.add({ row, error: error.message });
                    }
                }

                // Thêm phòng hợp lệ vào database
                if (roomsToInsert.length > 0) {
                    await Room.insertMany(roomsToInsert);
                }

                // Xóa file CSV sau khi xử lý xong
                fs.unlinkSync(filePath);

                return res.status(200).json({
                    success: true,
                    message: messages.importRooms.success,
                    inserted: roomsToInsert.length,
                    errors: Array.from(errors)
                });

            } catch (error) {
                return res.status(500).json({
                    success: false,
                    message: messages.importRooms.error,
                    error: error.message
                });
            }
        });
    };
}

module.exports = new ImportRooms();
