import { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
// import { SocketProvider } from './context/SocketContext'; // Import SocketProvider
import { AlertProvider } from './context/AlertContext'; // Import AlertProvider
import AuthContext from './context/AuthContext';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import TaskDashboard from './pages/Dashboard'; // Import new TaskDashboard
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AdminResetPassword from './pages/AdminResetPassword';

import LandingPage from './pages/LandingPage';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
    const { user, loading } = useContext(AuthContext);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/login" />;
    }

    return children;
};

// Admin Route Component
const AdminRoute = ({ children }) => {
    const { user, loading } = useContext(AuthContext);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!user || !user.isAdmin) {
        return <Navigate to="/dashboard" />;
    }

    return children;
};

function App() {
    return (
        <Router>
            <AuthProvider>
                <AlertProvider>
                    <Routes>
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/login" element={<Login />} />

                        {/* Regular Dashboard */}
                        <Route
                            path="/dashboard"
                            element={
                                <ProtectedRoute>
                                    <TaskDashboard />
                                </ProtectedRoute>
                            }
                        />

                        {/* Admin Dashboard */}
                        <Route
                            path="/admin"
                            element={
                                <AdminRoute>
                                    <AdminDashboard />
                                </AdminRoute>
                            }
                        />
                        <Route
                            path="/admin/reset-password"
                            element={
                                <AdminRoute>
                                    <AdminResetPassword />
                                </AdminRoute>
                            }
                        />

                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/reset-password/:token" element={<ResetPassword />} />
                    </Routes>

                </AlertProvider>
            </AuthProvider>
        </Router >
    )
}

export default App
