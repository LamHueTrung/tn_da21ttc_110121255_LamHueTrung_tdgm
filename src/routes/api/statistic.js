const express = require("express");
const router = express.Router();
const Statistic = require("../../app/controllers/query/StatisticQuery");

/**
 * @swagger
 * tags:
 *   - name: Statistics
 *     description: API for managing statistics related to borrow/return, devices, and rewards
 */

/**
 * @swagger
 * /statistics/borrow-return/summary:
 *   get:
 *     summary: Get summary of borrow-return statistics
 *     tags: [Statistics]
 *     responses:
 *       200:
 *         description: Summary of borrow-return statistics
 *       500:
 *         description: Internal server error
 */
router.get("/borrow-return/summary", Statistic.StatisticBorrowReturn);

/**
 * @swagger
 * /statistics/borrow-return/by-date:
 *   get:
 *     summary: Get borrow-return statistics by date
 *     tags: [Statistics]
 *     responses:
 *       200:
 *         description: Borrow-return statistics by date
 *       500:
 *         description: Internal server error
 */
router.get("/borrow-return/by-date", Statistic.StatisticBorrowByDate);

/**
 * @swagger
 * /statistics/borrow-return/by-teacher:
 *   get:
 *     summary: Get borrow-return statistics by teacher
 *     tags: [Statistics]
 *     responses:
 *       200:
 *         description: Borrow-return statistics by teacher
 *       500:
 *         description: Internal server error
 */
router.get("/borrow-return/by-teacher", Statistic.StatisticBorrowByTeacher);

/**
 * @swagger
 * /statistics/borrow-return/by-device:
 *   get:
 *     summary: Get borrow-return statistics by device
 *     tags: [Statistics]
 *     responses:
 *       200:
 *         description: Borrow-return statistics by device
 *       500:
 *         description: Internal server error
 */
router.get("/borrow-return/by-device", Statistic.StatisticBorrowByDevice);

/**
 * @swagger
 * /statistics/borrow-return/active:
 *   get:
 *     summary: Get active borrowings statistics
 *     tags: [Statistics]
 *     responses:
 *       200:
 *         description: Active borrowings statistics
 *       500:
 *         description: Internal server error
 */
router.get("/borrow-return/active", Statistic.StatisticActiveBorrowings);

/**
 * @swagger
 * /statistics/borrow-return/by-room:
 *   get:
 *     summary: Get borrow-return statistics by room
 *     tags: [Statistics]
 *     responses:
 *       200:
 *         description: Borrow-return statistics by room
 *       500:
 *         description: Internal server error
 */
router.get("/borrow-return/by-room", Statistic.StatisticBorrowByRoom);

/**
 * @swagger
 * /statistics/device/summary-by-category:
 *   get:
 *     summary: Get device statistics summarized by category
 *     tags: [Statistics]
 *     responses:
 *       200:
 *         description: Device statistics summarized by category
 *       500:
 *         description: Internal server error
 */
router.get("/device/summary-by-category", Statistic.summaryByCategory);

/**
 * @swagger
 * /statistics/device/status-counts:
 *   get:
 *     summary: Get device status counts
 *     tags: [Statistics]
 *     responses:
 *       200:
 *         description: Device status counts
 *       500:
 *         description: Internal server error
 */
router.get("/device/status-counts", Statistic.statusCounts);

/**
 * @swagger
 * /statistics/device/most-used:
 *   get:
 *     summary: Get most used devices statistics
 *     tags: [Statistics]
 *     responses:
 *       200:
 *         description: Most used devices statistics
 *       500:
 *         description: Internal server error
 */
router.get("/device/most-used", Statistic.mostUsed);

/**
 * @swagger
 * /statistics/device/by-room:
 *   get:
 *     summary: Get device statistics by room
 *     tags: [Statistics]
 *     responses:
 *       200:
 *         description: Device statistics by room
 *       500:
 *         description: Internal server error
 */
router.get("/device/by-room", Statistic.byRoom);

/**
 * @swagger
 * /statistics/device/upcoming-maintenance:
 *   get:
 *     summary: Get statistics for devices upcoming for maintenance
 *     tags: [Statistics]
 *     responses:
 *       200:
 *         description: Devices upcoming for maintenance
 *       500:
 *         description: Internal server error
 */
router.get("/device/upcoming-maintenance", Statistic.upcomingMaintenance);

/**
 * @swagger
 * /statistics/device/in-main-warehouse:
 *   get:
 *     summary: Get devices that are in the main warehouse
 *     tags: [Statistics]
 *     responses:
 *       200:
 *         description: Devices in the main warehouse
 *       500:
 *         description: Internal server error
 */
router.get("/device/in-main-warehouse", Statistic.inMainWarehouse);

/**
 * @swagger
 * /statistics/reward/gift-stock:
 *   get:
 *     summary: Get the current stock of gifts for rewards
 *     tags: [Statistics]
 *     responses:
 *       200:
 *         description: Current stock of reward gifts
 *       500:
 *         description: Internal server error
 */
router.get("/reward/gift-stock", Statistic.giftStock);

/**
 * @swagger
 * /statistics/reward/gift-by-category:
 *   get:
 *     summary: Get reward gifts summarized by category
 *     tags: [Statistics]
 *     responses:
 *       200:
 *         description: Reward gifts summarized by category
 *       500:
 *         description: Internal server error
 */
router.get("/reward/gift-by-category", Statistic.giftSummaryByCategory);

/**
 * @swagger
 * /statistics/reward/top-requested:
 *   get:
 *     summary: Get the most requested reward gifts
 *     tags: [Statistics]
 *     responses:
 *       200:
 *         description: Most requested reward gifts
 *       500:
 *         description: Internal server error
 */
router.get("/reward/top-requested", Statistic.mostRequestedGifts);

/**
 * @swagger
 * /statistics/reward/request-by-month:
 *   get:
 *     summary: Get reward requests by month
 *     tags: [Statistics]
 *     responses:
 *       200:
 *         description: Reward requests by month
 *       500:
 *         description: Internal server error
 */
router.get("/reward/request-by-month", Statistic.rewardRequestByMonth);

/**
 * @swagger
 * /statistics/reward/top-teachers:
 *   get:
 *     summary: Get the top active teachers for reward requests
 *     tags: [Statistics]
 *     responses:
 *       200:
 *         description: Top active teachers for reward requests
 *       500:
 *         description: Internal server error
 */
router.get("/reward/top-teachers", Statistic.mostActiveTeachers);

module.exports = router;
