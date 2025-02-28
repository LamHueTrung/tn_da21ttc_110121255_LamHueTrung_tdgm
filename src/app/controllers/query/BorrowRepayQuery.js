const jwt = require('jsonwebtoken');

class BorrowRepayQuery {
    
    async Index(req, res, next) {
        res.render('pages/historyBorrowRepay', { layout: 'main'});
    }

    async AddNew(req, res, next) {
        res.render('pages/addBorrowRepay', { layout: 'main'});
    }

};

module.exports = new BorrowRepayQuery;