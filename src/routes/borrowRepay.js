const express = require('express');
const router  = express.Router();
const BorrowRepayQuery = require('../app/controllers/query/BorrowRepayQuery');

router.use('/home', BorrowRepayQuery.Index);
router.use('/addNew', BorrowRepayQuery.AddNew);
router.use('/addNewChoiceTeacher', BorrowRepayQuery.AddNewChoiceTeacher);
router.use('/addNewChoiceRoom', BorrowRepayQuery.AddNewChoiceRoom);
// router.use('/homeType', DeviceManagerQuery.IndexType);
// router.use('/addDeviceType', DeviceManagerQuery.AddDeviceType);


module.exports = router;