const express = require('express');
const router  = express.Router();
const userRoute = require('./user');
const deviceRoute = require('./device');
const roomRoute = require('./room');
const Login = require('../../app/controllers/command/user/Login');
const borrowReturnRoute = require('./borrowReturn');
const teacherRoute = require('./teacher');
const authenticateToken = require('../../app/middleware/authenticateTokenAdmin');

//Route login user
router.use('/login', (req, res) => { Login.Handle(req, res);});

//User route
router.use('/user', authenticateToken, userRoute);

// Deivce route 
router.use('/device', authenticateToken, deviceRoute);

// Room route
router.use('/room', authenticateToken, roomRoute);

// Borrow and return route
router.use('/borrowReturn', authenticateToken, borrowReturnRoute);

// Teacher route
router.use('/teacher', authenticateToken, teacherRoute);
module.exports = router;