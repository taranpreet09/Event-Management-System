const Event = require('../models/Event');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');
// Get all events with optional search and filter
exports.getAllEvents = async (req, res) => {
  try {
    const { search, filter } = req.query;
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
    res.json(events);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Create new event (organizer only)
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
    res.json(event);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Get events for a specific organizer
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

// Register for an event
exports.registerForEvent = async (req, res) => {
    try {
        const eventId = req.params.id;
        const userId = req.user.id;
        
        const event = await Event.findById(eventId);
        const user = await User.findById(userId); // Get user details for email

        if (!event) {
            return res.status(404).json({ msg: 'Event not found' });
        }

        if (event.organizer.toString() === userId) {
            return res.status(400).json({ msg: "You cannot register for your own event." });
        }

        // Check if user is already in the attendees list
        if (event.attendees.some(attendee => attendee.user.equals(userId))) {
            return res.status(400).json({ msg: 'You are already registered for this event.' });
        }

        // Add user to attendees list (unverified)
        event.attendees.push({ user: userId });
        
        // Generate verification token using our model method
        const verificationToken = event.createRegistrationToken(userId);
        await event.save();

        // Create verification URL
        const verificationURL = `${req.protocol}://${req.get(
          'host'
        )}/api/events/verify/${verificationToken}`; // NOTE: Make sure this matches your route in events.js

        const message = `
          <h1>Hello ${user.name},</h1>
          <p>Thank you for registering for the event: <strong>${event.title}</strong>.</p>
          <p>Please click the link below to confirm your registration. This link is valid for 15 minutes.</p>
          <a href="${verificationURL}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify My Registration</a>
          <p>If you did not register for this event, please ignore this email.</p>
        `;

        // Send the email
        await sendEmail({
          email: user.email,
          subject: 'Confirm Your Event Registration',
          html: message,
        });

        res.json({ msg: 'Successfully registered! Please check your email to verify.' });

    } catch (err) {
        console.error(err.message);
        // TODO: Add logic to remove the user from attendees if email sending fails
        res.status(500).send('Server Error');
    }
};
// ▲▲▲ END OF UPDATED FUNCTION ▲▲▲


// ▼▼▼ THIS IS A NEW FUNCTION ▼▼▼
exports.verifyEventRegistration = async (req, res) => {
    try {
        const token = req.params.token;
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        // Find the event containing the attendee with this token
        const event = await Event.findOne({
          'attendees.verificationToken': hashedToken,
          'attendees.verificationTokenExpires': { $gt: Date.now() },
        });
    
        if (!event) {
          return res.status(400).send('<h1>Error</h1><p>Token is invalid or has expired.</p>');
        }
    
        // Find the specific attendee to update
        const attendee = event.attendees.find(
          (att) => att.verificationToken === hashedToken
        );
    
        // Update the attendee's status to verified
        attendee.isVerified = true;
        attendee.verificationToken = undefined;
        attendee.verificationTokenExpires = undefined;
    
        await event.save();
    
        // You can redirect to a success page on your frontend
        // res.redirect('http://your-frontend.com/registration-success');
        res.status(200).send('<h1>Success!</h1><p>Your registration is confirmed. Thank you!</p>');

    } catch (err) {
        console.error(err.message);
        res.status(500).send('<h1>Error</h1><p>An error occurred during verification.</p>');
    }
};
// ▲▲▲ END OF NEW FUNCTION ▲▲▲

// Get events registered by a user
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

// Get event by ID
exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'name')
      .populate('attendees.user', 'name email');

    if (!event) {
      return res.status(404).json({ msg: 'Event not found' });
    }
    res.json(event);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId')
      return res.status(404).json({ msg: 'Event not found' });
    res.status(500).send('Server Error');
  }
};

// Update event (organizer only)
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

    res.json(event);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Delete event (organizer only)
exports.deleteEvent = async (req, res) => {
  try {
    let event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ msg: 'Event not found' });

    if (event.organizer.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    await Event.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Event removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Get attendees of an event
exports.getEventAttendees = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ msg: 'Event not found' });

    if (event.organizer.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    const eventWithAttendees = await Event.findById(req.params.id).populate(
      'attendees.user',
      'name email'
    );

    res.json(eventWithAttendees.attendees);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Unregister from an event
exports.unregisterFromEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ msg: 'Event not found' });

    await event.updateOne({ $pull: { attendees: req.user.id } });
    res.json({ msg: 'Successfully unregistered from the event' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// 📅 Get events by date (timezone-safe)
// 📅 Get events by date (local date handling)
exports.getEventsByDate = async (req, res) => {
  try {
    const { date } = req.query; // expecting YYYY-MM-DD
    if (!date) return res.status(400).json({ message: "Date is required" });

    // Start of the day (local)
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);

    // End of the day (local)
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const events = await Event.find({
      date: { $gte: start, $lte: end }
    }).populate('organizer', 'name');

    res.json(events);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};
