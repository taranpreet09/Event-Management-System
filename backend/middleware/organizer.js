// backend/middleware/organizer.js
const jwt = require('jsonwebtoken');
require('dotenv').config();
module.exports = function (req, res, next) {
    // 403 Forbidden is the correct status code for a lack of permission
    if (req.user.role !== 'organizer') {
        return res.status(403).json({ msg: 'Access denied. Must be an organizer.' });
    }
    next();
};