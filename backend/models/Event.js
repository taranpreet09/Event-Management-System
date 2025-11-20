const mongoose = require('mongoose');
const crypto = require('crypto');
const Schema = mongoose.Schema;

const EventSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    shortDescription: {
        type: String,
        required: true,
        maxlength: 200,
    },
    description: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ['online', 'in_person'],
        required: true,
        default: 'in_person',
    },
    category: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    registrationDeadline: {
        type: Date,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    coverImageUrl: {
        type: String,
        required: true,
    },
    capacity: {
        type: Number,
        required: true,
        min: 1,
    },
    organizer: {
        type: Schema.Types.ObjectId,
        ref: 'user', 
        required: true,
    },
    attendees: [{
        user: {
            type: Schema.Types.ObjectId,
            ref: 'user',
            required: true,
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        verificationToken: String,
        verificationTokenExpires: Date,
    }],
}, { timestamps: true });
EventSchema.methods.createRegistrationToken = function(userId) {

    const attendee = this.attendees.find(
        (att) => att.user.toString() === userId.toString()
    );

    if (!attendee) {
        console.error("Attendee not found for token generation.");
        return null; 
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');

    attendee.verificationToken = crypto
        .createHash('sha256')
        .update(verificationToken)
        .digest('hex');
    
    attendee.verificationTokenExpires = Date.now() + 15 * 60 * 1000; 

    return verificationToken;
};



module.exports = mongoose.model('event', EventSchema);