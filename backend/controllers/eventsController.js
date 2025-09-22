const Event = require('../models/Event');
const User = require('../models/User');

// @desc    Get all events for the public events page
// @access  Public
exports.getAllEvents = async (req, res) => {
    try {
        const events = await Event.find().sort({ date: 1 }).populate('organizer', 'name');
        res.json(events);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Create a new event
// @access  Private (Organizer Only)
exports.createEvent = async (req, res) => {
    // Check if the user is an organizer
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
            organizer: req.user.id, // Assign the logged-in organizer as the event creator
        });

        const event = await newEvent.save();
        res.json(event);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Get all events created by the logged-in organizer
// @access  Private (Organizer Only)
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

// @desc    Register the logged-in user for an event
// @access  Private (User Only)
exports.registerForEvent = async (req, res) => {
     if (req.user.role !== 'user') {
         return res.status(403).json({ msg: 'Access denied: Users only' });
    }
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ msg: 'Event not found' });
        }

        // Use $addToSet to prevent adding the same user multiple times
        await event.updateOne({ $addToSet: { attendees: req.user.id } });
        
        res.json({ msg: 'Successfully registered for the event' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Get all events the logged-in user is registered for
// @access  Private (User Only)
exports.getRegisteredEvents = async (req, res) => {
     if (req.user.role !== 'user') {
         return res.status(403).json({ msg: 'Access denied: Users only' });
    }
    try {
        // Find events where the attendees array includes the user's ID
        const events = await Event.find({ attendees: req.user.id }).sort({ date: 1 });
        res.json(events);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};