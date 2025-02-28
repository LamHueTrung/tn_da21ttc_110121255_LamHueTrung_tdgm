const jwt = require('jsonwebtoken');

class DeviceToRoomQuery {
    
    async Index(req, res, next) {
        res.render('pages/deviceToRoom', { layout: 'main'});
    }

    async ViewDevices(req, res, next) {
        res.render('pages/viewDeviceToRoom', { layout: 'main'});
    }

    async AddDevices(req, res, next) {
        res.render('pages/addDeviceToRoom', { layout: 'main'});
    }
};

module.exports = new DeviceToRoomQuery;