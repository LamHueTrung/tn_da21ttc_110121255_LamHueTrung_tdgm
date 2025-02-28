const express = require('express');
const router  = express.Router();
const StatisticQuery = require('../app/controllers/query/StatisticQuery');

router.use('/user', StatisticQuery.IndexUser);
router.use('/device', StatisticQuery.IndexDevice);
router.use('/reward', StatisticQuery.IndexReward);

module.exports = router;