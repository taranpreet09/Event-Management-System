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
  deleteEvent 
} = require('../controllers/eventsController');
const auth = require('../middleware/auth');

// --- CORRECT ROUTE ORDER ---

// @route   GET api/events
// @desc    Get all events
router.get('/', getAllEvents);

// @route   GET api/events/my-events
// @desc    Get events for the logged-in organizer
router.get('/my-events', auth, getOrganizerEvents); // <-- SPECIFIC route

// @route   GET api/events/registered
// @desc    Get events a user is registered for
router.get('/registered', auth, getRegisteredEvents); // <-- SPECIFIC route

// @route   PUT api/events/unregister/:id
// @desc    Unregister from an event
// @access  Private (Authenticated Users)
router.put('/unregister/:id', auth, unregisterFromEvent);

// @route   GET api/events/:id/attendees
// @desc    Get attendees for an event
// @access  Private (Organizer)
router.get('/:id/attendees', auth, getEventAttendees);

// @route   GET api/events/:id
// @desc    Get single event
router.get('/:id', getEventById); // <-- DYNAMIC/GENERIC route comes AFTER specific ones

// @route   POST api/events
// @desc    Create an event
router.post('/', auth, createEvent);

// @route   PUT api/events/register/:id
// @desc    Register for an event
router.put('/register/:id', auth, registerForEvent);

// @route   PUT api/events/:id
// @desc    Update an event
// @access  Private (Organizer)
router.put('/:id', auth, updateEvent);

// @route   DELETE api/events/:id
// @desc    Delete an event
// @access  Private (Organizer)
router.delete('/:id', auth, deleteEvent);

module.exports = router;