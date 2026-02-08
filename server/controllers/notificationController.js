const NotificationSubscription = require('../models/NotificationSubscription');

// @desc    Subscribe to push notifications
// @route   POST /api/notifications/subscribe
// @access  Private
const subscribe = async (req, res) => {
    try {
        const subscription = req.body;
        console.log('Received Subscription:', subscription);

        if (!subscription || !subscription.endpoint || !subscription.keys) {
            return res.status(400).json({ message: 'Invalid subscription object' });
        }

        // Store only one subscription per rangeId to prevent duplicate notifications
        const updatedSub = await NotificationSubscription.findOneAndUpdate(
            { rangeId: req.range._id },
            {
                endpoint: subscription.endpoint,
                keys: subscription.keys
            },
            { upsert: true, new: true }
        );

        res.status(200).json({
            message: 'Subscription updated',
            subscription: updatedSub
        });

    } catch (error) {
        console.error('Error in subscribe:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { subscribe };
