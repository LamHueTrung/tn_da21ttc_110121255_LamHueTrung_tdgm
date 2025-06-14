const express = require('express');
const router  = express.Router();
const RewardMangerQuery = require('../app/controllers/query/GiftManagerQuery');
const AddNewOrderReward = require('../app/controllers/query/RewardMangerQuery');

router.use('/home', RewardMangerQuery.Index);
router.use('/addReward', RewardMangerQuery.AddNew);
router.use('/listRequestReward', RewardMangerQuery.ListRequestReward);
router.use('/viewReward/:giftId', RewardMangerQuery.ViewGift);
router.use('/updateReward/:giftId', RewardMangerQuery.UpdateGift);
router.use('/addNewOrderReward', AddNewOrderReward.AddNew);
router.use('/addOrderChoiceTeacher', AddNewOrderReward.AddNewOrderChoiceTeacher);


module.exports = router;