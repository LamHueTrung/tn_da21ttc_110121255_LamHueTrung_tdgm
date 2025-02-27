const jwt = require('jsonwebtoken');

class DeviceManagerQuery {
    
    async Index(req, res, next) {
        res.render('pages/deviceManager', { layout: 'main'});
    }

    async AddDevice(req, res, next) {
        res.render('pages/addDevice', { layout: 'main'});
    }

    async IndexType(req, res, next) {
        res.render('pages/listAllDeviceType', { layout: 'main'});
    }

    async AddDeviceType(req, res, next) {
        res.render('pages/addDeviceType', { layout: 'main'});
    }

};

module.exports = new DeviceManagerQuery;