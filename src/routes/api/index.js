const express = require("express");
const router = express.Router();
const userRoute = require("./user");
const deviceRoute = require("./device");
const roomRoute = require("./room");
const Login = require("../../app/controllers/command/user/Login");
const borrowReturnRoute = require("./borrowReturn");
const teacherRoute = require("./teacher");
const authenticateToken = require("../../app/middleware/authenticateTokenAdmin");

//Route login user
router.use("/login", (req, res) => {
  Login.Handle(req, res);
});

// Đăng xuất (xóa token khỏi session hoặc cookie)
router.post("/logout", (req, res) => {
  try {
    // Xóa token khỏi session
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Không thể đăng xuất, xin thử lại!",
        });
      }

      // Hoặc nếu sử dụng cookie để lưu trữ JWT
      res.clearCookie('token'); // Xóa cookie chứa token (nếu sử dụng cookie)

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

//User route
router.use("/user", authenticateToken, userRoute);

// Deivce route
router.use("/device", authenticateToken, deviceRoute);

// Room route
router.use("/room", authenticateToken, roomRoute);

// Borrow and return route
router.use("/borrowReturn", authenticateToken, borrowReturnRoute);

// Teacher route
router.use("/teacher", authenticateToken, teacherRoute);
module.exports = router;
