const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const EventSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    organizer: {
        type: Schema.Types.ObjectId,
        ref: 'user', 
        required: true,
    },
    attendees: [{
        type: Schema.Types.ObjectId,
        ref: 'user',
    }],
}, { timestamps: true }); 

module.exports = mongoose.model('event', EventSchema);