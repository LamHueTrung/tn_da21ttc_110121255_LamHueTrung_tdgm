const express = require('express');
const router  = express.Router();
const userRoute = require('./user');
const Login = require('../../app/controllers/command/user/Login');
const authenticateToken = require('../../app/middleware/authenticateTokenAdmin');

//Route login user
router.use('/login', (req, res) => { Login.Handle(req, res);});

//User route
router.use('/user', authenticateToken, userRoute);
       
module.exports = router;