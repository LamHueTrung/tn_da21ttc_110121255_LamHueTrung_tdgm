const express = require('express');
const router  = express.Router();
const UserQuery = require('../app/controllers/query/UserQuery');
const authenticateToken = require('../app/middleware/authenticateTokenAdmin');

router.use('/addUser', authenticateToken, UserQuery.AddUser);
router.use('/profile/:id', authenticateToken, UserQuery.FrofileUser);
router.use('/updateUser/:id', authenticateToken, UserQuery.UpdateUser);
router.use('/ListAllUser', authenticateToken, UserQuery.ListAllUser);

module.exports = router;