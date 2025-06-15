const express = require("express");
const router = express.Router();
const CreateNotificationCommand = require("../../app/controllers/command/Notification/CreateNotification");

/**
 * @swagger
 * tags:
 *   - name: Notifications
 *     description: API for managing notifications
 */

/**
 * @swagger
 * /api/notification/create:
 *   post:
 *     summary: Create a new notification
 *     tags: [Notifications]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *               - receiverIds
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Thông báo mượn thiết bị"
 *               content:
 *                 type: string
 *                 example: "Vui lòng đến phòng thiết bị nhận đồ mượn vào thứ Hai."
 *               receiverIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["664fa9377b3d98c88f309a24", "664fa9df7b3d98c88f309a25"]
 *     responses:
 *       201:
 *         description: Notification created successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Internal server error
 */
router.post("/create", (req, res) => {
  CreateNotificationCommand.Handle(req, res);
});

module.exports = router;
