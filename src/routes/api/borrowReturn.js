const express = require("express");
const multer = require("multer");
const router = express.Router();
const upload = require("../../app/Extesions/uploadDevice");
const BorrowRepayQuery = require("../../app/controllers/query/BorrowRepayQuery");
const CreateBorrowRepayCommand = require("../../app/controllers/command/borrowReturn/CreateBorrowRequest");
const ReturnBorrowRequest = require("../../app/controllers/command/borrowReturn/ReturnBorrowRequest");

/**
 * @swagger
 * tags:
 *   - name: Borrow and Return
 *     description: API for managing borrow and return requests of devices
 */

/**
 * @swagger
 * /borrowRepay/available:
 *   get:
 *     summary: Get a list of available devices that can be borrowed
 *     tags: [Borrow and Return]
 *     responses:
 *       200:
 *         description: List of available devices
 *       500:
 *         description: Internal server error
 */
router.get("/available", (req, res) => {
  BorrowRepayQuery.GetAvailableDevices(req, res);
});

/**
 * @swagger
 * /borrowRepay/borrow:
 *   post:
 *     summary: Create a new borrow request for devices
 *     tags: [Borrow and Return]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               teacherId:
 *                 type: string
 *               roomId:
 *                 type: string
 *               devices:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     deviceId:
 *                       type: string
 *                     quantity:
 *                       type: integer
 *     responses:
 *       201:
 *         description: Borrow request created successfully
 *       400:
 *         description: Invalid request or missing data
 *       500:
 *         description: Internal server error
 */
router.post("/borrow", (req, res) => {
  CreateBorrowRepayCommand.Handle(req, res);
});

/**
 * @swagger
 * /borrowRepay/return/{borrowRequestId}:
 *   put:
 *     summary: Return borrowed devices by providing the borrow request ID
 *     tags: [Borrow and Return]
 *     parameters:
 *       - in: path
 *         name: borrowRequestId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Devices returned successfully
 *       400:
 *         description: Request has already been returned or invalid request
 *       500:
 *         description: Internal server error
 */
router.put("/return/:borrowRequestId", (req, res) => {
  ReturnBorrowRequest.Handle(req, res);
});

/**
 * @swagger
 * /borrowRepay/getAll:
 *   get:
 *     summary: Get all borrow requests
 *     tags: [Borrow and Return]
 *     responses:
 *       200:
 *         description: A list of all borrow requests
 *       500:
 *         description: Internal server error
 */
router.get("/getAll", (req, res) => {
  BorrowRepayQuery.GetAll(req, res);
});

/**
 * @swagger
 * /borrowRepay/getById/{id}:
 *   get:
 *     summary: Get details of a borrow request by ID
 *     tags: [Borrow and Return]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Borrow request details
 *       404:
 *         description: Borrow request not found
 *       500:
 *         description: Internal server error
 */
router.get("/getById/:id", (req, res) => {
  BorrowRepayQuery.GetById(req, res);
});

module.exports = router;
