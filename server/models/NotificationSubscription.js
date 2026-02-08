const mongoose = require('mongoose');

const notificationSubscriptionSchema = new mongoose.Schema({
    rangeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Range',
        required: true
    },
    endpoint: {
        type: String,
        required: true
    },
    keys: {
        p256dh: { type: String, required: true },
        auth: { type: String, required: true }
    }
}, {
    timestamps: true
});

const NotificationSubscription = mongoose.model('NotificationSubscription', notificationSubscriptionSchema);

module.exports = NotificationSubscription;
