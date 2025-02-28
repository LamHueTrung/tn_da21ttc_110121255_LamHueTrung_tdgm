const jwt = require('jsonwebtoken');

class StatisticQuery {

    async IndexUser(req, res, next) {
        res.render('pages/statisticUser', { layout: 'main'});
    }

    async IndexDevice(req, res, next) {
        res.render('pages/statisticDevice', { layout: 'main'});
    }

    async IndexReward(req, res, next) {
        res.render('pages/statisticReward', { layout: 'main'});
    }
};

module.exports = new StatisticQuery;