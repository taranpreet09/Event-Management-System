const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { changePassword, deleteAccount, updateProfile } = require('../controllers/userController');

router.put('/change-password', auth, changePassword);
router.put('/update-profile', auth, updateProfile);
router.delete('/delete-account', auth, deleteAccount);

module.exports = router;