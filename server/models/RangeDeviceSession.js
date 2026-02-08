const mongoose = require('mongoose');

const rangeDeviceSessionSchema = new mongoose.Schema({
    rangeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Range',
        required: true
    },
    deviceId: {
        type: String,
        required: true
    },
    socketId: {
        type: String
    },
    lastSeen: {
        type: Date,
        default: Date.now
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Ensure unique active session per device? Or just track history.
// We probably want to update the existing session for a deviceId or create new if not exists.
// Compound index on rangeId and deviceId might be useful.

const RangeDeviceSession = mongoose.model('RangeDeviceSession', rangeDeviceSessionSchema);

module.exports = RangeDeviceSession;
