const fs = require("fs");
const csvParser = require("csv-parser");
const Room = require("../../../model/Room");
const Location = require("../../../model/Location");
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

class ImportRooms {
    Handle = async (req, res) => {
        upload(req, res, async (err) => {
            if (err) return res.status(400).json({ success: false, message: err.message });
            if (!req.file) return res.status(400).json({ success: false, message: messages.importRooms.noFile });

            const filePath = req.file.path;
            const roomsToInsert = [];
            const errors = new Set();
            const processedRooms = new Set();

            try {
                const separator = await detectSeparator(filePath);
                console.log("🔍 Dấu phân cách phát hiện:", separator);

                const rows = [];
                await new Promise((resolve, reject) => {
                    fs.createReadStream(filePath)
                        .pipe(csvParser({ separator, mapHeaders: ({ header }) => header.trim().replace(/^﻿/, "") }))
                        .on("data", (row) => rows.push(row))
                        .on("end", resolve)
                        .on("error", reject);
                });

                if (rows.length === 0) {
                    return res.status(400).json({ success: false, message: messages.importRooms.emptyFile });
                }

                const requiredFields = ["name", "location", "capacity"];
                const missingFields = requiredFields.filter(field => !Object.keys(rows[0]).includes(field));
                if (missingFields.length > 0) {
                    return res.status(400).json({
                        success: false,
                        message: "Tệp CSV thiếu các cột bắt buộc: " + missingFields.join(", "),
                    });
                }

                for (const row of rows) {
                    const name = row.name?.trim();
                    const location = row.location?.trim();
                    const capacity = row.capacity?.trim();

                    const errorsInRow = {
                        name: Validator.notEmpty(name, "Tên phòng") || Validator.maxLength(name, 100, "Tên phòng"),
                        location: Validator.notEmpty(location, "Tòa nhà") || Validator.maxLength(location, 100, "Tòa nhà"),
                        capacity: Validator.isPositiveNumber(capacity, "Sức chứa")
                    };

                    if (Object.values(errorsInRow).some(error => error)) {
                        errors.add({ row, error: errorsInRow });
                        continue;
                    }

                    try {
                        const uniqueKey = `${name}-${location}`;
                        if (processedRooms.has(uniqueKey)) continue;
                        processedRooms.add(uniqueKey);

                        let locationRecord = await Location.findOne({ name: location });
                        if (!locationRecord) {
                            locationRecord = await Location.create({ name: location, description: messages.location.defaultDescription });
                        }

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

                if (roomsToInsert.length > 0) {
                    await Room.insertMany(roomsToInsert);
                }

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
