const express = require("express");
const multer = require("multer");
const router = express.Router();
const CreateNotificationCommand = require("../../app/controllers/command/Notification/CreateNotification");

router.post("/create", (req, res) => {
        CreateNotificationCommand.Handle(req, res);
      });
      
module.exports = router;