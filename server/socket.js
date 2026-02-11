const Task = require('./models/Task');
const Range = require('./models/Range');

module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log(`User Connected: ${socket.id}`);

        // Join specific room for the range
        socket.on('join_room', (rangeId) => {
            socket.join(rangeId);
            console.log(`User with ID: ${socket.id} joined room: ${rangeId}`);
        });



        // Mark as Read
        socket.on('mark_read', async (taskId) => {
            try {
                const task = await Task.findByIdAndUpdate(taskId, { isRead: true }, { new: true });
                if (task) {
                    // Notify sender that task was read
                    io.to(task.fromRangeId.toString()).emit('task_read_receipt', { taskId: task._id });
                }
            } catch (err) {
                console.error('Error handling mark_read socket event:', err);
            }
        });

        socket.on('disconnect', () => {
            console.log('User Disconnected', socket.id);
        });
    });
};
