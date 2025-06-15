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
 * /api/device/create:
 *   post:
 *     summary: Create a new device
 *     tags: [Devices]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - category
 *               - quantity
 *             properties:
 *               name:
 *                 type: string
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *               quantity:
 *                 type: integer
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Device created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
router.post('/create', upload, (req, res) => {
  CreateDeviceCommand.Handle(req, res);
});

/**
 * @swagger
 * /api/device/update/{deviceId}:
 *   put:
 *     summary: Update device details by ID
 *     tags: [Devices]
 *     security:
 *       - bearerAuth: []
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
 *               quantity:
 *                 type: integer
 *               status:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Device updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Device not found
 *       500:
 *         description: Internal server error
 */
router.put('/update/:deviceId', (req, res, next) => {
  if (req.headers['content-type']?.includes('multipart/form-data')) {
    upload(req, res, (err) => {
      if (err instanceof multer.MulterError || err) {
        return res.status(400).json({ success: false, message: 'Lỗi tải lên hình ảnh.', error: err.message });
      }
      next();
    });
  } else {
    next();
  }
}, (req, res) => {
  UpdateDeviceCommand.Handle(req, res);
});

/**
 * @swagger
 * /api/device/delete/{deviceId}:
 *   delete:
 *     summary: Delete a device by ID
 *     tags: [Devices]
 *     security:
 *       - bearerAuth: []
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
 *         description: Cannot delete device (may be in use)
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
 * /api/device/getAll:
 *   get:
 *     summary: Get a list of all devices
 *     tags: [Devices]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of devices
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       500:
 *         description: Internal server error
 */
router.get('/getAll', (req, res) => {
  DeviceManagerQuery.GetAllDevices(req, res);
});

/**
 * @swagger
 * /api/device/getById/{deviceId}:
 *   get:
 *     summary: Get device details by ID
 *     tags: [Devices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: deviceId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Device detail
 *         content:
 *           application/json:
 *             schema:
 *               type: object
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
 * /api/device/import:
 *   post:
 *     summary: Import devices from CSV file
 *     tags: [Devices]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Devices imported successfully
 *       400:
 *         description: Invalid file or format
 *       500:
 *         description: Internal server error
 */
router.post('/import', (req, res) => {
  ImportDeviceCommand.Handle(req, res);
});

module.exports = router;
