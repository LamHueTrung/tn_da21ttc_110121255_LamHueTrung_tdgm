const express = require('express');
const multer = require('multer');
const router  = express.Router();
const CreateDeviceCommand = require('../../app/controllers/command/device/CreateDevice');
const UpdateDeviceCommand = require('../../app/controllers/command/device/UpdateDevice');
const DeleteDeviceCommand = require('../../app/controllers/command/device/DeleteDevice');
const DeviceManagerQuery = require('../../app/controllers/query/DeivceMangerQuery');
const upload = require('../../app/Extesions/uploadDevice');

//Route thêm thiết bị
router.post('/create', upload, (req, res) => {
    CreateDeviceCommand.Handle(req, res);
});

// Route cập nhật thiết bị
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

// Route xóa thiết bị
router.delete('/delete/:deviceId', (req, res) => {
    DeleteDeviceCommand.Handle(req, res);
});

// Route lấy tất cả thiết bị
router.get('/getAll', (req, res) => {
    DeviceManagerQuery.GetAllDevices(req, res);
});

// Route lấy thiết bị theo ID
router.get('/getById/:deviceId', (req, res) => {
    DeviceManagerQuery.GetDeviceById(req, res);
});

module.exports = router;