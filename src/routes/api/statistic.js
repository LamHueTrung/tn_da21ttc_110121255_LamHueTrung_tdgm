const express = require("express");
const router = express.Router();
const Statistic = require("../../app/controllers/query/StatisticQuery");

// mượn trả
router.get("/borrow-return/summary", Statistic.StatisticBorrowReturn);
router.get("/borrow-return/by-date", Statistic.StatisticBorrowByDate);
router.get("/borrow-return/by-teacher", Statistic.StatisticBorrowByTeacher);
router.get("/borrow-return/by-device", Statistic.StatisticBorrowByDevice);
router.get("/borrow-return/active", Statistic.StatisticActiveBorrowings);
router.get("/borrow-return/by-room", Statistic.StatisticBorrowByRoom);

// thiết bị
router.get("/device/summary-by-category", Statistic.summaryByCategory);
router.get("/device/status-counts", Statistic.statusCounts);
router.get("/device/most-used", Statistic.mostUsed);
router.get("/device/by-room", Statistic.byRoom);
router.get("/device/upcoming-maintenance", Statistic.upcomingMaintenance);
router.get("/device/in-main-warehouse", Statistic.inMainWarehouse);


// quà tặng

router.get("/reward/gift-stock", Statistic.giftStock);
router.get("/reward/gift-by-category", Statistic.giftSummaryByCategory);
router.get("/reward/top-requested", Statistic.mostRequestedGifts);
router.get("/reward/request-by-month", Statistic.rewardRequestByMonth);
router.get("/reward/top-teachers", Statistic.mostActiveTeachers);

module.exports = router;
