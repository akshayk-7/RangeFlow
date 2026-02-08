const ActivityLog = require('../models/ActivityLog');

// Helper to save log and emit socket event
const logActivity = async (io, actionType, target, performedBy) => {
    try {
        const newLog = new ActivityLog({
            actionType,
            target,
            performedBy
        });
        const savedLog = await newLog.save();

        if (io) {
            io.emit('activity_log', savedLog);
        }
    } catch (err) {
        console.error('Error logging activity:', err);
    }
};

module.exports = logActivity;
