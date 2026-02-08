const jwt = require('jsonwebtoken');
const Range = require('../models/Range');

const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.range = await Range.findById(decoded.id).select('-passwordHash');
            req.deviceId = decoded.deviceId;

            if (!req.range) {
                return res.status(401).json({ message: 'Not authorized, range not found' });
            }

            if (!req.range.isActive) {
                return res.status(401).json({ message: 'Range account is disabled' });
            }

            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

const admin = (req, res, next) => {
    if (req.range && req.range.isAdmin) {
        next();
    } else {
        res.status(401).json({ message: 'Not authorized as admin' });
    }
};

module.exports = { protect, admin };
