const jwt = require('jsonwebtoken');
const Gift = require('../../model/Gift');
const Teacher = require('../../model/Teacher');
const messages = require('../../Extesions/messCost');

class RewardMangerQuery {
    
    async Index(req, res, next) {
        res.status(200).render('pages/rewardManager', { layout: 'main'});
    }

    async AddNew(req, res, next) {
        try {
            const availableGifts = await Gift.find().lean().sort({ updated_at: -1 });
            const filteredGifts = [];

            for (let gift of availableGifts) {

                if (gift.quantity_in_stock > 0) {
                    filteredGifts.push({
                        _id: gift._id,
                        name: gift.name,
                        category: gift.category,
                        description: gift.description,
                        available_quantity: gift.quantity_in_stock, 
                        images: gift.images,
                    });
                }
            }
            
            return res.render("pages/addOrderReward", { 
                layout: "main",
                success: true,
                message: messages.gift.getAvailableSuccess,
                gifts: filteredGifts,
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: messages.device.getAvailableError,
                error: error.message
            });
        }
    }
    
    async AddNewOrderChoiceTeacher(req, res, next) {
        try {
            const teachers = await Teacher.find().lean().sort({ updated_at: -1 });

            return res.render("pages/addOrderChoiceTeacher", { 
                layout: "main",
                success: true,
                message: messages.teacher.getAllSuccess,
                teachers,

            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: messages.teacher.getAllError,
                error: error.message
            });
        }
    }
    async ListRequestReward(req, res, next) {
        res.status(200).render('pages/listRequestReward', { layout: 'main'});
    }
};

module.exports = new RewardMangerQuery;