const Event = require('../models/Event');
const User = require('../models/User');

// @desc    Get all events for the public events page
// @access  Public
exports.getAllEvents = async (req, res) => {
    try {
        const { search, filter } = req.query; // Get search and filter from query params
        let queryObject = {};

        // --- SEARCH LOGIC ---
        // If there's a search term, create a case-insensitive regex search on title and description
        if (search) {
            queryObject.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
            ];
        }

        // --- FILTER LOGIC ---
        // Filter by date
        if (filter) {
            const now = new Date();
            if (filter === 'upcoming') {
                queryObject.date = { $gte: now }; // $gte means "greater than or equal to"
            } else if (filter === 'past') {
                queryObject.date = { $lt: now }; // $lt means "less than"
            }
        }
        
        // Find events using the dynamically built query object
        const events = await Event.find(queryObject)
            .sort({ date: 1 }) // Keep the sort
            .populate('organizer', 'name'); // Keep the populate

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
// AFTER

// @desc    Register the logged-in user for an event
// @access  Private (All Authenticated Users)
exports.registerForEvent = async (req, res) => {
    // The role check has been removed. The 'auth' middleware already ensures a user is logged in.
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ msg: 'Event not found' });
        }

        // Prevent the organizer from registering for their own event
        if (event.organizer.toString() === req.user.id) {
            return res.status(400).json({ msg: "You cannot register for your own event." });
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

exports.getEventById = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id).populate('organizer', 'name');

        if (!event) {
            return res.status(404).json({ msg: 'Event not found' });
        }

        res.json(event);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Event not found' });
        }
        res.status(500).send('Server Error');
    }
};

// @desc    Update an event
// @access  Private (Organizer Only)
exports.updateEvent = async (req, res) => {
    const { title, description, date, location } = req.body;

    try {
        let event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ msg: 'Event not found' });
        }

        // Ensure the user updating the event is the organizer
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

// @desc    Delete an event
// @access  Private (Organizer Only)
exports.deleteEvent = async (req, res) => {
    try {
        let event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ msg: 'Event not found' });
        }

        // Ensure the user deleting the event is the organizer
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
exports.getEventAttendees = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ msg: 'Event not found' });
        }

        // Ensure the user requesting the list is the event organizer
        if (event.organizer.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        // Find the event again but this time populate the attendees' details
        const eventWithAttendees = await Event.findById(req.params.id).populate(
            'attendees',
            'name email' // Select only the name and email fields of the users
        );

        res.json(eventWithAttendees.attendees);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.unregisterFromEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ msg: 'Event not found' });
        }

        // Use $pull to remove the user's ID from the attendees array
        await event.updateOne({ $pull: { attendees: req.user.id } });
        
        res.json({ msg: 'Successfully unregistered from the event' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};