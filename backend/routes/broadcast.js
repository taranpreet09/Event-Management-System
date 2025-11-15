const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
// ⭐ KEEP THIS ONE and ensure the path is correct
const organizer = require('../middleware/organizer'); 
const { createBroadcast } = require('../controllers/broadcastController');

// @route   POST api/broadcast
// @desc    Send a broadcast message to all users
// @access  Private (Organizer Only)
// Use the array syntax to apply both middleware
router.post('/', [auth, organizer], createBroadcast); 

module.exports = router;