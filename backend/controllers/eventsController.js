const Event = require('../models/Event');
const User = require('../models/User');

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
            .populate('organizer', 'name');

        res.json(events);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

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

exports.registerForEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ msg: 'Event not found' });
        }

        if (event.organizer.toString() === req.user.id) {
            return res.status(400).json({ msg: "You cannot register for your own event." });
        }

        await event.updateOne({ $addToSet: { attendees: req.user.id } });
        
        res.json({ msg: 'Successfully registered for the event' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.getRegisteredEvents = async (req, res) => {
     if (req.user.role !== 'user') {
         return res.status(403).json({ msg: 'Access denied: Users only' });
    }
    try {
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

exports.updateEvent = async (req, res) => {
    const { title, description, date, location } = req.body;

    try {
        let event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ msg: 'Event not found' });
        }

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

exports.deleteEvent = async (req, res) => {
    try {
        let event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ msg: 'Event not found' });
        }

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

        if (event.organizer.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        const eventWithAttendees = await Event.findById(req.params.id).populate(
            'attendees',
            'name email'
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

        await event.updateOne({ $pull: { attendees: req.user.id } });
        
        res.json({ msg: 'Successfully unregistered from the event' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
