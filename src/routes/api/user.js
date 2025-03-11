const express = require('express');
const router  = express.Router();
const CreateUserCommand = require('../../app/controllers/command/user/CreateUser');
const UpdateUserCommand = require('../../app/controllers/command/user/UpdateUser');
const DeleteUserCommand = require('../../app/controllers/command/user/DeleteUser');
const GetUserQuery = require('../../app/controllers/query/UserQuery');

const upload = require('../../app/Extesions/uploadAvatar');

//Route add user
router.post('/create', upload.single('avatar'), (req, res) => {
    CreateUserCommand.Handle(req, res);
});

//Route update user
router.put('/changPassword', (req, res) => {
    UpdateUserCommand.ChangePassword(req, res); 
});
router.put('/updateUser/:id', upload.single('avatar'), (req, res) => {
    UpdateUserCommand.Handle(req, res);
});
router.put('/restore/:id', (req, res) => {
    UpdateUserCommand.restore(req, res);
});

//Route detele user
router.put('/disable/:id', (req, res) => {
    DeleteUserCommand.disable(req, res);
});
router.delete('/delete/:id', (req, res) => {
    DeleteUserCommand.delete(req, res);
});

//Route get user
router.get('/getAll', (req, res) => {
    GetUserQuery.getAllUsers(req, res);
});
router.get('/getById/:id', (req, res) => {
    GetUserQuery.getUserById(req, res);
});
module.exports = router;