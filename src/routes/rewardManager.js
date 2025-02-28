const express = require('express');
const router  = express.Router();
const RewardMangerQuery = require('../app/controllers/query/RewardMangerQuery');

router.use('/home', RewardMangerQuery.Index);
router.use('/addReward', RewardMangerQuery.AddNew);
router.use('/listRequestReward', RewardMangerQuery.ListRequestReward);

module.exports = router;