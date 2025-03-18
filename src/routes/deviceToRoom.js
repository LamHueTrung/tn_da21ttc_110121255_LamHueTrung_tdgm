const express = require('express');
const router  = express.Router();
const DeviceToRoomQuery = require('../app/controllers/query/DeviceToRoomQuery');

router.use('/home', DeviceToRoomQuery.Index);
router.use('/viewDevices/:roomId', DeviceToRoomQuery.ViewDevices);
router.use('/viewRoomTranfer/:roomId', DeviceToRoomQuery.ViewRoomTranfer);
router.use('/addDevices/:roomId', DeviceToRoomQuery.AddDevices);


module.exports = router;