import axios from 'axios';
import AuthService from './authService';

const API_URL = `${import.meta.env.VITE_API_URL}/api/activities`;

const getAuthHeader = () => {
    const user = AuthService.getCurrentUser();
    if (user && user.token) {
        return { Authorization: `Bearer ${user.token}` };
    } else {
        return {};
    }
};

const getActivities = async () => {
    const response = await axios.get(API_URL, {
        headers: getAuthHeader()
    });
    return response.data;
};

const clearActivities = async () => {
    const response = await axios.delete(API_URL, {
        headers: getAuthHeader()
    });
    return response.data;
};

const ActivityService = {
    getActivities,
    clearActivities
};

export default ActivityService;
