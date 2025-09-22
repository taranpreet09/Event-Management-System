const express = require('express');
const router = express.Router();
const { registerUser, registerOrganizer, loginUser , checkEmail} = require('../controllers/authController');

// @route   POST api/auth/register-user
// @desc    Register a standard user
router.post('/register-user', registerUser);

// @route   POST api/auth/register-organizer
// @desc    Register an organizer
router.post('/register-organizer', registerOrganizer);

// @route   POST api/auth/login
// @desc    Authenticate user & get token
router.post('/login', loginUser);
router.post('/check-email', checkEmail);

module.exports = router;