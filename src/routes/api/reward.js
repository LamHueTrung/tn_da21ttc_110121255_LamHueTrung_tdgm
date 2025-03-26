const express = require("express");
const multer = require("multer");
const router = express.Router();
const upload = require("../../app/Extesions/uploadReward");
const CreateRewardCommand = require("../../app/controllers/command/reward/CreateGift");
const ImportRewardCommand = require("../../app/controllers/command/reward/ImportGifts");
const UpdateGiftCommand = require("../../app/controllers/command/reward/UpdateGift");
const DeleteGiftCommand = require("../../app/controllers/command/reward/DeleteGift");
const GiftManagerQuery = require("../../app/controllers/query/GiftManagerQuery");
const OrderImportCommand = require("../../app/controllers/command/reward/ImportOrder");
const ApproveOrderCommand = require("../../app/controllers/command/reward/ApproveOrder");

router.post("/create", upload, (req, res) => {
  CreateRewardCommand.Handle(req, res);
});

router.post("/import", (req, res) => {
  ImportRewardCommand.Handle(req, res);
});

// Route cập nhật quà tặng
router.put(
  "/update/:id",
  (req, res, next) => {
    // Kiểm tra nếu request có file ảnh thì gọi multer
    if (req.headers["content-type"]?.includes("multipart/form-data")) {
      upload(req, res, (err) => {
        if (err instanceof multer.MulterError) {
          return res
            .status(400)
            .json({
              success: false,
              message: "Lỗi tải lên hình ảnh.",
              error: err.message,
            });
        } else if (err) {
          return res
            .status(400)
            .json({
              success: false,
              message: "Lỗi tải lên hình ảnh.",
              error: err.message,
            });
        }
        next();
      });
    } else {
      // Nếu không có ảnh, tiếp tục xử lý API mà không gọi upload
      next();
    }
  },
  (req, res) => {
    // Xử lý cập nhật quà tặng
    UpdateGiftCommand.Handle(req, res);
  }
);

router.delete("/delete/:giftId", (req, res) => DeleteGiftCommand.Handle(req, res));

router.get("/getAll", GiftManagerQuery.GetAllGifts); 

router.get("/getById/:giftId", GiftManagerQuery.GetGiftById);

router.post("/order/upload", (req, res) => {
  OrderImportCommand.Handle(req, res);
});

router.get("/order/getAll", GiftManagerQuery.getAllOrders); 
router.get("/order/getById/:orderId", GiftManagerQuery.getOrderById); 
router.put("/order/approve/:orderId", ApproveOrderCommand.approve);

module.exports = router;
