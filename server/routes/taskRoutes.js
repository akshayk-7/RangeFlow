const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { sendTask, getReceivedTasks, getSentTasks, getTaskStats, markTaskRead } = require('../controllers/taskController');

router.post('/', protect, sendTask);
router.get('/received', protect, getReceivedTasks);
router.get('/sent', protect, getSentTasks);
router.get('/stats', protect, getTaskStats);
router.put('/:id/read', protect, markTaskRead);

// Admin Routes
const { getAllTasks, deleteTask, deleteAllTasks } = require('../controllers/taskController');
const { admin } = require('../middleware/authMiddleware');

router.get('/all', protect, admin, getAllTasks);

router.delete('/all', protect, admin, deleteAllTasks);
router.delete('/:id', protect, admin, deleteTask);

module.exports = router;
