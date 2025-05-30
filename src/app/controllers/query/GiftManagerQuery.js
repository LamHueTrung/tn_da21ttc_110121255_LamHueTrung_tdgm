const Gift = require("../../model/Gift");
const DeviceItem = require("../../model/DeviceItem");
const Location = require("../../model/Location");
const messages = require("../../Extesions/messCost");
const Order = require("../../model/Order"); // Import model Order
const Teacher = require("../../model/Teacher");

class GiftManagerQuery {
    /**
     * Lấy danh sách tất cả quà tặng, bao gồm số lượng và kho chứa
     */
    async Index(req, res, next) {
        try {
            // Lấy danh sách quà tặng
            const gifts = await Gift.find().sort({ updated_at: -1 }).lean();

            // Lấy tổng số lượng `DeviceItem` cho từng quà tặng
            const giftIds = gifts.map((gift) => gift._id);
            const giftItems = await DeviceItem.aggregate([
                { $match: { gift: { $in: giftIds } } },
                { $group: { _id: "$gift", count: { $sum: 1 } } }
            ]);

            // Lấy thông tin Location của từng `DeviceItem`
            const giftItemsWithLocations = await DeviceItem.find({ gift: { $in: giftIds } })
                .populate({
                    path: "location",
                    select: "name" // Lấy tên của location
                })
                .lean();

            // Gán thông tin vào danh sách quà tặng
            const giftsWithCounts = gifts.map((gift) => {
                const itemCount = giftItems.find((item) => item._id.equals(gift._id));
                const relatedLocations = giftItemsWithLocations
                    .filter((item) => item.gift.equals(gift._id))
                    .map((item) => ({
                        location: item.location?.name || "Không xác định",
                        count: 1 // Mỗi item có thể có số lượng nhất định
                    }));

                return {
                    ...gift,
                    total_items: itemCount ? itemCount.count : 0, // Nếu không có `DeviceItem`, gán 0
                    locations: relatedLocations
                };
            });

            return res.status(200).render("pages/rewardManager", { 
                layout: "main",
                success: true,
                message: messages.getGift.getAllSuccess,
                gifts: giftsWithCounts
            });

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: messages.getGift.getAllError,
                error: error.message
            });
        }
    }

    /**
     * Lấy thông tin chi tiết của một quà tặng theo ID
     */
    async GetGiftById(req, res) {
        const { giftId } = req.params;

        try {
            // Tìm quà tặng theo ID
            const gift = await Gift.findById(giftId).lean();
            if (!gift) {
                return res.status(404).json({
                    success: false,
                    message: messages.getGift.giftNotFound
                });
            }

            // Lấy danh sách `DeviceItem` liên quan và thông tin `Location`
            const giftItems = await DeviceItem.find({ gift: giftId })
                .populate({
                    path: "location",
                    select: "name" // Lấy tên của location
                })
                .lean();

            // Định dạng dữ liệu để hiển thị
            const formattedGiftItems = giftItems.map((item) => ({
                id: item._id,
                status: item.status,
                location: item.location?.name || "Không xác định"
            }));

            return res.status(200).json({
                success: true,
                message: messages.getGift.getByIdSuccess,
                gift: {
                    ...gift,
                    gift_items: formattedGiftItems
                }
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: messages.getGift.getByIdError,
                error: error.message
            });
        }
    }

    /**
     * Lấy tất cả quà tặng, bao gồm số lượng và kho chứa
     */
    async GetAllGifts(req, res) {
        try {
            // Lấy danh sách quà tặng
            const gifts = await Gift.find().lean();

            // Lấy tổng số lượng `DeviceItem` cho từng quà tặng
            const giftIds = gifts.map((gift) => gift._id);
            const giftItems = await DeviceItem.aggregate([
                { $match: { gift: { $in: giftIds } } },
                { $group: { _id: "$gift", count: { $sum: 1 } } }
            ]);

            // Lấy thông tin Location của từng `DeviceItem`
            const giftItemsWithLocations = await DeviceItem.find({ gift: { $in: giftIds } })
                .populate({
                    path: "location",
                    select: "name" // Lấy tên của location
                })
                .lean();

            // Gán thông tin vào danh sách quà tặng
            const giftsWithCounts = gifts.map((gift) => {
                const itemCount = giftItems.find((item) => item._id.equals(gift._id));
                const relatedLocations = giftItemsWithLocations
                    .filter((item) => item.gift.equals(gift._id))
                    .map((item) => ({
                        location: item.location?.name || "Không xác định",
                        count: 1 // Mỗi item có thể có số lượng nhất định
                    }));

                return {
                    ...gift,
                    total_items: itemCount ? itemCount.count : 0, // Nếu không có `DeviceItem`, gán 0
                    locations: relatedLocations
                };
            });

            return res.status(200).json({
                success: true,
                message: messages.getGift.getAllSuccess,
                gifts: giftsWithCounts
            });

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: messages.getGift.getAllError,
                error: error.message
            });
        }
    }

    async AddNew(req, res, next) {
        res.status(200).render('pages/addReward', { layout: 'main'});
    }
    
    async ListRequestReward(req, res, next) {
        try {
            // Lấy tất cả đơn yêu cầu quà tặng từ MongoDB
            const orders = await Order.find()
                .populate('teacher', 'name email') // Tìm thông tin giáo viên
                .populate('gift', 'name category price') // Tìm thông tin quà tặng
                .lean(); // Sử dụng lean để trả về đối tượng thuần (plain object)

            // Trả về kết quả
            return res.status(200).render('pages/listRequestReward', { 
                layout: 'main',
                success: true,
                orders: orders
            });
        } catch (error) {
            console.error("Error fetching orders:", error);
            return res.status(500).json({
                success: false,
                message: "Error fetching orders.",
                error: error.message
            });
        }
        
    }

    async ViewGift(req, res, next) {
        const { giftId } = req.params;
    
        try {
            // Tìm quà tặng theo ID
            const gift = await Gift.findById(giftId).lean();
            if (!gift) {
                return res.status(404).json({
                    success: false,
                    message: messages.getGift.giftNotFound
                });
            }
    
            // Lấy danh sách `GiftItem` liên quan và thông tin `Location`
            const giftItems = await DeviceItem.find({ gift: giftId })
                .populate({
                    path: "location",
                    select: "name" // Lấy tên của location
                })
                .lean();
    
            // Định dạng dữ liệu để hiển thị
            const formattedGiftItems = giftItems.map((item) => ({
                id: item._id,
                status: item.status,
                location: item.location?.name || "Không xác định"
            }));
    
            // Render kết quả lên trang viewGift
            return res.status(200).render("pages/viewReward", {
                layout: "main",
                success: true,
                message: messages.getGift.getByIdSuccess,
                gift: {
                    ...gift,
                    gift_items: formattedGiftItems
                }
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: messages.getGift.getByIdError,
                error: error.message
            });
        }
    }
    
    async UpdateGift(req, res, next) {
        res.status(200).render("pages/updateReward", { layout: "main" });
    }

    // API GET để lấy tất cả đơn yêu cầu
    async getAllOrders(req, res) {
        try {
            // Lấy tất cả đơn yêu cầu quà tặng từ MongoDB
            const orders = await Order.find()
                .populate('teacher', 'name email') // Tìm thông tin giáo viên
                .populate('gift', 'name category price') // Tìm thông tin quà tặng
                .lean(); // Sử dụng lean để trả về đối tượng thuần (plain object)

            if (!orders || orders.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "No orders found."
                });
            }

            // Trả về kết quả
            return res.status(200).json({
                success: true,
                orders: orders
            });
        } catch (error) {
            console.error("Error fetching orders:", error);
            return res.status(500).json({
                success: false,
                message: "Error fetching orders.",
                error: error.message
            });
        }
    }

    // API GET đơn yêu cầu theo ID
    async getOrderById(req, res) {
        const { orderId } = req.params;

        try {
            // Truy vấn đơn yêu cầu theo ID
            const order = await Order.findById(orderId)
                .populate('teacher', 'name email') // Tìm thông tin giáo viên
                .populate('gift', 'name category price') // Tìm thông tin quà tặng
                .lean(); // Sử dụng lean để trả về đối tượng thuần (plain object)

            if (!order) {
                return res.status(404).json({
                    success: false,
                    message: "Order not found."
                });
            }

            return res.status(200).json({
                success: true,
                order
            });
        } catch (error) {
            console.error("Error fetching order:", error);
            return res.status(500).json({
                success: false,
                message: "Error fetching order.",
                error: error.message
            });
        }
    }
}

module.exports = new GiftManagerQuery();
