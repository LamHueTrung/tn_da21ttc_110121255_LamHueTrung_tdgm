const express = require("express");
const router = express.Router();
const UpdateNotificationReadCommand = require("../../app/controllers/command/Notification/UpdateNotification");
const NotificationQuery = require("../../app/controllers/query/NotificationQuery");

/**
 * @swagger
 * tags:
 *   - name: Notifications
 *     description: API for managing notifications
 */

/**
 * @swagger
 * /api/notification/read/{id}:
 *   put:
 *     summary: Mark a notification as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Notification ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notification marked as read
 *       404:
 *         description: Notification not found
 *       500:
 *         description: Internal server error
 */
router.put("/read/:id", (req, res) => {
  UpdateNotificationReadCommand.Handle(req, res);
});

/**
 * @swagger
 * /api/notification/getAll:
 *   get:
 *     summary: Get all notifications
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of notifications
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       500:
 *         description: Internal server error
 */
router.get("/getAll", (req, res) => {
  NotificationQuery.Handle(req, res);
});

module.exports = router;
