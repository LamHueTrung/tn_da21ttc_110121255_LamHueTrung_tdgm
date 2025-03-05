const express = require('express');
const router  = express.Router();
const CreateUserCommand = require('../../app/controllers/command/user/CreateUser');
const upload = require('../../app/Extesions/uploadAvatar');

//Route add user
router.post('/create', upload.single('avatar'), (req, res) => {
    CreateUserCommand.Handle(req, res);
});
module.exports = router;