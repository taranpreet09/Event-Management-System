const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { changePassword } = require('../controllers/userController');

// @route   PUT api/users/change-password
// @desc    Change user password
// @access  Private
router.put('/change-password', auth, changePassword);

module.exports = router;