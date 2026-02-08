const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    fromRangeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Range',
        required: true
    },
    toRangeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Range',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    kgid: {
        type: String,
        required: true
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        default: 'Medium'
    },
    isRead: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
