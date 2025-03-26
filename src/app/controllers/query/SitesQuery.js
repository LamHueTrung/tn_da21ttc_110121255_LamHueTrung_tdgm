const jwt = require('jsonwebtoken');
const Device = require("../../model/Device");
const Gift = require("../../model/Device");
const Room = require("../../model/Room");
const BorrowRequest = require("../../model/BorrowRequest");
const Order = require("../../model/Order"); // Đơn yêu cầu quà tặng

class SitesQuery {
    
    // Render login page
    login(req, res) {
        res.status(200).render('Login', { layout: 'Login'});
    }
    async Index(req, res, next) {
        try {
            const [deviceCount, giftCount, roomCount, borrowCount, giftOrderCount] = await Promise.all([
                Device.countDocuments(),
                Gift.countDocuments(),
                Room.countDocuments(),
                BorrowRequest.countDocuments(),
                Order.countDocuments()
            ]);
    
            res.status(200).render("pages/main", {
                layout: "main",
                dashboardStats: {
                    deviceCount,
                    giftCount,
                    roomCount,
                    borrowCount,
                    giftOrderCount
                }
            });
        } catch (error) {
            console.error("Lỗi tải dashboard:", error);
            res.status(500).send("Lỗi server");
        }
    }

};

module.exports = new SitesQuery;