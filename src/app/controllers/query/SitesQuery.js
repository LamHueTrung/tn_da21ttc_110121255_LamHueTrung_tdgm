const jwt = require('jsonwebtoken');

class SitesQuery {
    
    // Render login page
    login(req, res) {
        res.status(200).render('Login', { layout: 'Login'});
    }
    async Index(req, res, next) {
        res.status(200).render('pages/main', { layout: 'main'});
    }

};

module.exports = new SitesQuery;