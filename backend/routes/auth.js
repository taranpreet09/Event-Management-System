const express = require('express');
const router = express.Router();
const { registerUser, registerOrganizer, loginUser , checkEmail} = require('../controllers/authController');

router.post('/register-user', registerUser);

router.post('/register-organizer', registerOrganizer);

router.post('/login', loginUser);
router.post('/check-email', checkEmail);

module.exports = router;