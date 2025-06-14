const fs = require("fs");
const path = require("path");
const csvParser = require("csv-parser");
const Gift = require("../../../model/Gift");
const Location = require("../../../model/Location");
const Validator = require("../../../Extesions/validator");
const messages = require("../../../Extesions/messCost");
const upload = require("../../../Extesions/uploadFile");
const { sendNotification } = require("../../../Extesions/notificationService");

async function detectSeparator(filePath) {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, "utf8", (err, data) => {
            if (err) return reject(err);
            const firstLine = data.split("\n")[0];
            resolve(firstLine.includes(";") ? ";" : ",");
        });
    });
}

class ImportGiff {
    Handle = async (req, res) => {
        upload(req, res, async (err) => {
            if (err) return res.status(400).json({ success: false, message: err.message });
            if (!req.file) return res.status(400).json({ success: false, message: messages.importRewards.noFile });

            const filePath = req.file.path;
            const rewardsToInsert = [];
            const errors = new Set();
            const processedGifts = new Set();

            const IdAccount = req.user.id; 
            if (!IdAccount) {
                return res.status(401).json({
                    success: false,
                    message: messages.borrowRequest.accountNotFound
                });
            }

            try {
                const separator = await detectSeparator(filePath);
                const rows = [];

                await new Promise((resolve, reject) => {
                    fs.createReadStream(filePath)
                        .pipe(csvParser({ separator, mapHeaders: ({ header }) => {
                            const headerMap = {
                              "Tên quà tặng": "name",
                              "Loại quà tặng": "category",
                              "Số lượng": "quantity",
                              "Giá": "price",
                              "Mô tả": "description",
                              "Link hình ảnh trên máy": "img",
                            };
                            const cleanHeader = header.trim().replace(/^﻿/, "");
                            return headerMap[cleanHeader] || cleanHeader; // fallback nếu không ánh xạ
                          } }))
                        .on("data", (row) => rows.push(row))
                        .on("end", resolve)
                        .on("error", reject);
                });

                if (rows.length === 0) {
                    return res.status(400).json({ success: false, message: messages.importRewards.emptyFile });
                }

                const requiredFields = ["name", "category", "quantity", "price"];
                const missingFields = requiredFields.filter(field => !Object.keys(rows[0]).includes(field));
                if (missingFields.length > 0) {
                    return res.status(400).json({
                        success: false,
                        message: "Tệp CSV thiếu các cột bắt buộc: " + missingFields.join(", ")
                    });
                }

                const mainLocationId = await Location.ensureMainWarehouse();
                const mainLocation = await Location.findById(mainLocationId._id);
                if (!mainLocation) {
                    return res.status(400).json({ success: false, message: "Kho quà tặng mặc định không hợp lệ." });
                }

                for (const row of rows) {
                    const name = row.name?.trim();
                    const category = row.category?.trim();
                    const quantity = row.quantity?.trim();
                    const price = row.price?.trim();
                    const description = row.description?.trim() || "";
                    const imagePath = row.img?.trim();

                    const errorsInRow = {
                        name: Validator.notEmpty(name, "Tên quà tặng") || Validator.maxLength(name, 100, "Tên quà tặng"),
                        category: Validator.isEnum(category, ["Học viên", "Đối tác", "Khác"], "Danh mục quà tặng"),
                        quantity: Validator.isPositiveNumber(quantity, "Số lượng"),
                        price: Validator.isPositiveNumber(price, "Giá trị")
                    };

                    if (Object.values(errorsInRow).some(error => error)) {
                        errors.add({ row, error: errorsInRow });
                        continue;
                    }

                    try {
                        const uniqueKey = `${name}-${mainLocation._id}`;
                        if (processedGifts.has(uniqueKey)) continue;
                        processedGifts.add(uniqueKey);

                        const existingGift = await Gift.findOne({ name, location: mainLocation._id });
                        if (!existingGift) {
                            const gift = new Gift({
                                Account: IdAccount,
                                name,
                                category,
                                description,
                                quantity_in_stock: parseInt(quantity, 10),
                                price: parseFloat(price),
                                location: mainLocation._id,
                                images: []
                            });

                            await gift.save();

                            // Nếu có hình ảnh, xử lý giống createGift thủ công
                            if (imagePath && fs.existsSync(imagePath)) {
                                const fileName = path.basename(imagePath);
                                const tempDir = path.join("src/public/uploads/rewards/temp/");
                                const finalDir = path.join("src/public/uploads/rewards/");
                                const tempPath = path.join(tempDir, fileName);
                                const finalPath = path.join(finalDir, fileName);

                                fs.copyFileSync(imagePath, tempPath);
                                fs.renameSync(tempPath, finalPath);

                                gift.images = [finalPath.replace("src\\public", "")];
                                await gift.save();
                            }

                            rewardsToInsert.push(gift);
                        }
                    } catch (error) {
                        errors.add({ row, error: error.message });
                    }
                }

                fs.unlinkSync(filePath);

                // Gửi thông báo cho người dùng
                if (rewardsToInsert.length > 0) {
                    await sendNotification({
                        title: "Quà tặng mới đã được nhập",
                        description: `${rewardsToInsert.length} quà tặng mới đã được nhập thành công.`,
                        url: "/reward/home",
                        role: "gift_manager",
                        type: "info"
                    });
                }
                return res.status(200).json({
                    success: true,
                    message: messages.importRewards.success,
                    inserted: rewardsToInsert.length,
                    errors: Array.from(errors)
                });

            } catch (error) {
                return res.status(500).json({
                    success: false,
                    message: messages.importRewards.error,
                    error: error.message
                });
            }
        });
    };
}

module.exports = new ImportGiff();
