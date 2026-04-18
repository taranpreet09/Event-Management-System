const User = require('../models/User');
const bcrypt = require('bcryptjs');
const Event = require('../models/Event');
const jwt = require('jsonwebtoken');

const createToken = (user) => {
    const payload = {
        user: {
            id: user.id,
            role: user.role,
            name: user.name,
            email: user.email,
            profileImage: user.profileImage || `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(user.name)}&backgroundColor=1a1c1c&textColor=faf9f8`,
        },
    };
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' });
};

exports.changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid current password' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);

        await user.save();

        res.json({ msg: 'Password updated successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.updateProfile = async (req, res) => {
    const { name, email, profileImage } = req.body;
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ msg: 'User not found' });

        if (name) user.name = name;
        if (email) user.email = email;
        if (profileImage !== undefined) user.profileImage = profileImage;

        await user.save();

        // Return a fresh JWT so the frontend can update the user context
        const token = createToken(user);
        res.json({ msg: 'Profile updated successfully', token });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.getMyAttendingEvents = async (req, res) => {
  try {
    const events = await Event.find({ attendees: req.user.id }).sort({ date: 1 });
    res.json(events);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.deleteAccount = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        // If we need to remove them from event attendees or delete their created events,
        // we can do it here, but typically we only delete the user document.
        await User.findByIdAndDelete(req.user.id);
        res.json({ msg: 'Account deleted permanently' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
