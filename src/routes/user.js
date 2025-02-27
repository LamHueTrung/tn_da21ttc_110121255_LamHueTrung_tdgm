const express = require('express');
const router  = express.Router();
const UserQuery = require('../app/controllers/query/userQuery');

router.use('/addUser', UserQuery.AddUser);
router.use('/ListAllUser', UserQuery.ListAllUser);

module.exports = router;