const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // Import the auth middleware
const {
    getAllEvents,
    createEvent,
    getOrganizerEvents,
    registerForEvent,
    getRegisteredEvents
} = require('../controllers/eventsController');

// Define the routes
router.get('/', getAllEvents);
router.post('/', auth, createEvent);
router.get('/my-events', auth, getOrganizerEvents);
router.post('/:id/register', auth, registerForEvent);
router.get('/registered', auth, getRegisteredEvents);

module.exports = router;