import axios from 'axios';

const API_URL = 'http://localhost:5001/api/auth/';

const login = async (username, password) => {
    // Get deviceId from localStorage or let server handle new device logic
    let clientDeviceId = localStorage.getItem('deviceId');

    const response = await axios.post(API_URL + 'login', {
        username,
        password,
        clientDeviceId
    });

    if (response.data) {
        localStorage.setItem('user', JSON.stringify(response.data));
        // Save the deviceId returned from server
        if (response.data.deviceId) {
            localStorage.setItem('deviceId', response.data.deviceId);
        }
    }

    return response.data;
};

const logout = async () => {
    try {
        const userStr = localStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : null;
        const deviceId = localStorage.getItem('deviceId');

        if (user && user.token) {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            try {
                await axios.post(API_URL + 'logout', { deviceId }, config);
            } catch (err) {
                console.error("Logout API call failed", err);
            }
        }
    } catch (e) {
        console.error("Error during logout", e);
    } finally {
        localStorage.removeItem('user');
        // Keep deviceId? Maybe.
    }
};

const getCurrentUser = () => {
    try {
        const userStr = localStorage.getItem('user');
        if (!userStr) return null;
        return JSON.parse(userStr);
    } catch (error) {
        console.error("Error parsing user from local storage", error);
        localStorage.removeItem('user'); // Clear corrupt data
        return null;
    }
};

const subscribeToPush = async (subscription) => {
    const user = getCurrentUser();
    if (!user || !user.token) return;

    try {
        await axios.post('http://localhost:5001/api/notifications/subscribe', subscription, {
            headers: {
                Authorization: `Bearer ${user.token}`,
            },
        });
    } catch (err) {
        console.error("Failed to sync push subscription", err);
    }
};

const AuthService = {
    login,
    logout,
    getCurrentUser,
    subscribeToPush
};

export default AuthService;
