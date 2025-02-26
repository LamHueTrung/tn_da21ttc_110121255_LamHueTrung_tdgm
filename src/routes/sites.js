const express = require('express');
const router  = express.Router();
const sitesControllers = require('../app/controllers/query/sitesQuery');

router.use('/home', sitesControllers.Index);
router.use('/', sitesControllers.login);

module.exports = router;