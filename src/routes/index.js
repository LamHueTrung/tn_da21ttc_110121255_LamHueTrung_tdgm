const sitesRouter = require('./sites');
const usersRouter = require('./user');
const deviceManagersRouter = require('./deviceManager');
const rewardManagersRouter = require('./rewardManager');
const statisticRouter = require('./statistic');
const deviceToRoomsRouter = require('./deviceToRoom');
const borrowRepaysRouter = require('./borrowRepay');
const apiRoute = require('./api/index');
const session = require('express-session');
const passport = require('passport');
const authenticateToken = require('../app/middleware/authenticateTokenAdmin');

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
    
    app.use('/api', apiRoute);
    app.use('/statistic', statisticRouter);
    app.use('/reward', rewardManagersRouter);
    app.use('/deviceToRoom', authenticateToken, deviceToRoomsRouter);
    app.use('/borrowRepay', borrowRepaysRouter);
    app.use('/deviceManger', authenticateToken,deviceManagersRouter);
    app.use('/users', authenticateToken, usersRouter);
    app.use('/', sitesRouter);
    

}


module.exports = Route;