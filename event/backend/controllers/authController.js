const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Helper function to generate a JWT
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '1h', // Token expires in 1 hour
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
exports.registerUser = async (req, res) => {
const { name, email, password, role, organisationName, website } = req.body;

try {
    // 1. Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'An account with this email already exists' });
    }

    // 2. Build the user object based on the provided data
    const newUserDetails = {
      name,
      email,
      password,
      role: role || 'user', // Default to 'user' if role is not provided
    };

    // If registering an organisation, add organisation-specific fields
    if (newUserDetails.role === 'organisation') {
      if (!organisationName) {
        return res.status(400).json({ msg: 'Organisation name is required' });
      }
      newUserDetails.organisationName = organisationName;
      if (website) {
        newUserDetails.website = website;
      }
    }

    // 3. Create a new user instance
    user = new User(newUserDetails);

    // 4. Save the user to the database (password gets hashed automatically)
    await user.save();

    // 5. Generate a token and send it back
    const token = generateToken(user._id, user.role);
    res.status(201).json({ token });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Authenticate user & get token (Login)
// @route   POST /api/auth/login
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // 2. Compare the submitted password with the hashed password in the database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // 3. If credentials are correct, generate and return a token
    const token = generateToken(user._id, user.role);
    res.json({ token });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.checkEmail = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    // IMPORTANT: For security, we don't want to confirm if an email is registered or not.
    // We just provide the necessary info for the UI to change if it's an organisation.
    if (user && user.role === 'organisation') {
      // If the user is an organisation, send back the details
      return res.json({
        role: user.role,
        organisationName: user.organisationName,
      });
    } else {
      // For any other case (regular user or non-existent email), send a generic response
      return res.json({
        role: 'user',
        organisationName: null,
      });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};