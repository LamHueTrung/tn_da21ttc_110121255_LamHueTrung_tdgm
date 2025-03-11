const express = require("express");
const router = express.Router();
const ImportRoomsCommand = require("../../app/controllers/command/room/ImportRooms");
const DeviceToRoomQuery = require("../../app/controllers/query/DeviceToRoomQuery");
const AssignDeviceToRoom = require("../../app/controllers/command/room/AssignDeviceToRoom");
const RemoveDeviceFromRoom = require("../../app/controllers/command/room/RemoveDeviceFromRoom");
const UpdateDeviceRoom = require("../../app/controllers/command/room/UpdateDeviceRoom");
const UpdateRoom = require("../../app/controllers/command/room/UpdateRoom");
const DeleteRoom = require("../../app/controllers/command/room/DeleteRoom");

// Route import phòng học từ CSV
router.post("/import", (req, res) => {
  ImportRoomsCommand.Handle(req, res);
});

// Lấy danh sách tất cả phòng
router.get("/getAll", (req, res) => {
  DeviceToRoomQuery.GetAllRooms(req, res);
});

// Lấy thông tin phòng theo ID
router.get("/getById/:roomId", (req, res) => {
  DeviceToRoomQuery.GetRoomById(req, res);
});

// Thêm thiết bị vào phòng
router.post("/:roomId/assign-devices", (req, res) => {
  AssignDeviceToRoom.Handle(req, res);
});

// Lấy danh sách thiết bị trong phòng
router.get("/:roomId/devices", (req, res) => {
  DeviceToRoomQuery.GetAllDeviceToRoom(req, res);
});

// Xóa thiết bị khỏi phòng
router.post("/:roomId/remove-device", (req, res) => {
  RemoveDeviceFromRoom.Handle(req, res);
});

// Cập nhật phòng của thiết bị (Chuyển thiết bị sang phòng khác)
router.post("/move-device", (req, res) => {
  UpdateDeviceRoom.Handle(req, res);
});

// API cập nhật thông tin phòng
router.put("/update/:roomId", (req, res) => {
  UpdateRoom.Handle(req, res);
});

// API xóa phòng học
router.delete("/delete/:roomId", (req, res) => {
  DeleteRoom.Handle(req, res);
});

module.exports = router;
