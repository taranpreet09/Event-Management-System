const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const createToken = (user) => {
    const payload = {
        user: {
            id: user.id,
            role: user.role, 
            name: user.name,
            email: user.email,
        },
    };
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' });
};

exports.registerUser = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: 'User already exists' });

        user = new User({ name, email, password, role: 'user' });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();

        const token = createToken(user);
        res.json({ token });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};
exports.registerOrganizer = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: 'User already exists' });

        user = new User({ name, email, password, role: 'organizer' });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();

        const token = createToken(user);
        res.json({ token });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: 'Invalid Credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });

        const token = createToken(user);
        res.json({ token });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};
exports.checkEmail = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email }).select('-password');
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        
if (user.role === 'organizer') {
    return res.status(200).json({ role: 'organizer', organisationName: user.name });
}

return res.status(200).json({ role: 'user', name: user.name });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};