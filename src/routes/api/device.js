const express = require('express');
const multer = require('multer');
const router = express.Router();
const CreateDeviceCommand = require('../../app/controllers/command/device/CreateDevice');
const UpdateDeviceCommand = require('../../app/controllers/command/device/UpdateDevice');
const DeleteDeviceCommand = require('../../app/controllers/command/device/DeleteDevice');
const DeviceManagerQuery = require('../../app/controllers/query/DeivceMangerQuery');
const ImportDeviceCommand = require('../../app/controllers/command/device/ImportDevice');
const upload = require('../../app/Extesions/uploadDevice');

/**
 * @swagger
 * tags:
 *   - name: Devices
 *     description: API for managing devices
 */

/**
 * @swagger
 * /device/create:
 *   post:
 *     summary: Create a new device
 *     tags: [Devices]
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *               quantity:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Device created successfully
 *       400:
 *         description: Validation errors
 *       500:
 *         description: Internal server error
 */
router.post('/create', upload, (req, res) => {
  CreateDeviceCommand.Handle(req, res);
});

/**
 * @swagger
 * /device/update/{deviceId}:
 *   put:
 *     summary: Update device details by ID
 *     tags: [Devices]
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: path
 *         name: deviceId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *               quantity:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Device updated successfully
 *       400:
 *         description: Validation errors
 *       404:
 *         description: Device not found
 *       500:
 *         description: Internal server error
 */
router.put('/update/:deviceId', (req, res, next) => {
    // Kiểm tra nếu request có file ảnh thì gọi multer
    if (req.headers['content-type']?.includes('multipart/form-data')) {
        upload(req, res, (err) => {
            if (err instanceof multer.MulterError) {
                return res.status(400).json({ success: false, message: 'Lỗi tải lên hình ảnh.', error: err.message });
            } else if (err) {
                return res.status(400).json({ success: false, message: 'Lỗi tải lên hình ảnh.', error: err.message });
            }
            next();
        });
    } else {
        // Nếu không có ảnh, tiếp tục xử lý API mà không gọi upload
        next();
    }
}, (req, res) => {
    UpdateDeviceCommand.Handle(req, res);
});

/**
 * @swagger
 * /device/delete/{deviceId}:
 *   delete:
 *     summary: Delete a device by ID
 *     tags: [Devices]
 *     parameters:
 *       - in: path
 *         name: deviceId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Device deleted successfully
 *       400:
 *         description: Cannot delete device as it is in use
 *       404:
 *         description: Device not found
 *       500:
 *         description: Internal server error
 */
router.delete('/delete/:deviceId', (req, res) => {
  DeleteDeviceCommand.Handle(req, res);
});

/**
 * @swagger
 * /device/getAll:
 *   get:
 *     summary: Get a list of all devices
 *     tags: [Devices]
 *     responses:
 *       200:
 *         description: A list of devices
 *       500:
 *         description: Internal server error
 */
router.get('/getAll', (req, res) => {
  DeviceManagerQuery.GetAllDevices(req, res);
});

/**
 * @swagger
 * /device/getById/{deviceId}:
 *   get:
 *     summary: Get device details by ID
 *     tags: [Devices]
 *     parameters:
 *       - in: path
 *         name: deviceId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Device details
 *       404:
 *         description: Device not found
 *       500:
 *         description: Internal server error
 */
router.get('/getById/:deviceId', (req, res) => {
  DeviceManagerQuery.GetDeviceById(req, res);
});

/**
 * @swagger
 * /device/import:
 *   post:
 *     summary: Import devices from a CSV file
 *     tags: [Devices]
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
 *         description: Devices imported successfully
 *       400:
 *         description: File errors or missing required columns
 *       500:
 *         description: Internal server error
 */
router.post("/import", (req, res) => {
  ImportDeviceCommand.Handle(req, res);
});

module.exports = router;
