const mongoose = require('mongoose');

const ActivityLogSchema = new mongoose.Schema({
    actionType: {
        type: String,
        required: true,
        trim: true
    },
    target: {
        type: String,
        required: true,
        trim: true
    },
    performedBy: {
        type: String,
        required: true,
        trim: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('ActivityLog', ActivityLogSchema);
