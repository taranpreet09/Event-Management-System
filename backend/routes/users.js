const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { changePassword } = require('../controllers/userController');

router.put('/change-password', auth, changePassword);

module.exports = router;