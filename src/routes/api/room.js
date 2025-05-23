const express = require("express");
const router = express.Router();
const ImportRoomsCommand = require("../../app/controllers/command/room/ImportRooms");
const DeviceToRoomQuery = require("../../app/controllers/query/DeviceToRoomQuery");
const AssignDeviceToRoom = require("../../app/controllers/command/room/AssignDeviceToRoom");
const RemoveDeviceFromRoom = require("../../app/controllers/command/room/RemoveDeviceFromRoom");
const UpdateDeviceRoom = require("../../app/controllers/command/room/UpdateDeviceRoom");
const UpdateRoomCommand = require("../../app/controllers/command/room/UpdateRoom");
const DeleteRoomCommand = require("../../app/controllers/command/room/DeleteRoom");
const CreateRoomCommand = require("../../app/controllers/command/room/CreateRoom");

/**
 * @swagger
 * tags:
 *   - name: Rooms
 *     description: API for managing rooms and devices in rooms
 */

/**
 * @swagger
 * /room/import:
 *   post:
 *     summary: Import rooms from a CSV file
 *     tags: [Rooms]
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Rooms imported successfully
 *       400:
 *         description: File errors or missing required columns
 *       500:
 *         description: Internal server error
 */
router.post("/import", (req, res) => {
  ImportRoomsCommand.Handle(req, res);
});

router.post("/create", (req, res) => { 
  CreateRoomCommand.Handle(req, res); 
});

router.get("/locations", (req, res) => {
  DeviceToRoomQuery.GetAllLocations(req, res);
});
/**
 * @swagger
 * /room/getAll:
 *   get:
 *     summary: Get all rooms
 *     tags: [Rooms]
 *     responses:
 *       200:
 *         description: A list of rooms
 *       500:
 *         description: Internal server error
 */
router.get("/getAll", (req, res) => {
  DeviceToRoomQuery.GetAllRooms(req, res);
});

/**
 * @swagger
 * /room/getById/{roomId}:
 *   get:
 *     summary: Get room details by ID
 *     tags: [Rooms]
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Room details
 *       404:
 *         description: Room not found
 *       500:
 *         description: Internal server error
 */
router.get("/getById/:roomId", (req, res) => {
  DeviceToRoomQuery.GetRoomById(req, res);
});

/**
 * @swagger
 * /room/{roomId}/assign-devices:
 *   post:
 *     summary: Assign devices to a room
 *     tags: [Rooms]
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               deviceId:
 *                 type: string
 *               quantity:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Devices assigned to room
 *       400:
 *         description: Invalid request or not enough devices available
 *       500:
 *         description: Internal server error
 */
router.post("/:roomId/assign-devices", (req, res) => {
  AssignDeviceToRoom.Handle(req, res);
});

/**
 * @swagger
 * /room/{roomId}/devices:
 *   get:
 *     summary: Get all devices in a room
 *     tags: [Rooms]
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of devices in the room
 *       404:
 *         description: Room not found
 *       500:
 *         description: Internal server error
 */
router.get("/:roomId/devices", (req, res) => {
  DeviceToRoomQuery.GetAllDeviceToRoom(req, res);
});

/**
 * @swagger
 * /room/{roomId}/remove-device:
 *   put:
 *     summary: Remove a device from a room
 *     tags: [Rooms]
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               deviceItemId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Device removed from room
 *       400:
 *         description: Device not found or cannot remove
 *       500:
 *         description: Internal server error
 */
router.put("/:roomId/remove-device", (req, res) => {
  RemoveDeviceFromRoom.Handle(req, res);
});

/**
 * @swagger
 * /room/move-device:
 *   put:
 *     summary: Move a device from one room to another
 *     tags: [Rooms]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               deviceItemId:
 *                 type: string
 *               toRoomId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Device moved successfully
 *       400:
 *         description: Invalid request or cannot move device
 *       500:
 *         description: Internal server error
 */
router.put("/move-device", (req, res) => {
  UpdateDeviceRoom.Handle(req, res);
});

/**
 * @swagger
 * /room/update/{roomId}:
 *   put:
 *     summary: Update room details by ID
 *     tags: [Rooms]
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               locationId:
 *                 type: string
 *               capacity:
 *                 type: integer
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Room updated successfully
 *       400:
 *         description: Invalid data or missing required fields
 *       404:
 *         description: Room not found
 *       500:
 *         description: Internal server error
 */
router.put("/update/:roomId", (req, res) => {
  UpdateRoomCommand.Handle(req, res);
});

/**
 * @swagger
 * /room/delete/{roomId}:
 *   delete:
 *     summary: Delete a room by ID
 *     tags: [Rooms]
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Room deleted successfully
 *       404:
 *         description: Room not found
 *       500:
 *         description: Internal server error
 */
router.delete("/delete/:roomId", (req, res) => {
  DeleteRoomCommand.Handle(req, res);
});

module.exports = router;
