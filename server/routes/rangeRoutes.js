const express = require('express');
const router = express.Router();
const { createRange, getRanges, updateRange, getRangeDevices, deleteRange, getRangeActivity, resetRangePassword } = require('../controllers/rangeController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, admin, createRange)
    .get(protect, getRanges);

router.route('/:id')
    .put(protect, admin, updateRange)
    .delete(protect, admin, deleteRange);

router.route('/:id/devices')
    .get(protect, admin, getRangeDevices);

router.route('/:id/activity')
    .get(protect, getRangeActivity);

router.post('/reset-password', protect, admin, resetRangePassword);

module.exports = router;
