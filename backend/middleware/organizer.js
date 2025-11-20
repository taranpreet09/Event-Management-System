
const jwt = require('jsonwebtoken');
require('dotenv').config();
module.exports = function (req, res, next) {
    if (req.user.role !== 'organizer') {
        return res.status(403).json({ msg: 'Access denied. Must be an organizer.' });
    }
    next();
};