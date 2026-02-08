import axios from 'axios';
import AuthService from './authService';

const API_URL = `${import.meta.env.VITE_API_URL}/api/ranges`;

const getAuthHeader = () => {
    const user = AuthService.getCurrentUser();
    if (user && user.token) {
        return { Authorization: `Bearer ${user.token}` };
    } else {
        return {};
    }
};

const getRanges = async () => {
    const response = await axios.get(API_URL, {
        headers: getAuthHeader()
    });
    return response.data;
};

const createRange = async (rangeData) => {
    const response = await axios.post(API_URL, rangeData, {
        headers: getAuthHeader()
    });
    return response.data;
};

const updateRange = async (id, rangeData) => {
    const response = await axios.put(API_URL + '/' + id, rangeData, {
        headers: getAuthHeader()
    });
    return response.data;
};

const getRangeDevices = async (id) => {
    const response = await axios.get(API_URL + '/' + id + '/devices', {
        headers: getAuthHeader()
    });
    return response.data;
};

const deleteRange = async (id) => {
    const response = await axios.delete(API_URL + '/' + id, {
        headers: getAuthHeader()
    });
    return response.data;
};

const getApiUrl = () => API_URL;

const RangeService = {
    getRanges,
    createRange,
    updateRange,
    getRangeDevices,
    deleteRange,
    getApiUrl // Exporting this for debug
};

export default RangeService;
