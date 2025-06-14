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
const OrderCreateCommand = require("../../app/controllers/command/reward/CreateOrder");
const OrderReturnCommand = require("../../app/controllers/command/reward/ReturnOrder");
/**
 * @swagger
 * tags:
 *   - name: Rewards
 *     description: API for managing rewards and gift requests
 */

/**
 * @swagger
 * /reward/create:
 *   post:
 *     summary: Create a new gift
 *     tags: [Rewards]
 *     responses:
 *       201:
 *         description: Gift created successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Internal server error
 */
router.post("/create", upload, (req, res) => {
  CreateRewardCommand.Handle(req, res);
});

/**
 * @swagger
 * /reward/import:
 *   post:
 *     summary: Import rewards from a file
 *     tags: [Rewards]
 *     responses:
 *       200:
 *         description: Rewards imported successfully
 *       400:
 *         description: Invalid file
 *       500:
 *         description: Internal server error
 */
router.post("/import", (req, res) => {
  ImportRewardCommand.Handle(req, res);
});

/**
 * @swagger
 * /reward/update/{id}:
 *   put:
 *     summary: Update an existing gift by ID
 *     tags: [Rewards]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the gift to update
 *     responses:
 *       200:
 *         description: Gift updated successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Gift not found
 *       500:
 *         description: Internal server error
 */
router.put(
  "/update/:id",
  (req, res, next) => {
    if (req.headers["content-type"]?.includes("multipart/form-data")) {
      upload(req, res, (err) => {
        if (err instanceof multer.MulterError) {
          return res.status(400).json({
            success: false,
            message: "Lỗi tải lên hình ảnh.",
            error: err.message,
          });
        } else if (err) {
          return res.status(400).json({
            success: false,
            message: "Lỗi tải lên hình ảnh.",
            error: err.message,
          });
        }
        next();
      });
    } else {
      next();
    }
  },
  (req, res) => {
    UpdateGiftCommand.Handle(req, res);
  }
);

/**
 * @swagger
 * /reward/delete/{giftId}:
 *   delete:
 *     summary: Delete a gift by ID
 *     tags: [Rewards]
 *     parameters:
 *       - in: path
 *         name: giftId
 *         required: true
 *         description: ID of the gift to delete
 *     responses:
 *       200:
 *         description: Gift deleted successfully
 *       404:
 *         description: Gift not found
 *       500:
 *         description: Internal server error
 */
router.delete("/delete/:giftId", (req, res) => DeleteGiftCommand.Handle(req, res));

/**
 * @swagger
 * /reward/getAll:
 *   get:
 *     summary: Get all gifts
 *     tags: [Rewards]
 *     responses:
 *       200:
 *         description: List of all gifts
 *       500:
 *         description: Internal server error
 */
router.get("/getAll", GiftManagerQuery.GetAllGifts);

/**
 * @swagger
 * /reward/getById/{giftId}:
 *   get:
 *     summary: Get a gift by ID
 *     tags: [Rewards]
 *     parameters:
 *       - in: path
 *         name: giftId
 *         required: true
 *         description: ID of the gift to fetch
 *     responses:
 *       200:
 *         description: The gift details
 *       404:
 *         description: Gift not found
 *       500:
 *         description: Internal server error
 */
router.get("/getById/:giftId", GiftManagerQuery.GetGiftById);

/**
 * @swagger
 * /reward/order/upload:
 *   post:
 *     summary: Upload an order file
 *     tags: [Rewards]
 *     responses:
 *       200:
 *         description: Order file uploaded successfully
 *       400:
 *         description: Invalid file
 *       500:
 *         description: Internal server error
 */
router.post("/order/upload", (req, res) => {
  OrderImportCommand.Handle(req, res);
});

/**
 * @swagger
 * /reward/order/getAll:
 *   get:
 *     summary: Get all orders
 *     tags: [Rewards]
 *     responses:
 *       200:
 *         description: List of all orders
 *       500:
 *         description: Internal server error
 */
router.get("/order/getAll", GiftManagerQuery.getAllOrders);

/**
 * @swagger
 * /reward/order/getById/{orderId}:
 *   get:
 *     summary: Get an order by ID
 *     tags: [Rewards]
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         description: ID of the order to fetch
 *     responses:
 *       200:
 *         description: The order details
 *       404:
 *         description: Order not found
 *       500:
 *         description: Internal server error
 */
router.get("/order/getById/:orderId", GiftManagerQuery.getOrderById);

/**
 * @swagger
 * /reward/order/approve/{orderId}:
 *   put:
 *     summary: Approve an order by ID
 *     tags: [Rewards]
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         description: ID of the order to approve
 *     responses:
 *       200:
 *         description: Order approved successfully
 *       400:
 *         description: Order already approved
 *       500:
 *         description: Internal server error
 */
router.put("/order/approve/:orderId", ApproveOrderCommand.approve);

router.post("/order/create", OrderCreateCommand.Handle);

router.put("/order/return/:orderId", OrderReturnCommand.Handle);

module.exports = router;
