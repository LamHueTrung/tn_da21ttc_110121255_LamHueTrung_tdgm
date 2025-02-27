const sitesRouter = require('./sites');
const usersRouter = require('./user');
const deviceManagersRouter = require('./deviceManager');
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
    app.use('/deviceManger', deviceManagersRouter);
    app.use('/users', usersRouter);
    app.use('/', sitesRouter);
    

}


module.exports = Route;