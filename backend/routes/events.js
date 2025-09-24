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

router.get('/', getAllEvents);

router.get('/my-events', auth, getOrganizerEvents); 

router.get('/registered', auth, getRegisteredEvents); 

router.put('/unregister/:id', auth, unregisterFromEvent);

router.get('/:id/attendees', auth, getEventAttendees);

router.get('/:id', getEventById); 

router.post('/', auth, createEvent);

router.put('/register/:id', auth, registerForEvent);

router.put('/:id', auth, updateEvent);

router.delete('/:id', auth, deleteEvent);

module.exports = router;