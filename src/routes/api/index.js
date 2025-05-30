const express = require("express");
const router = express.Router();

const userRoute = require("./user");
const deviceRoute = require("./device");
const roomRoute = require("./room");
const teacherRoute = require("./teacher");
const statisticRoute = require("./statistic");
const rewardRoute = require("./reward");
const borrowReturnRoute = require("./borrowReturn");
const Notification = require("./notification");
const NotificationUnprotected = require("./NotificationUnprotected");
const Feedback = require("./feedback");
const Login = require("../../app/controllers/command/user/Login");
const authenticateToken = require("../../app/middleware/authenticateTokenAdmin");

/**
 * @swagger
 * tags:
 *   - name: Users
 *     description: API for managing users
 *   - name: Devices
 *     description: API for managing devices
 *   - name: Rooms
 *     description: API for managing rooms
 *   - name: Teachers
 *     description: API for managing teachers
 *   - name: Borrow and Return
 *     description: API for managing borrow and return operations
 *   - name: Statistics
 *     description: API for managing statistics
 *   - name: Rewards
 *     description: API for managing rewards
 */

/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: Login to the system
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Invalid credentials
 */
router.use("/login", (req, res) => {
  Login.Handle(req, res);
});

/**
 * @swagger
 * /api/logout:
 *   post:
 *     summary: Logout from the system
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Logout successful
 *       500:
 *         description: Error occurred during logout
 */
router.post("/logout", (req, res) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Không thể đăng xuất, xin thử lại!",
        });
      }

      res.clearCookie("token");

      return res.status(200).json({
        success: true,
        message: "Đăng xuất thành công!",
      });
    });
  } catch (error) {
    console.error("Lỗi khi đăng xuất:", error);
    return res.status(500).json({
      success: false,
      message: "Có lỗi xảy ra khi đăng xuất. Vui lòng thử lại!",
    });
  }
});


router.use("/user", authenticateToken, userRoute);

router.use("/device", authenticateToken, deviceRoute);

router.use("/room", authenticateToken, roomRoute);

router.use("/borrowReturn", authenticateToken, borrowReturnRoute);

router.use("/teacher", authenticateToken, teacherRoute);

router.use("/statistics", authenticateToken, statisticRoute);

router.use("/reward", authenticateToken, rewardRoute);

router.use("/notification", NotificationUnprotected);
router.use("/notification", authenticateToken, Notification);

router.use("/feedback", authenticateToken, Feedback);
module.exports = router;
