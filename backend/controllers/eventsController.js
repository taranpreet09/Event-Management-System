const Event = require('../models/Event');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');
const redis = require("../config/redis");   // Redis Added Here

// ================================
// Get all events (WITH CACHING)
// ================================
exports.getAllEvents = async (req, res) => {
  try {
    const { search, filter } = req.query;

    const cacheKey = `events:${search || "all"}:${filter || "all"}`;

    // 1️⃣ CHECK CACHE
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      console.log("🔥 CACHE HIT → getAllEvents");
      return res.json(JSON.parse(cachedData));
    }

    console.log("❄ CACHE MISS → fetching events from DB");

    let queryObject = {};

    if (search) {
      queryObject.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (filter) {
      const now = new Date();
      if (filter === 'upcoming') {
        queryObject.date = { $gte: now };
      } else if (filter === 'past') {
        queryObject.date = { $lt: now };
      }
    }

    const events = await Event.find(queryObject)
      .sort({ date: 1 })
      .populate('organizer', 'name')
      .populate('attendees.user', 'name');

    // 2️⃣ SAVE TO CACHE
    await redis.set(cacheKey, JSON.stringify(events), { EX: 120 });

    res.json(events);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// ================================
// Create new event (clear cache)
// ================================
exports.createEvent = async (req, res) => {
  if (req.user.role !== 'organizer') {
    return res.status(403).json({ msg: 'Access denied: Organizers only' });
  }

  const { title, description, date, location } = req.body;

  try {
    const newEvent = new Event({
      title,
      description,
      date,
      location,
      organizer: req.user.id,
    });

    const event = await newEvent.save();

    // ❌ Invalidate caches
    await redis.del("events:all:all");

    res.json(event);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// ================================
// Organizer Events
// ================================
exports.getOrganizerEvents = async (req, res) => {
  if (req.user.role !== 'organizer') {
    return res.status(403).json({ msg: 'Access denied: Organizers only' });
  }
  try {
    const events = await Event.find({ organizer: req.user.id }).sort({ date: -1 });
    res.json(events);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// ================================
// Register for Event
// ================================
exports.registerForEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = req.user.id;
        
    const event = await Event.findById(eventId);
    const user = await User.findById(userId);

    if (!event) return res.status(404).json({ msg: 'Event not found' });

    if (event.organizer.toString() === userId) {
      return res.status(400).json({ msg: "You cannot register for your own event." });
    }

    if (event.attendees.some(attendee => attendee.user.equals(userId))) {
      return res.status(400).json({ msg: 'You are already registered for this event.' });
    }

    event.attendees.push({ user: userId });

    const verificationToken = event.createRegistrationToken(userId);
    await event.save();

    const verificationURL = `${req.protocol}://${req.get('host')}/api/events/verify/${verificationToken}`;

    const message = `
      <h1>Hello ${user.name},</h1>
      <p>Thank you for registering for the event: <strong>${event.title}</strong>.</p>
      <p>Please click below to verify:</p>
      <a href="${verificationURL}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify</a>
    `;

    await sendEmail({
      email: user.email,
      subject: 'Confirm Your Event Registration',
      html: message,
    });

    // ❌ Invalidate caches
    await redis.del("events:all:all");
    await redis.del(`event:${eventId}`);

    res.json({ msg: 'Successfully registered! Check email for verification.' });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// ================================
// Verify Registration
// ================================
exports.verifyEventRegistration = async (req, res) => {
  try {
    const token = req.params.token;
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const event = await Event.findOne({
      'attendees.verificationToken': hashedToken,
      'attendees.verificationTokenExpires': { $gt: Date.now() },
    });

    if (!event) {
      return res.status(400).send('<h1>Error</h1><p>Token is invalid or has expired.</p>');
    }

    const attendee = event.attendees.find(
      (att) => att.verificationToken === hashedToken
    );

    attendee.isVerified = true;
    attendee.verificationToken = undefined;
    attendee.verificationTokenExpires = undefined;

    await event.save();

    // ❌ Clear cache
    await redis.del("events:all:all");
    await redis.del(`event:${event._id}`);

    res.status(200).send('<h1>Success!</h1><p>Your registration is confirmed.</p>');

  } catch (err) {
    console.error(err.message);
    res.status(500).send('<h1>Error</h1><p>An error occurred during verification.</p>');
  }
};

// ================================
// Registered Events
// ================================
exports.getRegisteredEvents = async (req, res) => {
  if (req.user.role !== 'user') {
    return res.status(403).json({ msg: 'Access denied: Users only' });
  }
  try {
    const events = await Event.find({ 'attendees.user': req.user.id }).sort({ date: 1 });
    res.json(events);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// ================================
// Get Event By ID (WITH CACHE)
// ================================
exports.getEventById = async (req, res) => {
  try {
    const cacheKey = `event:${req.params.id}`;

    const cachedEvent = await redis.get(cacheKey);
    if (cachedEvent) {
      console.log("🔥 CACHE HIT → event by ID");
      return res.json(JSON.parse(cachedEvent));
    }
     console.log("❄ CACHE MISS → fetching event by id");
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'name')
      .populate('attendees.user', 'name email');

    if (!event) {
      return res.status(404).json({ msg: 'Event not found' });
    }

    await redis.set(cacheKey, JSON.stringify(event), { EX: 300 });

    res.json(event);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// ================================
// Update Event
// ================================
exports.updateEvent = async (req, res) => {
  const { title, description, date, location } = req.body;

  try {
    let event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ msg: 'Event not found' });

    if (event.organizer.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    event = await Event.findByIdAndUpdate(
      req.params.id,
      { $set: { title, description, date, location } },
      { new: true }
    );

    // ❌ Clear cache
    await redis.del("events:all:all");
    await redis.del(`event:${req.params.id}`);

    res.json(event);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// ================================
// Delete Event
// ================================
exports.deleteEvent = async (req, res) => {
  try {
    let event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ msg: 'Event not found' });

    if (event.organizer.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    await Event.findByIdAndDelete(req.params.id);

    // ❌ Invalidate caches
    await redis.del("events:all:all");
    await redis.del(`event:${req.params.id}`);

    res.json({ msg: 'Event removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// ================================
// Get Attendees
// ================================
exports.getEventAttendees = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ msg: 'Event not found' });

    if (event.organizer.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    const eventWithAttendees = await Event.findById(req.params.id)
      . populate('attendees.user', 'name email');

    res.json(eventWithAttendees.attendees);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// ================================
// Unregister From Event
// ================================
exports.unregisterFromEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ msg: 'Event not found' });

    await event.updateOne({ $pull: { attendees: { user: req.user.id } } });

    // ❌ Clear cache
    await redis.del("events:all:all");
    await redis.del(`event:${req.params.id}`);

    res.json({ msg: 'Successfully unregistered from the event' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// ================================
// Get Events By Date (WITH CACHE)
// ================================
exports.getEventsByDate = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ message: "Date is required" });

    const cacheKey = `eventsByDate:${date}`;

    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      console.log("🔥 CACHE HIT → eventsByDate");
      return res.json(JSON.parse(cachedData));
    }
    console.log("cache miss ");
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);

    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const events = await Event.find({
      date: { $gte: start, $lte: end }
    }).populate('organizer', 'name');

    await redis.set(cacheKey, JSON.stringify(events), { EX: 120 });

    res.json(events);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};
