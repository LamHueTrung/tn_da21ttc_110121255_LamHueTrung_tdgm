const jwt = require('jsonwebtoken');

class StatisticQuery {

    async IndexUser(req, res, next) {
        res.status(200).render('pages/statisticUser', { layout: 'main'});
    }

    async IndexDevice(req, res, next) {
        res.status(200).render('pages/statisticDevice', { layout: 'main'});
    }

    async IndexReward(req, res, next) {
        res.status(200).render('pages/statisticReward', { layout: 'main'});
    }
};

module.exports = new StatisticQuery;