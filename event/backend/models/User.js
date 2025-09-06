const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: { // For users, this is their full name. For orgs, it's the contact person's name.
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['user', 'organisation'],
    default: 'user',
  },
  // --- NEW FIELDS FOR ORGANISATIONS (OPTIONAL) ---
  organisationName: {
    type: String,
    required: function() { return this.role === 'organisation'; } // Required only if role is organisation
  },
  website: {
    type: String,
  },
  // ---------------------------------------------
}, {
  timestamps: true,
});

// ... (The pre-save password hashing hook remains exactly the same)
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

module.exports = mongoose.model('User', UserSchema);