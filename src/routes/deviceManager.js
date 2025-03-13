const express = require('express');
const router  = express.Router();
const DeviceManagerQuery = require('../app/controllers/query/DeivceMangerQuery');
const authenticateToken = require('../app/middleware/authenticateTokenAdmin');

router.use('/home', authenticateToken, DeviceManagerQuery.Index);
router.use('/addDevice', authenticateToken, DeviceManagerQuery.AddDevice);
router.use('/updateDevice/:deviceId', authenticateToken, DeviceManagerQuery.UpdateDevice);
router.use('/viewDevice/:deviceId', authenticateToken, DeviceManagerQuery.ViewDevice);


module.exports = router;