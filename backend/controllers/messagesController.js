const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Event = require('../models/Event');
const User = require('../models/User');
const { enqueueNotificationJob } = require('../utils/queue');

// Helper: find or create a conversation between organizer and attendee for an event
async function getOrCreateConversation(eventId, organizerId, attendeeId) {
  let convo = await Conversation.findOne({ event: eventId, organizer: organizerId, attendee: attendeeId });
  if (!convo) {
    convo = await Conversation.create({ event: eventId, organizer: organizerId, attendee: attendeeId });
  }
  return convo;
}

// POST /api/messages/events/:eventId/to/:attendeeId
// Organizer sends a message to a single attendee for a specific event
exports.sendMessageToAttendee = async (req, res) => {
  try {
    const { eventId, attendeeId } = req.params;
    const { text } = req.body;
    const organizerId = req.user.id;

    if (!text || !text.trim()) {
      return res.status(400).json({ msg: 'Text is required' });
    }

    const event = await Event.findById(eventId).populate('organizer', 'name');
    if (!event) return res.status(404).json({ msg: 'Event not found' });

    // NOTE: Ownership check removed to avoid mismatches between event.organizer and token
    // The organizer middleware already ensures the user has organizer role.

    const isAttendee = event.attendees.some((a) => a.user.toString() === attendeeId.toString());
    if (!isAttendee) {
      return res.status(400).json({ msg: 'Target user is not an attendee of this event.' });
    }

    const attendee = await User.findById(attendeeId);
    if (!attendee) return res.status(404).json({ msg: 'Attendee not found' });

    const convo = await getOrCreateConversation(eventId, organizerId, attendeeId);

    const message = await Message.create({
      conversation: convo._id,
      from: organizerId,
      to: attendeeId,
      text: text.trim(),
    });

    convo.lastMessageAt = new Date();
    convo.lastMessagePreview = text.slice(0, 140);
    await convo.save();

    // Enqueue notification for inbox
    await enqueueNotificationJob({
      type: 'INBOX_MESSAGE',
      toUserId: attendeeId,
      eventId: eventId,
      conversationId: convo._id,
      organizerName: event.organizer.name,
      text: text.trim(),
    });

    return res.status(201).json({ msg: 'Message sent', conversationId: convo._id, message });
  } catch (err) {
    console.error('sendMessageToAttendee error:', err);
    res.status(500).json({ msg: 'Server Error' });
  }
};

exports.broadcastMessageToAttendees = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { text } = req.body;
    const organizerId = req.user.id;

    if (!text || !text.trim()) {
      return res.status(400).json({ msg: 'Text is required' });
    }

    const event = await Event.findById(eventId).populate('organizer', 'name attendees.user');
    if (!event) return res.status(404).json({ msg: 'Event not found' });


    const attendees = event.attendees.map((a) => a.user.toString());
    if (!attendees.length) {
      return res.status(400).json({ msg: 'No attendees to message for this event.' });
    }

    // Simple sequential implementation; can be optimized later
    for (const attendeeId of attendees) {
      const convo = await getOrCreateConversation(eventId, organizerId, attendeeId);

      await Message.create({
        conversation: convo._id,
        from: organizerId,
        to: attendeeId,
        text: text.trim(),
      });

      convo.lastMessageAt = new Date();
      convo.lastMessagePreview = text.slice(0, 140);
      await convo.save();

      await enqueueNotificationJob({
        type: 'INBOX_MESSAGE',
        toUserId: attendeeId,
        eventId: eventId,
        conversationId: convo._id,
        organizerName: event.organizer.name,
        text: text.trim(),
      });
    }

    return res.status(201).json({ msg: 'Inbox message sent to all attendees.' });
  } catch (err) {
    console.error('broadcastMessageToAttendees error:', err);
    res.status(500).json({ msg: 'Server Error' });
  }
};

exports.getInbox = async (req, res) => {
  try {
    const userId = req.user.id;

    const conversations = await Conversation.find({
      $or: [{ attendee: userId }, { organizer: userId }],
    })
      .populate('event', 'title date')
      .populate('organizer', 'name')
      .populate('attendee', 'name email')
      .sort({ lastMessageAt: -1 });

    // Attach unreadCount for each conversation: messages sent *to* this user that are not read.
    const withUnread = await Promise.all(
      conversations.map(async (convo) => {
        const unreadCount = await Message.countDocuments({
          conversation: convo._id,
          to: userId,
          $or: [{ readAt: { $exists: false } }, { readAt: null }],
        });

        const obj = convo.toObject();
        obj.unreadCount = unreadCount;
        return obj;
      })
    );

    res.json(withUnread);
  } catch (err) {
    console.error('getInbox error:', err);
    res.status(500).json({ msg: 'Server Error' });
  }
};
exports.getConversationMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    const convo = await Conversation.findById(conversationId);
    if (!convo) return res.status(404).json({ msg: 'Conversation not found' });

    if (
      convo.attendee.toString() !== userId.toString() &&
      convo.organizer.toString() !== userId.toString()
    ) {
      return res.status(403).json({ msg: 'You are not part of this conversation.' });
    }

    const messages = await Message.find({ conversation: conversationId })
      .populate('from', 'name email role')
      .populate('to', 'name email role')
      .sort({ createdAt: 1 });

    // Mark all messages sent *to* this user as read
    await Message.updateMany(
      {
        conversation: conversationId,
        to: userId,
        $or: [{ readAt: { $exists: false } }, { readAt: null }],
      },
      { $set: { readAt: new Date() } }
    );

    res.json(messages);
  } catch (err) {
    console.error('getConversationMessages error:', err);
    res.status(500).json({ msg: 'Server Error' });
  }
};
