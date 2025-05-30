const express = require("express");
const multer = require("multer");
const router = express.Router();
const UpdateNotificationReadCommand = require("../../app/controllers/command/Notification/UpdateNotification");
const NotificationQuery = require("../../app/controllers/query/NotificationQuery");

router.put("/read/:id", (req, res) => {
        UpdateNotificationReadCommand.Handle(req, res);
      }); 

router.get("/getAll", (req, res) => {
        NotificationQuery.Handle(req, res);
      });
module.exports = router;