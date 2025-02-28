const express = require('express');
const router  = express.Router();
const DeviceToRoomQuery = require('../app/controllers/query/DeviceToRoomQuery');

router.use('/home', DeviceToRoomQuery.Index);
router.use('/viewDevices/:id', DeviceToRoomQuery.ViewDevices);
router.use('/addDevices/:id', DeviceToRoomQuery.AddDevices);


module.exports = router;