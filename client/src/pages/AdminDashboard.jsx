import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import RangeService from '../services/rangeService';
import TaskService from '../services/taskService'; // Import TaskService
import AuthService from '../services/authService';
import { useNavigate } from 'react-router-dom';
import { Filter, Calendar, ArrowUpDown, Activity, FileText, X, Search, AlertCircle, CheckCircle } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Skeleton from '../components/Skeleton';
import ActivityService from '../services/activityService';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAlert } from '../context/AlertContext'; // Import useAlert

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('ranges');
    const [ranges, setRanges] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingRange, setEditingRange] = useState(null);
    const [newRange, setNewRange] = useState({ rangeName: '', username: '', password: '' });
    const [editRangeData, setEditRangeData] = useState({ rangeName: '', username: '', password: '' });
    const [isLoading, setIsLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    // Dark Mode State
    const [isDarkMode, setIsDarkMode] = useState(() => {
        return localStorage.getItem('theme') === 'dark';
    });

    const [showActivityModal, setShowActivityModal] = useState(false);
    const [activityLogs, setActivityLogs] = useState([]);
    const socketRef = useRef();

    const [filters, setFilters] = useState({
        fromRange: '',
        toRange: '',
        priority: 'All',
        dateStart: '',
        dateEnd: '',
        sortBy: 'newest'
    });

    // Bulk Select State
    const [liveStatusText, setLiveStatusText] = useState('Live updates enabled');
    const statusTimeoutRef = useRef(null);


    const { showAlert } = useAlert(); // Destructure showAlert

    const navigate = useNavigate();

    // Theme Toggle Handler
    const toggleTheme = () => {
        const newMode = !isDarkMode;
        setIsDarkMode(newMode);
        localStorage.setItem('theme', newMode ? 'dark' : 'light');
    };

    const triggerLiveUpdate = () => {
        setLiveStatusText('Last updated: just now');
        if (statusTimeoutRef.current) clearTimeout(statusTimeoutRef.current);
        statusTimeoutRef.current = setTimeout(() => {
            setLiveStatusText('Last updated: a few moments ago');
        }, 4000);
    };

    // Derived Styles based on Theme
    const theme = {
        bg: isDarkMode ? '#111827' : '#f3f4f6',
        text: isDarkMode ? '#f3f4f6' : '#111827',
        subText: isDarkMode ? '#9ca3af' : '#6b7280',
        cardBg: isDarkMode ? '#1f2937' : 'white',
        border: isDarkMode ? '#374151' : '#f3f4f6',
        hover: isDarkMode ? '#374151' : '#f9fafb',
        tableHeader: isDarkMode ? '#374151' : '#f9fafb',
        inputBg: isDarkMode ? '#374151' : '#f9fafb',
        inputBorder: isDarkMode ? '#4b5563' : '#e5e7eb',
        inputText: isDarkMode ? '#f3f4f6' : '#1f2937',
        modalBg: isDarkMode ? '#1f2937' : 'white',
        modalOverlay: isDarkMode ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.6)'
    };

    useEffect(() => {
        // Connect Socket
        socketRef.current = io('http://localhost:5001');

        socketRef.current.on('connect', () => {
            console.log('Connected to socket for activity logs');
        });

        socketRef.current.on('activity_log', (newLog) => {
            setActivityLogs(prevLogs => [newLog, ...prevLogs]);
            triggerLiveUpdate();
        });

        // --- Note Listeners ---
        socketRef.current.on('note:created', (newTask) => {
            // Append new task to list (newest first)
            setTasks(prev => [newTask, ...prev]);
            triggerLiveUpdate();
        });

        socketRef.current.on('note:deleted', (deletedId) => {
            setTasks(prev => prev.filter(task => task._id !== deletedId));
            triggerLiveUpdate();
        });



        socketRef.current.on('notes:cleared', () => {
            setTasks([]);
            triggerLiveUpdate();
        });

        // Load initial logs
        loadActivityLogs();

        return () => {
            if (socketRef.current) socketRef.current.disconnect();
        };
    }, []);

    const loadActivityLogs = async () => {
        try {
            const data = await ActivityService.getActivities();
            setActivityLogs(data);
        } catch (error) {
            console.error('Error loading activity logs:', error);
        }
    };

    // --- Activity Log Management ---
    const handleClearLogs = async () => {
        const confirmed = await showAlert({
            title: 'Clear Activity Logs',
            message: 'Are you sure you want to permanently clear all activity logs? This action cannot be undone.',
            type: 'error',
            confirmLabel: 'Clear Logs',
            cancelLabel: 'Cancel'
        });

        if (confirmed) {
            try {
                await ActivityService.clearActivities();
                setActivityLogs([]);
                toast.success('Activity logs cleared');
            } catch (error) {
                toast.error('Failed to clear logs');
            }
        }
    };

    useEffect(() => {
        if (activeTab === 'ranges') {
            loadRanges();
        } else if (activeTab === 'notes') {
            loadTasks();
        }
    }, [activeTab]);



    const loadRanges = async () => {
        setIsLoading(true);
        try {
            const data = await RangeService.getRanges();
            setRanges(data);
        } catch (error) {
            console.error('Error loading ranges:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadTasks = async () => {
        setIsLoading(true);
        try {
            const data = await TaskService.getAllTasks();
            setTasks(data);
        } catch (error) {
            console.error('Error loading tasks:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = async () => {
        const confirmed = await showAlert({
            title: 'Sign Out',
            message: 'Are you sure you want to sign out?',
            type: 'info',
            confirmLabel: 'Sign Out',
            cancelLabel: 'Cancel'
        });

        if (confirmed) {
            AuthService.logout();
            navigate('/login');
        }
    };

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    // --- Range Management ---
    const handleCreateRange = async (e) => {
        e.preventDefault();
        try {
            const createdRange = await RangeService.createRange(newRange);
            setShowCreateModal(false);
            setNewRange({ rangeName: '', username: '', password: '' });
            setRanges(prev => [createdRange, ...prev]);
            toast.success('Range created successfully');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error creating range');
        }
    };

    const handleEditClick = (range) => {
        setEditingRange(range);
        setEditRangeData({ rangeName: range.rangeName, username: range.username, password: '' });
        setShowEditModal(true);
    };

    const handleUpdateRange = async (e) => {
        e.preventDefault();
        try {
            const updated = await RangeService.updateRange(editingRange._id, editRangeData);
            setShowEditModal(false);
            setEditingRange(null);
            setRanges(prev => prev.map(r => r._id === updated._id ? updated : r));
            toast.success('Range updated successfully');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error updating range');
        }
    };

    const handleDeleteRange = async (rangeId) => {
        const confirmed = await showAlert({
            title: 'Delete Range',
            message: 'Are you sure you want to delete this range? This action cannot be undone and will prevent access for this user.',
            type: 'error',
            confirmLabel: 'Delete Range',
            cancelLabel: 'Cancel',
            isDangerous: true
        });

        if (confirmed) {
            try {
                const userStr = localStorage.getItem("user");
                const user = userStr ? JSON.parse(userStr) : null;
                const token = user?.token;

                if (!token) {
                    toast.error("Authentication token missing. Please log in again.");
                    return;
                }

                console.log("Deleting ID:", rangeId);

                await axios.delete(
                    `/api/ranges/${rangeId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                // Remove deleted range from UI
                setRanges(prev =>
                    prev.filter(range => range._id !== rangeId)
                );

                toast.success("Range deleted successfully");

            } catch (error) {
                console.error("Delete failed:", error.response?.data || error.message);
                toast.error("Failed to delete range");
            }
        }
    };

    const toggleRangeStatus = async (range) => {
        try {
            const updatedRange = await RangeService.updateRange(range._id, { isActive: !range.isActive });
            setRanges(prev => prev.map(r => r._id === updatedRange._id ? updatedRange : r));
            toast.success(`Range ${updatedRange.isActive ? 'enabled' : 'disabled'} successfully`);
        } catch (error) {
            console.error(error);
            toast.error('Failed to update status');
        }
    };

    // --- Note Management ---
    const handleDeleteTask = async (taskId) => {
        const confirmed = await showAlert({
            title: 'Delete Note',
            message: 'Are you sure you want to permanently delete this note?\nThis action cannot be undone.',
            type: 'error',
            confirmLabel: 'Delete Note',
            cancelLabel: 'Cancel'
        });

        if (confirmed) {
            try {
                await TaskService.deleteTask(taskId);
                loadTasks();
                toast.success('Note deleted');
                // Activity Log handled by backend usually, but if required explicitly:
                // await ActivityService.logActivity('Note deleted', taskId); 
            } catch (error) {
                toast.error('Failed to delete task');
            }
        }
    };

    const handleDeleteAllTasks = async () => {
        const confirmed = await showAlert({
            title: 'Delete All Notes',
            message: 'WARNING: This will permanently delete ALL notes from the database.\nThis action is irreversible and affects all users.',
            type: 'error',
            confirmLabel: 'Delete All Data',
            cancelLabel: 'Cancel',
            checkboxLabel: 'I understand that this action is irreversible'
        });

        if (confirmed) {
            try {
                await TaskService.deleteAllTasks();
                setTasks([]); // Optimistic clear
                toast.success('All notes deleted successfully');
                // Check if we need to manually log "Bulk delete — All notes" if backend doesn't
            } catch (error) {
                toast.error('Failed to delete all tasks');
            }
        }
    };



    // --- Filters & Stats ---
    const totalRanges = ranges.length;
    const activeRangesCount = ranges.filter(r => r.isActive).length;
    const idleRangesCount = totalRanges - activeRangesCount;

    const filteredTasks = tasks.filter(task => {
        const matchesFrom = filters.fromRange ? task.fromRangeId?.rangeName === filters.fromRange : true;
        const matchesTo = filters.toRange ? task.toRangeId?.rangeName === filters.toRange : true;
        const matchesDateStart = filters.dateStart ? new Date(task.createdAt) >= new Date(filters.dateStart) : true;
        const matchesDateEnd = filters.dateEnd ? new Date(task.createdAt) <= new Date(filters.dateEnd + 'T23:59:59') : true;
        return matchesFrom && matchesTo && matchesDateStart && matchesDateEnd;
    }).sort((a, b) => {
        if (filters.sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
        return new Date(a.createdAt) - new Date(b.createdAt);
    });

    const uniqueRangeNames = [...new Set(ranges.map(r => r.rangeName))];

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: theme.bg, color: theme.text, fontFamily: "'Inter', sans-serif", transition: 'background-color 0.3s, color 0.3s' }}>
            <ToastContainer position="top-right" autoClose={3000} theme={isDarkMode ? 'dark' : 'light'} />
            <Sidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                onLogout={handleLogout}
                isOpen={isSidebarOpen}
                toggleSidebar={toggleSidebar}
                isDarkMode={isDarkMode}
            />

            <main style={{
                flex: 1,
                marginLeft: isSidebarOpen ? '260px' : '80px',
                height: '100vh',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}>

                {/* Fixed Upper Area (Header + Stats) */}
                <div style={{ padding: '24px 32px 16px 32px', flexShrink: 0 }}>
                    {/* Header */}
                    <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                <img src="/assets/avp-logo.png" alt="AVP Logo" style={{ height: '36px', width: 'auto' }} />
                                <h1 style={{ fontSize: '30px', fontWeight: '800', lineHeight: '1.2', color: theme.text, margin: 0 }}>
                                    {activeTab === 'ranges' ? 'Range Management' : 'All Notes'}
                                </h1>
                            </div>
                            <p style={{ fontSize: '14px', color: theme.subText, margin: '4px 0 0 0', opacity: 0.8 }}>
                                You are viewing system-wide data across all ranges
                            </p>
                        </div>

                        <div style={{ display: 'flex', gap: '12px' }}>
                            {/* Activity Log Button */}
                            <button
                                onClick={() => setShowActivityModal(true)}
                                style={{
                                    background: theme.cardBg,
                                    border: `1px solid ${theme.border}`,
                                    padding: '8px 16px',
                                    borderRadius: '12px',
                                    display: 'flex', alignItems: 'center', gap: '8px',
                                    cursor: 'pointer',
                                    fontSize: '14px', fontWeight: '600',
                                    color: theme.text,
                                    boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <FileText size={18} /> Activity Logs
                            </button>

                            {/* Theme Toggle */}
                            <button
                                onClick={toggleTheme}
                                style={{
                                    background: theme.cardBg,
                                    border: `1px solid ${theme.border}`,
                                    width: '40px', height: '40px', borderRadius: '12px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    cursor: 'pointer',
                                    fontSize: '20px',
                                    boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                                    color: theme.text,
                                    transition: 'all 0.2s'
                                }}
                                title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                            >
                                {isDarkMode ? '☀️' : '🌙'}
                            </button>
                        </div>
                    </div>

                    {/* Stats Grid - Only show for Ranges tab to save space on Notes tab */}
                    {activeTab === 'ranges' && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
                            {isLoading ? (
                                <>
                                    <Skeleton height="120px" borderRadius="16px" />
                                    <Skeleton height="120px" borderRadius="16px" />
                                    <Skeleton height="120px" borderRadius="16px" />
                                    <Skeleton height="120px" borderRadius="16px" />
                                </>
                            ) : (
                                <>
                                    <div style={{ backgroundColor: theme.cardBg, padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: `1px solid ${theme.border}` }}>
                                        <div style={{ fontSize: '14px', color: theme.subText, marginBottom: '8px', fontWeight: '500' }}>Total Ranges</div>
                                        <div style={{ fontSize: '32px', fontWeight: '800', color: theme.text }}>{totalRanges}</div>
                                    </div>
                                    <div style={{ backgroundColor: theme.cardBg, padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: `1px solid ${theme.border}` }}>
                                        <div style={{ fontSize: '14px', color: theme.subText, marginBottom: '8px', fontWeight: '500' }}>Active Ranges</div>
                                        <div style={{ fontSize: '32px', fontWeight: '800', color: '#10b981' }}>{activeRangesCount}</div>
                                    </div>
                                    <div style={{ backgroundColor: theme.cardBg, padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: `1px solid ${theme.border}` }}>
                                        <div style={{ fontSize: '14px', color: theme.subText, marginBottom: '8px', fontWeight: '500' }}>Total Notes</div>
                                        <div style={{ fontSize: '32px', fontWeight: '800', color: '#6366f1' }}>{tasks.length}</div>
                                    </div>
                                    <div style={{ backgroundColor: theme.cardBg, padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: `1px solid ${theme.border}` }}>
                                        <div style={{ fontSize: '14px', color: theme.subText, marginBottom: '8px', fontWeight: '500' }}>System Status</div>
                                        <div style={{ marginTop: '4px', fontSize: '13px', color: theme.subText }}>
                                            <span style={{ color: '#10b981', fontWeight: '600' }}>{activeRangesCount} active</span> &bull; <span style={{ color: theme.subText }}>{idleRangesCount} idle</span>
                                        </div>
                                        <div style={{ fontSize: '16px', fontWeight: '600', color: '#10b981', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }}></span>
                                            Operational
                                        </div>
                                        <div style={{ marginTop: '6px', fontSize: '11px', color: theme.subText, opacity: 0.7 }}>
                                            {liveStatusText}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Content Area - Flex Grow for scrolling */}
                <div style={{ flex: 1, padding: '0 32px 24px 32px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

                    {isLoading && activeTab === 'ranges' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <Skeleton height="60px" borderRadius="12px" />
                            <Skeleton height="60px" borderRadius="12px" />
                            <Skeleton height="60px" borderRadius="12px" />
                            <Skeleton height="60px" borderRadius="12px" />
                            <Skeleton height="60px" borderRadius="12px" />
                        </div>
                    ) : activeTab === 'ranges' && (
                        <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '20px' }}>
                            {/* Actions */}
                            <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'flex-end' }}>
                                <button
                                    onClick={() => setShowCreateModal(true)}
                                    style={primaryButtonStyle}
                                >
                                    <span style={{ marginRight: '8px' }}>+</span> Create New Range
                                </button>
                            </div>

                            {/* Ranges List */}
                            <div style={{ backgroundColor: theme.cardBg, borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', border: `1px solid ${theme.border}`, overflow: 'hidden', transition: 'background-color 0.3s, border-color 0.3s' }}>
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                                        <thead>
                                            <tr style={{ backgroundColor: theme.tableHeader, transition: 'background-color 0.3s' }}>
                                                <th style={thStyle(theme)}>Range Identity</th>
                                                <th style={thStyle(theme)}>Credentials</th>
                                                <th style={thStyle(theme)}>Status</th>
                                                <th style={{ ...thStyle(theme), textAlign: 'right' }}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {isLoading ? (
                                                <tr><td colSpan="4" style={{ padding: '40px', textAlign: 'center', color: theme.subText }}>Loading...</td></tr>
                                            ) : ranges.map((range, index) => (
                                                <tr key={range._id} style={{ borderBottom: index === ranges.length - 1 ? 'none' : `1px solid ${theme.border}`, transition: 'border-color 0.3s' }}>
                                                    <td style={tdStyle}>
                                                        <div style={{ display: 'flex', items: 'center', gap: '12px' }}>
                                                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: isDarkMode ? '#312e81' : '#e0e7ff', color: isDarkMode ? '#c7d2fe' : '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 'bold' }}>
                                                                {range.rangeName.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <div style={{ fontWeight: '600', color: theme.text }}>{range.rangeName}</div>
                                                                <div style={{ fontSize: '12px', color: theme.subText }}>ID: {range._id.slice(-6)}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td style={tdStyle}>
                                                        <code style={{ backgroundColor: theme.hover, padding: '4px 8px', borderRadius: '4px', fontSize: '13px', color: theme.subText }}>{range.username}</code>
                                                    </td>
                                                    <td style={tdStyle}>
                                                        <StatusBadge isActive={range.isActive} isDarkMode={isDarkMode} />
                                                    </td>
                                                    <td style={{ ...tdStyle, textAlign: 'right' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                                            <button
                                                                onClick={() => toggleRangeStatus(range)}
                                                                style={{ ...actionButtonStyle, color: range.isActive ? (isDarkMode ? '#fbbf24' : '#d97706') : (isDarkMode ? '#34d399' : '#059669'), backgroundColor: range.isActive ? (isDarkMode ? 'rgba(245, 158, 11, 0.1)' : '#fef3c7') : (isDarkMode ? 'rgba(16, 185, 129, 0.1)' : '#d1fae5') }}
                                                                title={range.isActive ? "Disable Range" : "Enable Range"}
                                                            >
                                                                {range.isActive ? 'Disable' : 'Enable'}
                                                            </button>
                                                            <button
                                                                onClick={() => handleEditClick(range)}
                                                                style={{ ...actionButtonStyle, color: isDarkMode ? '#60a5fa' : '#2563eb', backgroundColor: isDarkMode ? 'rgba(37, 99, 235, 0.1)' : '#eff6ff' }}
                                                                title="Edit Range"
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteRange(range._id)}
                                                                style={{ ...actionButtonStyle, color: isDarkMode ? '#f87171' : '#dc2626', backgroundColor: isDarkMode ? 'rgba(220, 38, 38, 0.1)' : '#fee2e2' }}
                                                                title="Delete Range"
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {isLoading && activeTab === 'notes' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <Skeleton height="60px" borderRadius="12px" />
                            <Skeleton height="60px" borderRadius="12px" />
                            <Skeleton height="60px" borderRadius="12px" />
                            <Skeleton height="60px" borderRadius="12px" />
                            <Skeleton height="60px" borderRadius="12px" />
                        </div>
                    ) : activeTab === 'notes' && (
                        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
                            {/* Fixed Filter Toolbar Part */}
                            <div style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '16px', flexShrink: 0 }}>
                                {/* Total Notes Summary Card */}
                                <div style={{ backgroundColor: theme.cardBg, padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: `1px solid ${theme.border}`, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                    <div style={{ fontSize: '14px', color: theme.subText, marginBottom: '8px', fontWeight: '500' }}>Total Notes</div>
                                    <div style={{ fontSize: '32px', fontWeight: '800', color: '#6366f1' }}>{filteredTasks.length}</div>
                                </div>

                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', backgroundColor: theme.cardBg, padding: '16px', borderRadius: '16px', border: `1px solid ${theme.border}` }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '200px' }}>
                                        <Filter size={16} color={theme.subText} />
                                        <select
                                            value={filters.fromRange}
                                            onChange={(e) => setFilters({ ...filters, fromRange: e.target.value })}
                                            style={filterSelectStyle(theme)}
                                        >
                                            <option value="">From: All Ranges</option>
                                            {uniqueRangeNames.map(name => <option key={name} value={name}>{name}</option>)}
                                        </select>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '200px' }}>
                                        <select
                                            value={filters.toRange}
                                            onChange={(e) => setFilters({ ...filters, toRange: e.target.value })}
                                            style={filterSelectStyle(theme)}
                                        >
                                            <option value="">To: All Ranges</option>
                                            {uniqueRangeNames.map(name => <option key={name} value={name}>{name}</option>)}
                                        </select>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ fontSize: '13px', color: theme.subText, fontWeight: '500' }}>Date:</span>
                                        <input
                                            type="date"
                                            value={filters.dateStart}
                                            onChange={(e) => setFilters({ ...filters, dateStart: e.target.value })}
                                            style={filterInputStyle(theme)}
                                        />
                                        <span style={{ color: theme.subText }}>-</span>
                                        <input
                                            type="date"
                                            value={filters.dateEnd}
                                            onChange={(e) => setFilters({ ...filters, dateEnd: e.target.value })}
                                            style={filterInputStyle(theme)}
                                        />
                                    </div>
                                    <div style={{ width: '1px', height: '24px', backgroundColor: theme.border, margin: '0 8px' }}></div>
                                    <button
                                        onClick={() => setFilters({ ...filters, sortBy: filters.sortBy === 'newest' ? 'oldest' : 'newest' })}
                                        style={secondaryButtonStyle(theme)}
                                        title="Toggle Sort Order"
                                    >
                                        <ArrowUpDown size={16} style={{ marginRight: '6px' }} />
                                        {filters.sortBy === 'newest' ? 'Newest' : 'Oldest'}
                                    </button>
                                    <button
                                        onClick={() => setFilters({ fromRange: '', toRange: '', priority: 'All', dateStart: '', dateEnd: '', sortBy: 'newest' })}
                                        style={{ ...secondaryButtonStyle(theme), color: '#ef4444', borderColor: isDarkMode ? 'rgba(239,68,68,0.3)' : '#fee2e2' }}
                                    >
                                        Clear
                                    </button>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ fontSize: '14px', color: theme.subText }}>
                                        Showing <strong>{filteredTasks.length}</strong> tasks
                                    </div>
                                    <button
                                        onClick={handleDeleteAllTasks}
                                        style={{
                                            ...primaryButtonStyle,
                                            backgroundColor: '#dc2626',
                                            boxShadow: '0 4px 6px rgba(220, 38, 38, 0.2)'
                                        }}
                                    >
                                        <span style={{ marginRight: '8px' }}>🗑️</span> Delete ALL Data
                                    </button>
                                </div>
                            </div>

                            {/* Scrollable Table Area */}
                            <div style={{
                                backgroundColor: theme.cardBg,
                                borderRadius: '16px',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                                border: `1px solid ${theme.border}`,
                                maxHeight: 'calc(100vh - 420px)',
                                display: 'flex',
                                flexDirection: 'column',
                                overflow: 'hidden',
                                transition: 'background-color 0.3s, border-color 0.3s'
                            }}>
                                <div style={{ overflowY: 'auto', flex: 1 }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
                                        <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                                            <tr style={{ backgroundColor: theme.tableHeader }}>
                                                <th style={thStyle(theme)}>From</th>
                                                <th style={thStyle(theme)}>To</th>
                                                <th style={thStyle(theme)}>Message Snippet</th>
                                                <th style={thStyle(theme)}>Date</th>
                                                <th style={{ ...thStyle(theme), textAlign: 'right' }}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {isLoading ? (
                                                <tr><td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: theme.subText }}>Loading...</td></tr>
                                            ) : filteredTasks.length === 0 ? (
                                                <tr><td colSpan="6" style={{ padding: '60px', textAlign: 'center', color: theme.subText }}>No notes found matching filters.</td></tr>
                                            ) : filteredTasks.map((task, index) => (
                                                <tr key={task._id} style={{ borderBottom: index === filteredTasks.length - 1 ? 'none' : `1px solid ${theme.border}`, transition: 'border-color 0.3s' }}>
                                                    <td style={tdStyle}>
                                                        <span style={{ fontWeight: '600', color: theme.text }}>{task.fromRangeId?.rangeName || 'Deleted Range'}</span>
                                                    </td>
                                                    <td style={tdStyle}>
                                                        <span style={{ fontWeight: '600', color: theme.subText }}>{task.toRangeId?.rangeName || 'Deleted Range'}</span>
                                                    </td>
                                                    <td style={{ ...tdStyle, maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: theme.text }}>
                                                        {task.message}
                                                    </td>
                                                    <td style={{ ...tdStyle, color: theme.subText }}>
                                                        {new Date(task.createdAt).toLocaleDateString()} {new Date(task.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </td>
                                                    <td style={{ ...tdStyle, textAlign: 'right' }}>
                                                        <button
                                                            onClick={() => handleDeleteTask(task._id)}
                                                            style={{ ...actionButtonStyle, color: isDarkMode ? '#f87171' : '#dc2626', backgroundColor: isDarkMode ? 'rgba(220, 38, 38, 0.1)' : '#fee2e2' }}
                                                            title="Delete Note"
                                                        >
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                </div>

            </main>

            {/* Create Modal */}
            {showCreateModal && (
                <Modal onClose={() => setShowCreateModal(false)} title="Create New Range" theme={theme}>
                    <form onSubmit={handleCreateRange}>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={labelStyle(theme)}>Range Display Name</label>
                            <input type="text" value={newRange.rangeName} onChange={(e) => setNewRange({ ...newRange, rangeName: e.target.value })} style={inputStyle(theme)} placeholder="e.g. Engineering Team" required />
                        </div>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={labelStyle(theme)}>Username</label>
                            <input type="text" value={newRange.username} onChange={(e) => setNewRange({ ...newRange, username: e.target.value })} style={inputStyle(theme)} placeholder="e.g. range_eng" required />
                        </div>
                        <div style={{ marginBottom: '32px' }}>
                            <label style={labelStyle(theme)}>Password</label>
                            <input type="text" value={newRange.password} onChange={(e) => setNewRange({ ...newRange, password: e.target.value })} style={inputStyle(theme)} placeholder="Set a secure password" required />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <button type="button" onClick={() => setShowCreateModal(false)} style={secondaryButtonStyle(theme)}>Cancel</button>
                            <button type="submit" style={primaryButtonStyle}>Create Range</button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* Edit Modal */}
            {showEditModal && (
                <Modal onClose={() => setShowEditModal(false)} title="Edit Range" theme={theme}>
                    <form onSubmit={handleUpdateRange}>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={labelStyle(theme)}>Range Display Name</label>
                            <input type="text" value={editRangeData.rangeName} onChange={(e) => setEditRangeData({ ...editRangeData, rangeName: e.target.value })} style={inputStyle(theme)} required />
                        </div>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={labelStyle(theme)}>Username</label>
                            <input type="text" value={editRangeData.username} onChange={(e) => setEditRangeData({ ...editRangeData, username: e.target.value })} style={inputStyle(theme)} required />
                        </div>
                        <div style={{ marginBottom: '32px' }}>
                            <label style={labelStyle(theme)}>New Password (Optional)</label>
                            <input type="text" value={editRangeData.password} onChange={(e) => setEditRangeData({ ...editRangeData, password: e.target.value })} style={inputStyle(theme)} placeholder="Leave blank to keep current" />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <button type="button" onClick={() => setShowEditModal(false)} style={secondaryButtonStyle(theme)}>Cancel</button>
                            <button type="submit" style={primaryButtonStyle}>Update Range</button>
                        </div>
                    </form>
                </Modal>
            )}



            {/* Activity Logs Modal */}
            {showActivityModal && (
                <Modal onClose={() => setShowActivityModal(false)} title="System Activity Logs" theme={theme}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '400px', overflowY: 'auto' }}>
                        {activityLogs.map(log => (
                            <div key={log.id} style={{ display: 'flex', alignItems: 'start', gap: '12px', padding: '12px', backgroundColor: theme.hover, borderRadius: '12px', border: `1px solid ${theme.border}` }}>
                                <div style={{ backgroundColor: theme.cardBg, padding: '8px', borderRadius: '8px', color: theme.subText }}>
                                    <Activity size={16} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                        <span style={{ fontSize: '14px', fontWeight: '600', color: theme.text }}>{log.actionType}</span>
                                        <span style={{ fontSize: '12px', color: theme.subText }}>{new Date(log.timestamp).toLocaleString()}</span>
                                    </div>
                                    <div style={{ fontSize: '13px', color: theme.subText }}>
                                        <span style={{ color: theme.text, fontWeight: '500' }}>{log.performedBy}</span> — {log.target}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between' }}>
                        <button onClick={handleClearLogs} style={{ ...actionButtonStyle, color: theme.isDarkMode ? '#ef4444' : '#dc2626', backgroundColor: 'transparent', border: 'none', paddingLeft: 0, textDecoration: 'underline' }}>
                            Clear Logs
                        </button>
                        <button onClick={() => setShowActivityModal(false)} style={secondaryButtonStyle(theme)}>Close</button>
                    </div>
                </Modal>
            )}

        </div>
    );
};

// --- Sub Componets & Styles ---

const Modal = ({ onClose, title, children, theme }) => (
    <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: theme.modalOverlay, backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, animation: 'fadeIn 0.2s'
    }} onClick={onClose}>
        <div style={{
            backgroundColor: theme.modalBg, padding: '40px', borderRadius: '24px', width: '100%', maxWidth: '480px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', position: 'relative', border: `1px solid ${theme.border}`,
            color: theme.text
        }} onClick={e => e.stopPropagation()}>
            <div style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '800', color: theme.text, margin: '0 0 8px 0' }}>{title}</h2>
            </div>
            {children}
        </div>
    </div>
);

const StatCard = ({ title, value, icon, theme }) => (
    <div style={{ backgroundColor: theme.cardBg, padding: '24px', borderRadius: '16px', border: `1px solid ${theme.border}`, boxShadow: '0 2px 4px rgba(0,0,0,0.02)', transition: 'background-color 0.3s, border-color 0.3s' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <span style={{ fontSize: '14px', fontWeight: '600', color: theme.subText, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</span>
            <span style={{ fontSize: '24px' }}>{icon}</span>
        </div>
        <div style={{ fontSize: '36px', fontWeight: '800', color: theme.text }}>{value}</div>
    </div>
);

const StatusBadge = ({ isActive, isDarkMode }) => (
    <span style={{
        padding: '6px 12px', borderRadius: '9999px', fontSize: '13px', fontWeight: '700',
        display: 'inline-flex', alignItems: 'center', gap: '6px',
        backgroundColor: isActive ? (isDarkMode ? 'rgba(6, 95, 70, 0.3)' : '#d1fae5') : (isDarkMode ? 'rgba(153, 27, 27, 0.3)' : '#fee2e2'),
        color: isActive ? (isDarkMode ? '#34d399' : '#065f46') : (isDarkMode ? '#f87171' : '#991b1b'),
    }}>
        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'currentColor' }}></span>
        {isActive ? 'Active' : 'Disabled'}
    </span>
);

const thStyle = (theme) => ({ textAlign: 'left', padding: '16px 32px', fontSize: '12px', fontWeight: '600', color: theme.subText, textTransform: 'uppercase', letterSpacing: '0.05em' });
const tdStyle = { padding: '20px 32px', verticalAlign: 'middle' };
const labelStyle = (theme) => ({ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: theme.subText });
const inputStyle = (theme) => ({ width: '100%', padding: '12px 16px', borderRadius: '12px', border: `1px solid ${theme.inputBorder}`, fontSize: '15px', backgroundColor: theme.inputBg, color: theme.inputText, outline: 'none' });
const filterSelectStyle = (theme) => ({ padding: '8px 12px', borderRadius: '8px', border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.inputText, fontSize: '13px', outline: 'none', cursor: 'pointer', flex: 1 });
const filterInputStyle = (theme) => ({ padding: '8px 12px', borderRadius: '8px', border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.inputText, fontSize: '13px', outline: 'none' });

const primaryButtonStyle = {
    padding: '12px 24px', backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '12px',
    fontSize: '15px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.2)',
    display: 'flex', alignItems: 'center'
};
const secondaryButtonStyle = (theme) => ({ padding: '12px', backgroundColor: theme.cardBg, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: '12px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' });
const actionButtonStyle = { padding: '6px 12px', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'filter 0.2s' };

export default AdminDashboard;
