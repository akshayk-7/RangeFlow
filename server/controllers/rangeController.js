const RangeDeviceSession = require('../models/RangeDeviceSession');
const bcrypt = require('bcryptjs');
const logActivity = require('../utils/logActivity');
const Range = require('../models/Range');
const Task = require('../models/Task');

// @desc    Create a new range
// @route   POST /api/ranges
// @access  Private/Admin
const createRange = async (req, res) => {
    try {
        console.log('Create Range Request Body:', req.body);
        const { rangeName, username, password } = req.body;

        if (!rangeName || !username || !password) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        const rangeExists = await Range.findOne({ $or: [{ username }, { rangeName }] });

        if (rangeExists) {
            return res.status(400).json({ message: 'Range name or username already exists' });
        }

        const range = new Range({
            rangeName,
            username,
            passwordHash: password, // Pre-save hook will hash this
            isAdmin: false
        });

        const createdRange = await range.save();

        res.status(201).json({
            _id: createdRange._id,
            rangeName: createdRange.rangeName,
            username: createdRange.username,
            isActive: createdRange.isActive
        });

        const io = req.app.get('io');
        await logActivity(io, 'Range Created', createdRange.rangeName, 'Admin');
    } catch (error) {
        console.error('Error in createRange:', error);
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// @desc    Get all ranges
// @route   GET /api/ranges
// @access  Private (Admin & Ranges)
const getRanges = async (req, res) => {
    try {
        // Fetching all ranges to ensure dropdown population
        const ranges = await Range.find({}).select('-passwordHash').sort({ createdAt: -1 });
        res.json(ranges);
    } catch (error) {
        console.error('CRITICAL ERROR IN GET RANGES:', error);
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};

// @desc    Update range status (enable/disable) or password
// @route   PUT /api/ranges/:id
// @access  Private/Admin
const updateRange = async (req, res) => {
    try {
        const range = await Range.findById(req.params.id);

        if (range) {
            if (req.body.rangeName) range.rangeName = req.body.rangeName;
            if (req.body.username) range.username = req.body.username;

            range.isActive = req.body.isActive !== undefined ? req.body.isActive : range.isActive;

            if (req.body.password) {
                range.passwordHash = req.body.password; // Pre-save hook will hash
            }

            const isStatusChange = req.body.isActive !== undefined && req.body.isActive !== range.isActive;
            const statusAction = range.isActive ? 'Range Enabled' : 'Range Disabled';

            const updatedRange = await range.save();

            if (isStatusChange) {
                const io = req.app.get('io');
                await logActivity(io, statusAction, updatedRange.rangeName, 'Admin');
            } else {
                const io = req.app.get('io');
                await logActivity(io, 'Range Updated', updatedRange.rangeName, 'Admin');
            }

            res.json({
                _id: updatedRange._id,
                rangeName: updatedRange.rangeName,
                username: updatedRange.username,
                isActive: updatedRange.isActive
            });
        } else {
            res.status(404).json({ message: 'Range not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get active devices for a range
// @route   GET /api/ranges/:id/devices
// @access  Private/Admin
const getRangeDevices = async (req, res) => {
    try {
        const sessions = await RangeDeviceSession.find({ rangeId: req.params.id, isActive: true });
        res.json(sessions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete a range
// @route   DELETE /api/ranges/:id
// @access  Private/Admin
const deleteRange = async (req, res) => {
    try {
        const { id } = req.params;

        console.log(`Delete request received for ID: "${id}" (Length: ${id.length})`);

        // Validate ObjectId
        const mongoose = require('mongoose');
        if (!mongoose.Types.ObjectId.isValid(id)) {
            console.log("Invalid ObjectId format");
            return res.status(400).json({ message: "Invalid ID format" });
        }

        const range = await Range.findById(id);
        console.log("Database find result:", range ? "Found" : "Not Found");

        if (!range) {
            console.log("Range not found in DB for ID:", id);
            return res.status(404).json({
                message: "Range not found"
            });
        }

        const rangeName = range.rangeName;

        // OPTIONAL CASCADE DELETE (IMPORTANT)
        // Using Task model as it seems to represent "Notes" in this system based on previous exploration
        // The user referred to "Note" but the codebase has "Task" with from/toRangeId
        const deleteResult = await Task.deleteMany({
            $or: [{ fromRangeId: range._id }, { toRangeId: range._id }]
        });
        console.log(`Deleted ${deleteResult.deletedCount} tasks/notes associated with range ${rangeName}`);

        await range.deleteOne();

        // Log activity if IO is available
        try {
            const io = req.app.get('io');
            if (io) {
                await logActivity(io, 'Range Deleted', rangeName, 'Admin');
            }
        } catch (logError) {
            console.error("Activity logging failed:", logError);
            // Non-critical error, continue
        }

        return res.status(200).json({
            message: "Range deleted successfully",
            deletedId: id
        });

    } catch (error) {
        console.error("Delete range error:", error);
        return res.status(500).json({
            message: "Failed to delete range"
        });
    }
};

// @desc    Get activity logs for a specific range
// @route   GET /api/ranges/:id/activity
// @access  Private
const getRangeActivity = async (req, res) => {
    try {
        // Ensure the requesting user is the range itself or an admin
        if (req.range._id.toString() !== req.params.id && !req.range.isAdmin) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const range = await Range.findById(req.params.id);
        if (!range) {
            return res.status(404).json({ message: 'Range not found' });
        }

        // Find logs where the range is either the performer or the target
        // Note: ActivityLog stores names, not IDs.
        const logs = await ActivityLog.find({
            $or: [
                { performedBy: range.rangeName },
                { target: range.rangeName }
            ]
        })
            .sort({ timestamp: -1 })
            .limit(50);

        res.json(logs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const resetRangePassword = async (req, res) => {
    try {
        const { userId, newPassword } = req.body;
        console.log('Admin Reset Password Request:', { userId, newPasswordLength: newPassword?.length });

        if (!userId || !newPassword) {
            return res.status(400).json({ message: 'User ID and new password are required' });
        }

        // Explicitly hash the password
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(newPassword, salt);

        // Update directly in DB
        const updatedRange = await Range.findByIdAndUpdate(
            userId,
            {
                passwordHash: hash,
                mustChangePassword: true
            },
            { new: true }
        );

        if (!updatedRange) {
            return res.status(404).json({ message: 'User not found' });
        }

        const io = req.app.get('io');
        await logActivity(io, 'Admin Reset Password', updatedRange.rangeName, 'Admin');

        res.json({ message: 'Password reset successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { createRange, getRanges, updateRange, getRangeDevices, deleteRange, getRangeActivity, resetRangePassword };
