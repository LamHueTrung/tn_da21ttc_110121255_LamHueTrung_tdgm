const jwt = require('jsonwebtoken');

class RewardMangerQuery {
    
    async Index(req, res, next) {
        res.status(200).render('pages/rewardManager', { layout: 'main'});
    }

    async AddNew(req, res, next) {
        res.status(200).render('pages/addReward', { layout: 'main'});
    }
    
    async ListRequestReward(req, res, next) {
        res.status(200).render('pages/listRequestReward', { layout: 'main'});
    }
};

module.exports = new RewardMangerQuery;