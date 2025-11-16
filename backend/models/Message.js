const mongoose = require('mongoose');
const { Schema } = mongoose;

const MessageSchema = new Schema(
  {
    conversation: { type: Schema.Types.ObjectId, ref: 'conversation', required: true },
    from: { type: Schema.Types.ObjectId, ref: 'user', required: true },
    to: { type: Schema.Types.ObjectId, ref: 'user', required: true },
    text: { type: String, required: true },
    readAt: { type: Date }, // null = unread
  },
  { timestamps: true }
);

module.exports = mongoose.model('message', MessageSchema);