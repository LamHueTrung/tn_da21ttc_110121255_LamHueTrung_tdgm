const express = require('express');
const router  = express.Router();
const UserQuery = require('../app/controllers/query/UserQuery');

router.use('/addUser', UserQuery.AddUser);
router.use('/ListAllUser', UserQuery.ListAllUser);

module.exports = router;