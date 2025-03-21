const express = require("express");
const router = express.Router();
const StatisticBorrowReturn = require("../../app/controllers/query/StatisticQuery");

// mượn trả
router.get("/borrow-return/summary", StatisticBorrowReturn.StatisticBorrowReturn);
router.get("/borrow-return/by-date", StatisticBorrowReturn.StatisticBorrowByDate);
router.get("/borrow-return/by-teacher", StatisticBorrowReturn.StatisticBorrowByTeacher);
router.get("/borrow-return/by-device", StatisticBorrowReturn.StatisticBorrowByDevice);
router.get("/borrow-return/active", StatisticBorrowReturn.StatisticActiveBorrowings);
router.get("/borrow-return/by-room", StatisticBorrowReturn.StatisticBorrowByRoom);

// thiết bị
router.get("/device/summary-by-category", StatisticBorrowReturn.summaryByCategory);
router.get("/device/status-counts", StatisticBorrowReturn.statusCounts);
router.get("/device/most-used", StatisticBorrowReturn.mostUsed);
router.get("/device/by-room", StatisticBorrowReturn.byRoom);
router.get("/device/upcoming-maintenance", StatisticBorrowReturn.upcomingMaintenance);
router.get("/device/in-main-warehouse", StatisticBorrowReturn.inMainWarehouse);

module.exports = router;
