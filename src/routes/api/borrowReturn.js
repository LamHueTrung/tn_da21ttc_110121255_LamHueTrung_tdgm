const express = require("express");
const multer = require("multer");
const router = express.Router();
const upload = require("../../app/Extesions/uploadDevice");
const BorrowRepayQuery = require("../../app/controllers/query/BorrowRepayQuery");
const CreateBorrowRepayCommand = require("../../app/controllers/command/borrowReturn/CreateBorrowRequest");
const ReturnBorrowRequest = require("../../app/controllers/command/borrowReturn/ReturnBorrowRequest");

// API lấy danh sách thiết bị có thể mượn
router.get("/available", (req, res) => {
  BorrowRepayQuery.GetAvailableDevices(req, res);
});

// API tạo yêu cầu mượn thiết bị
router.post("/borrow", (req, res) => {
  CreateBorrowRepayCommand.Handle(req, res);
});

// API trả thiết bị mượn
router.put("/return/:borrowRequestId", (req, res) => {
  ReturnBorrowRequest.Handle(req, res);
});

// API Lấy danh sách tất cả đơn mượn
router.get("/getAll", (req, res) => {
  BorrowRepayQuery.GetAll(req, res);
});

// API Lấy chi tiết đơn mượn theo ID
router.get("/getById/:id", (req, res) => {
  BorrowRepayQuery.GetById(req, res);
});

module.exports = router;
