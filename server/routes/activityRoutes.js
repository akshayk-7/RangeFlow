const express = require('express');
const router = express.Router();
const ActivityLog = require('../models/ActivityLog');

// @route   GET /api/activities
// @desc    Get all activity logs
// @access  Public (for now, or Admin protected)
router.get('/', async (req, res) => {
    try {
        const logs = await ActivityLog.find().sort({ timestamp: -1 }).limit(50);
        res.json(logs);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE /api/activities
// @desc    Clear all activity logs
// @access  Private (Admin)
router.delete('/', async (req, res) => {
    try {
        await ActivityLog.deleteMany({});
        res.json({ message: 'Activity logs cleared' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
