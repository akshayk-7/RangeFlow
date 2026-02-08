import axios from 'axios';
import AuthService from './authService';

const API_URL = 'http://localhost:5001/api/tasks/';

const getAuthHeader = () => {
    const user = AuthService.getCurrentUser();
    if (user && user.token) {
        return { Authorization: `Bearer ${user.token}` };
    } else {
        return {};
    }
};

const sendTask = async (taskData) => {
    const response = await axios.post(API_URL, taskData, {
        headers: getAuthHeader()
    });
    return response.data;
};

const getReceivedTasks = async () => {
    const response = await axios.get(API_URL + 'received', {
        headers: getAuthHeader()
    });
    return response.data;
};

const getSentTasks = async () => {
    const response = await axios.get(API_URL + 'sent', {
        headers: getAuthHeader()
    });
    return response.data;
};

const getStats = async () => {
    const response = await axios.get(API_URL + 'stats', {
        headers: getAuthHeader()
    });
    return response.data;
};

const markAsRead = async (taskId) => {
    const response = await axios.put(API_URL + taskId + '/read', {}, {
        headers: getAuthHeader()
    });
    return response.data;
};

// Admin Functions
const getAllTasks = async () => {
    const response = await axios.get(API_URL + 'all', {
        headers: getAuthHeader()
    });
    return response.data;
};

const deleteTask = async (taskId) => {
    const response = await axios.delete(API_URL + taskId, {
        headers: getAuthHeader()
    });
    return response.data;
};

const deleteAllTasks = async () => {
    const response = await axios.delete(API_URL + 'all', {
        headers: getAuthHeader()
    });
    return response.data;
};

const deleteBatchTasks = async (ids) => {
    const response = await axios.post(API_URL + 'delete-batch', { ids }, {
        headers: getAuthHeader()
    });
    return response.data;
};

const TaskService = {
    sendTask,
    getReceivedTasks,
    getSentTasks,
    getStats,
    markAsRead,
    getAllTasks,
    deleteTask,
    deleteAllTasks,
    deleteBatchTasks
};

export default TaskService;
