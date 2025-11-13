const express = require('express');
const router = express.Router();
const {
  getAllEvents,
  createEvent,
  getOrganizerEvents,
  registerForEvent,
  getRegisteredEvents,
  getEventAttendees,
  getEventById,
  updateEvent,
  unregisterFromEvent,
  deleteEvent,
  getEventsByDate,
   verifyEventRegistration
} = require('../controllers/eventsController');
const auth = require('../middleware/auth');

// Routes
router.get('/', getAllEvents);

// 📅 Get events by date (must come BEFORE /:id)
router.get('/by-date', getEventsByDate);

router.get('/my-events', auth, getOrganizerEvents); 

router.get('/registered', auth, getRegisteredEvents); 

router.put('/unregister/:id', auth, unregisterFromEvent);

router.get('/:id/attendees', auth, getEventAttendees);

router.get('/:id', getEventById); // Get event by ID

router.post('/', auth, createEvent);

router.post("/register/:id", auth, registerForEvent);

router.put('/register/:id', auth, registerForEvent);

router.put('/:id', auth, updateEvent);

router.delete('/:id', auth, deleteEvent);
router.get('/verify/:token', verifyEventRegistration);

module.exports = router;
