const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const organizer = require('../middleware/organizer');
const {
  sendMessageToAttendee,
  broadcastMessageToAttendees,
  getInbox,
  getConversationMessages,
} = require('../controllers/messagesController');

// Organizer → one attendee for a specific event
router.post('/events/:eventId/to/:attendeeId', auth, organizer, sendMessageToAttendee);

// Organizer → inbox message to all attendees of an event
router.post('/events/:eventId/broadcast-inbox', auth, organizer, broadcastMessageToAttendees);

// Inbox for current user (attendee or organizer)
router.get('/inbox', auth, getInbox);

// Messages inside a conversation
router.get('/conversations/:conversationId', auth, getConversationMessages);

module.exports = router;
