const express = require("express");
const router = express.Router();

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
 * /api/borrowReturn/available:
 *   get:
 *     summary: Get a list of available devices that can be borrowed
 *     tags: [Borrow and Return]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of available devices
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       500:
 *         description: Internal server error
 */
router.get("/available", (req, res) => {
  BorrowRepayQuery.GetAvailableDevices(req, res);
});

/**
 * @swagger
 * /api/borrowReturn/borrow:
 *   post:
 *     summary: Create a new borrow request for devices
 *     tags: [Borrow and Return]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - teacherId
 *               - roomId
 *               - devices
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
 * /api/borrowReturn/return/{borrowRequestId}:
 *   put:
 *     summary: Return borrowed devices by borrow request ID
 *     tags: [Borrow and Return]
 *     security:
 *       - bearerAuth: []
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
 *         description: Already returned or invalid request
 *       404:
 *         description: Borrow request not found
 *       500:
 *         description: Internal server error
 */
router.put("/return/:borrowRequestId", (req, res) => {
  ReturnBorrowRequest.Handle(req, res);
});

/**
 * @swagger
 * /api/borrowReturn/getAll:
 *   get:
 *     summary: Get all borrow requests
 *     tags: [Borrow and Return]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of all borrow requests
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
  BorrowRepayQuery.GetAll(req, res);
});

/**
 * @swagger
 * /api/borrowReturn/getById/{id}:
 *   get:
 *     summary: Get details of a borrow request by ID
 *     tags: [Borrow and Return]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Borrow request details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       404:
 *         description: Borrow request not found
 *       500:
 *         description: Internal server error
 */
router.get("/getById/:id", (req, res) => {
  BorrowRepayQuery.GetById(req, res);
});

module.exports = router;
