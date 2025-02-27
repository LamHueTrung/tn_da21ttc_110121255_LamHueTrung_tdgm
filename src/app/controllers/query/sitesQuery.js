const jwt = require('jsonwebtoken');

class SitesQuery {
    
    // Render login page
    login(req, res) {
        res.render('Login', { layout: 'Login'});
    }
    async Index(req, res, next) {
        res.render('pages/main', { layout: 'main'});
    }

};

module.exports = new SitesQuery;