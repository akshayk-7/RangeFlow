const Task = require('./models/Task');
const Range = require('./models/Range');

module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log(`User Connected: ${socket.id}`);

        // Join specific room for the range
        socket.on('join_range', (rangeId) => {
            socket.join(rangeId);
            console.log(`User with ID: ${socket.id} joined room: ${rangeId}`);
        });

        // Send Task/Note
        socket.on('send_task', (task) => {
            try {
                // Task is already saved via API, just relay it to the recipient
                // Check if task has populated fields or if we need to send raw
                // The frontend sends the response from API, which should be the saved task

                // We might need to ensure 'fromRangeId' is populated if the API didn't populate it fully
                // But let's assume the API response or the socket event data is sufficient for now.
                // Actually, the API 'sendTask' returns the saved task. It might NOT populate 'fromRangeId' with name.
                // Let's rely on the fact that we can just emit what we got, or quickly populate if needed.
                // For safety/consistency with 'receive_task' listener which expects { fromRangeId: { rangeName: ... } }

                // If the frontend passes the RESULT of sendTask, it usually just has _id references.
                // We should probably rely on the controller to emit the event OR have the socket logic here populate it.
                // Let's populate it here to be safe.

                Task.findById(task._id)
                    .populate('fromRangeId', 'rangeName username')
                    .then(populatedTask => {
                        if (populatedTask) {
                            io.to(populatedTask.toRangeId.toString()).emit('receive_task', populatedTask);
                        }
                    })
                    .catch(err => console.error(err));

            } catch (err) {
                console.error('Error handling send_task socket event:', err);
            }
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
