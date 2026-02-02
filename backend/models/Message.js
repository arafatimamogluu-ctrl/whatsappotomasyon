const mongoose = require('mongoose');

const messageSchema = mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        messageType: {
            type: String,
            enum: ['text', 'image', 'video'],
            default: 'text',
        },
        textContent: {
            type: String,
        },
        mediaUrl: {
            type: String,
        },
        mediaCaption: {
            type: String,
        },
        targetGroups: [
            {
                type: String,
            },
        ],
        targetContacts: [
            {
                type: String,
            },
        ],
        scheduledDate: {
            type: Date,
        },
        scheduledTime: {
            type: String,
        },
        delayBetweenMessages: {
            type: Number,
            default: 20, // Seconds
        },
        status: {
            type: String,
            enum: ['pending', 'scheduled', 'sending', 'completed', 'failed'],
            default: 'pending',
        },
        sentCount: {
            type: Number,
            default: 0,
        },
        failedCount: {
            type: Number,
            default: 0,
        },
        executedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
