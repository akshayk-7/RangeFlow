const Task = require('../models/Task');
const Range = require('../models/Range');
const logActivity = require('../utils/logActivity');

// @desc    Send a new task (HTTP fallback/primary)
// @route   POST /api/tasks
// @access  Private
const sendTask = async (req, res) => {
    try {
        const { toRangeId, title, message, kgid, priority } = req.body;

        const task = new Task({
            fromRangeId: req.range._id,
            toRangeId,
            title,
            message,
            kgid,
            priority
        });

        const savedTask = await task.save();
        await savedTask.populate('fromRangeId', 'rangeName username');
        await savedTask.populate('toRangeId', 'rangeName username');

        // Send Push Notification
        const io = req.app.get('io');
        if (io) {
            io.to(task.toRangeId.toString()).emit('new_note', savedTask);
        }

        // Log Activity
        await logActivity(io, 'Note Sent', savedTask.toRangeId.rangeName, req.range.rangeName);

        try {
            const webpush = require('web-push');
            const NotificationSubscription = require('../models/NotificationSubscription');

            const subscriptions = await NotificationSubscription.find({ rangeId: toRangeId });

            const payload = JSON.stringify({
                title: `New Note from ${req.range.rangeName}`,
                body: message.length > 50 ? message.substring(0, 50) + '...' : message,
                url: '/dashboard'
            });

            // Send to all subscriptions for this user
            subscriptions.forEach(sub => {
                webpush.sendNotification(sub.keys ? { endpoint: sub.endpoint, keys: sub.keys } : { endpoint: sub.endpoint }, payload)
                    .catch(err => {
                        console.error('Error sending push:', err);
                        if (err.statusCode === 410 || err.statusCode === 404) {
                            // Subscription expired or invalid, delete it
                            NotificationSubscription.deleteOne({ _id: sub._id }).exec();
                        }
                    });
            });

        } catch (pushErr) {
            console.error('Push notification error:', pushErr);
            // Don't fail the request if push fails
        }

        res.status(201).json(savedTask);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get tasks for the logged in range (Received)
// @route   GET /api/tasks/received
// @access  Private
const getReceivedTasks = async (req, res) => {
    try {
        const tasks = await Task.find({ toRangeId: req.range._id })
            .populate('fromRangeId', 'rangeName username')
            .sort({ createdAt: -1 });
        res.json(tasks);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get tasks sent by the logged in range
// @route   GET /api/tasks/sent
// @access  Private
const getSentTasks = async (req, res) => {
    try {
        const tasks = await Task.find({ fromRangeId: req.range._id })
            .populate('toRangeId', 'rangeName username')
            .sort({ createdAt: -1 });
        res.json(tasks);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get stats for dashboard
// @route   GET /api/tasks/stats
// @access  Private
const getTaskStats = async (req, res) => {
    try {
        const receivedCount = await Task.countDocuments({ toRangeId: req.range._id });
        const sentCount = await Task.countDocuments({ fromRangeId: req.range._id });
        const unreadCount = await Task.countDocuments({ toRangeId: req.range._id, isRead: false });

        // Count total peers (ranges) excluding self and admins
        const rangesCount = await Range.countDocuments({ _id: { $ne: req.range._id }, isAdmin: false });

        res.json({
            received: receivedCount,
            sent: sentCount,
            unread: unreadCount,
            colleagues: rangesCount
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Mark task as read
// @route   PUT /api/tasks/:id/read
// @access  Private
const markTaskRead = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Ensure only the recipient can mark it as read
        if (task.toRangeId.toString() !== req.range._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        task.isRead = true;
        await task.save();

        const io = req.app.get('io');
        if (io) {
            io.to(task.fromRangeId.toString()).emit('task_read_receipt', { taskId: task._id });
        }

        await logActivity(io, 'Note Read', `Note KGID ${task.kgid || 'N/A'}`, req.range.rangeName);

        res.json(task);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
}

// @desc    Get all tasks (Admin)
// @route   GET /api/tasks/all
// @access  Private/Admin
const getAllTasks = async (req, res) => {
    try {
        const tasks = await Task.find({})
            .populate('fromRangeId', 'rangeName username')
            .populate('toRangeId', 'rangeName username')
            .sort({ createdAt: -1 });
        res.json(tasks);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete a task (Admin)
// @route   DELETE /api/tasks/:id
// @access  Private/Admin
const deleteTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (task) {
            await task.deleteOne();

            const io = req.app.get('io');
            if (io) {
                io.emit('note:deleted', req.params.id);
            }
            await logActivity(io, 'Note deleted', `Note ID ${req.params.id}`, 'Admin');

            res.json({ message: 'Task removed' });
        } else {
            res.status(404).json({ message: 'Task not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete all tasks (Admin)
// @route   DELETE /api/tasks/all
// @access  Private/Admin
const deleteAllTasks = async (req, res) => {
    try {
        await Task.deleteMany({});

        const io = req.app.get('io');
        if (io) {
            io.emit('notes:cleared');
        }
        await logActivity(io, 'Bulk delete', 'All notes', 'Admin');

        res.json({ message: 'All tasks removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};



module.exports = { sendTask, getReceivedTasks, getSentTasks, getTaskStats, markTaskRead, getAllTasks, deleteTask, deleteAllTasks };
