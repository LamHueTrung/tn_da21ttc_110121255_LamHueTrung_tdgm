const fs = require("fs");
const path = require("path");
const csvParser = require("csv-parser");
const Device = require("../../../model/Device");
const DeviceItem = require("../../../model/DeviceItem");
const Room = require("../../../model/Room");
const Validator = require("../../../Extesions/validator");
const messages = require("../../../Extesions/messCost");
const upload = require("../../../Extesions/uploadFile");

async function detectSeparator(filePath) {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, "utf8", (err, data) => {
            if (err) return reject(err);
            const firstLine = data.split("\n")[0];
            resolve(firstLine.includes(";") ? ";" : ",");
        });
    });
}

class ImportDevice {
    Handle = async (req, res) => {
        upload(req, res, async (err) => {
            if (err) return res.status(400).json({ success: false, message: err.message });
            if (!req.file) return res.status(400).json({ success: false, message: messages.importRewards.noFile });

            const filePath = req.file.path;
            const devicesToInsert = [];
            const errors = new Set();

            try {
                const separator = await detectSeparator(filePath);
                const rows = [];

                await new Promise((resolve, reject) => {
                    fs.createReadStream(filePath)
                        .pipe(csvParser({ separator, mapHeaders: ({ header }) => header.trim().replace(/^﻿/, "") }))
                        .on("data", (row) => rows.push(row))
                        .on("end", resolve)
                        .on("error", reject);
                });

                if (rows.length === 0) {
                    return res.status(400).json({ success: false, message: messages.importRewards.emptyFile });
                }

                const requiredFields = ["name", "category", "quantity"];
                const missingFields = requiredFields.filter(field => !Object.keys(rows[0]).includes(field));
                if (missingFields.length > 0) {
                    return res.status(400).json({
                        success: false,
                        message: "Tệp CSV thiếu các cột bắt buộc: " + missingFields.join(", ")
                    });
                }

                const mainRoom = await Room.ensureMainWarehouse();

                for (const row of rows) {
                    const name = row.name?.trim();
                    const category = row.category?.trim();
                    const quantity = row.quantity?.trim();
                    const description = row.description?.trim() || "";
                    const imagePath = row.img?.trim();

                    const errorsInRow = {
                        name: Validator.notEmpty(name, "Tên thiết bị") || Validator.maxLength(name, 100, "Tên thiết bị"),
                        category: Validator.isEnum(category, ['Máy tính', 'Máy chiếu', 'Bảng trắng', 'Loa', 'Thiết bị mạng', 'Khác'], "Danh mục thiết bị"),
                        quantity: Validator.isPositiveNumber(quantity, "Số lượng")
                    };

                    if (Object.values(errorsInRow).some(error => error)) {
                        errors.add({ row, error: errorsInRow });
                        continue;
                    }

                    try {
                        const existingDevice = await Device.findOne({ name });
                        if (existingDevice) continue;

                        const device = new Device({
                            name,
                            category,
                            description,
                            total_quantity: parseInt(quantity, 10),
                            images: []
                        });

                        await device.save();

                        // Tạo DeviceItem cho từng thiết bị
                        for (let i = 0; i < device.total_quantity; i++) {
                            const item = new DeviceItem({
                                device: device._id,
                                status: "Mới",
                                room: mainRoom._id,
                                location: mainRoom.location
                            });
                            await item.save();
                        }

                        // Xử lý hình ảnh
                        if (imagePath && fs.existsSync(imagePath)) {
                            const fileName = path.basename(imagePath);
                            const tempPath = path.join("src/public/uploads/devices/temp/", fileName);
                            const finalPath = path.join("src/public/uploads/devices/", fileName);

                            fs.copyFileSync(imagePath, tempPath);
                            fs.renameSync(tempPath, finalPath);

                            device.images = [finalPath.replace("src\\public", "")];
                            await device.save();
                        }

                        devicesToInsert.push(device);
                    } catch (error) {
                        errors.add({ row, error: error.message });
                    }
                }

                fs.unlinkSync(filePath);

                return res.status(200).json({
                    success: true,
                    message: "Import thiết bị thành công!",
                    inserted: devicesToInsert.length,
                    errors: Array.from(errors)
                });

            } catch (error) {
                return res.status(500).json({
                    success: false,
                    message: "Lỗi trong quá trình xử lý file import.",
                    error: error.message
                });
            }
        });
    };
}

module.exports = new ImportDevice();
