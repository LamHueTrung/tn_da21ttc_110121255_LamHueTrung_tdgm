const sitesRouter = require('./sites');
const session = require('express-session');
const passport = require('passport');

function Route(app) {
    app.use(session({
        secret: process.env.JWT_SECRET_KEY, 
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false } 
    }));
    // Cấu hình passport
    app.use(passport.initialize());
    app.use(passport.session());

    app.use((req, res, next) => {
        res.locals.isLoggedInUser = req.session.isLoggedInUser || false;
        res.locals.dataUser = req.session.dataUser || {};
        next();
    });
    app.use('/', sitesRouter);
    

}


module.exports = Route;