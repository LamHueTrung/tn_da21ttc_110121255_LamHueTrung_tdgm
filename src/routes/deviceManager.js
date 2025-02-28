const express = require('express');
const router  = express.Router();
const DeviceManagerQuery = require('../app/controllers/query/DeivceMangerQuery');

router.use('/home', DeviceManagerQuery.Index);
router.use('/addDevice', DeviceManagerQuery.AddDevice);
router.use('/homeType', DeviceManagerQuery.IndexType);
router.use('/addDeviceType', DeviceManagerQuery.AddDeviceType);


module.exports = router;