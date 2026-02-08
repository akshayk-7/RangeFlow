const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Range = require('../models/Range');
const RangeDeviceSession = require('../models/RangeDeviceSession');
const logActivity = require('../utils/logActivity');
const { v4: uuidv4 } = require('uuid');

const generateToken = (id, isAdmin, deviceId) => {
    return jwt.sign({ id, isAdmin, deviceId }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginRange = async (req, res) => {
    const { username, password, clientDeviceId } = req.body;

    try {
        console.log(`Attempting login for: ${username}`);
        const range = await Range.findOne({ username });

        if (!range) {
            console.log('Login failed: User not found');
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        const isMatch = await range.matchPassword(password);
        console.log(`User found. Match password result: ${isMatch}`);

        if (range && isMatch) {
            if (!range.isActive) {
                console.log('Login failed: Account inactive');
                const io = req.app.get('io');
                await logActivity(io, 'Login Failed', 'Account Disabled', username);
                return res.status(401).json({ message: 'Account is disabled' });
            }

            // Handle Device ID
            let deviceId = clientDeviceId;
            if (!deviceId) {
                deviceId = uuidv4();
            }

            // Update or Create Session
            await RangeDeviceSession.findOneAndUpdate(
                { rangeId: range._id, deviceId },
                {
                    isActive: true,
                    lastSeen: Date.now(),
                    socketId: null // will be updated on socket connect
                },
                { upsert: true, new: true }
            );

            // Create Activity Log
            const io = req.app.get('io');
            await logActivity(io, 'Login Success', `IP: ${req.ip}`, range.rangeName);

            const token = generateToken(range._id, range.isAdmin, deviceId);

            res.json({
                _id: range._id,
                rangeName: range.rangeName,
                username: range.username,
                isAdmin: range.isAdmin,
                deviceId,
                token
            });
        } else {
            res.status(401).json({ message: 'Invalid username or password' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logoutRange = async (req, res) => {
    try {
        const { deviceId } = req.body; // Or from req.deviceId if we use middleware

        await RangeDeviceSession.findOneAndUpdate(
            { rangeId: req.range._id, deviceId: req.deviceId },
            { isActive: false }
        );

        const io = req.app.get('io');
        await logActivity(io, 'Logout', 'User Signed Out', req.range.username);

        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const crypto = require('crypto'); // Import crypto

// ... existing imports ...

// @desc    Forgot Password
// @route   POST /api/auth/forgotpassword
// @access  Public
const forgotPassword = async (req, res) => {
    const { loginInput } = req.body; // Can be username or email

    try {
        const range = await Range.findOne({
            $or: [{ email: loginInput }, { username: loginInput }]
        });

        if (!range) {
            // Security: Don't reveal if user exists
            return res.status(200).json({ message: 'If that account exists, a reset link has been sent.' });
        }

        // Get reset token
        const resetToken = range.getResetPasswordToken();

        await range.save({ validateBeforeSave: false });

        // Construct Reset URL
        // Note: In production, use process.env.CLIENT_URL
        const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

        console.log('-------------------------------------------');
        console.log('PASSWORD RESET REQUESTED');
        console.log(`User: ${range.username}`);
        console.log(`Reset Link: ${resetUrl}`);
        console.log('-------------------------------------------');

        // Simulate Email Sending
        res.status(200).json({ message: 'If that account exists, a reset link has been sent.' });
    } catch (error) {
        console.error(error);
        range.resetPasswordToken = undefined;
        range.resetPasswordExpire = undefined;
        await range.save({ validateBeforeSave: false });
        res.status(500).json({ message: 'Email could not be sent' });
    }
};

// @desc    Reset Password
// @route   PUT /api/auth/resetpassword/:resetToken
// @access  Public
const resetPassword = async (req, res) => {
    try {
        // Get hashed token
        const resetPasswordToken = crypto
            .createHash('sha256')
            .update(req.params.resetToken)
            .digest('hex');

        const range = await Range.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!range) {
            return res.status(400).json({ message: 'Invalid token' });
        }

        // Set new password
        range.passwordHash = req.body.password;
        range.resetPasswordToken = undefined;
        range.resetPasswordExpire = undefined;

        await range.save();

        res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { loginRange, logoutRange, forgotPassword, resetPassword };
