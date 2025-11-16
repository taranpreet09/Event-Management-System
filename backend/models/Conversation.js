const mongoose = require('mongoose');
const { Schema } = mongoose;

const ConversationSchema = new Schema(
  {
    event: { type: Schema.Types.ObjectId, ref: 'event', required: true },
    organizer: { type: Schema.Types.ObjectId, ref: 'user', required: true },
    attendee: { type: Schema.Types.ObjectId, ref: 'user', required: true },
    lastMessageAt: { type: Date, default: Date.now },
    lastMessagePreview: { type: String },
    // later: unread counts, archived flags, etc.
  },
  { timestamps: true }
);

module.exports = mongoose.model('conversation', ConversationSchema);