import { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import RangeService from '../services/rangeService';
import TaskService from '../services/taskService';
import AuthService from '../services/authService';
import AuthContext from '../context/AuthContext';
import SocketContext from '../context/SocketContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Inbox, Send, Bell, Users, PenLine, Check, Clock, Sun, Moon, LogOut, Hash, Search, Filter, ArrowUpDown, Activity } from 'lucide-react';
import CustomSelect from '../components/CustomSelect';
import Skeleton from '../components/Skeleton';
import ActivityModal from '../components/ActivityModal';  // Import
import { socket } from '../socket'; // Import singleton socket

import { useAlert } from '../context/AlertContext'; // Import useAlert

const TaskDashboard = () => {
    const { user } = useContext(AuthContext);
    // const { socket } = useContext(SocketContext); // Removed context usage
    const navigate = useNavigate();
    const searchInputRef = useRef(null);

    const [stats, setStats] = useState({ received: 0, sent: 0, unread: 0, colleagues: 0 });
    const [ranges, setRanges] = useState([]);
    const [receivedTasks, setReceivedTasks] = useState([]);
    const [sentTasks, setSentTasks] = useState([]);
    const [activeTab, setActiveTab] = useState('received');
    const [loading, setLoading] = useState(true);
    const [showActivityModal, setShowActivityModal] = useState(false); // Modal State
    const [msgData, setMsgData] = useState({
        toRangeId: '',
        kgid: '',
        priority: 'Medium',
        message: ''
    });

    // Search & Filter State
    const [searchQuery, setSearchQuery] = useState('');
    const [filterPriority, setFilterPriority] = useState('All');
    const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'oldest'

    // Real-time Status State
    const [liveStatus, setLiveStatus] = useState('Live');

    // Sign Out Modal State - Removed

    // Permission Modal State


    const { showAlert } = useAlert(); // Destructure showAlert

    // Theme Logic
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
    const isDarkMode = theme === 'dark';

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Ignore if user is typing in an input
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) return;

            if (e.key === '/') {
                e.preventDefault();
                searchInputRef.current?.focus();
            } else if (e.key.toLowerCase() === 'r') {
                setActiveTab('received');
            } else if (e.key.toLowerCase() === 's') {
                setActiveTab('sent');
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Auto-calculate stats whenever tasks or ranges change
    useEffect(() => {
        setStats({
            received: receivedTasks.length,
            sent: sentTasks.length,
            unread: receivedTasks.filter(t => !t.isRead).length,
            colleagues: ranges.length
        });
    }, [receivedTasks, sentTasks, ranges]);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    const registerServiceWorker = async () => {
        try {
            if ('serviceWorker' in navigator) {
                const reg = await navigator.serviceWorker.getRegistration();
                if (!reg) {
                    const register = await navigator.serviceWorker.register('/sw.js');
                    await navigator.serviceWorker.ready;
                    await subscribeUser(register);
                } else {
                    await subscribeUser(reg);
                }
            }
        } catch (err) {
            console.error('Service Worker Registry Error:', err);
        }
    };

    const subscribeUser = async (register) => {
        try {
            const subscription = await register.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array('BGIg1TGyvolVM3U5uET_CS7Te9KDeon2UUOKL6JEWafPZO08-TWq3uBML4cKmygKjt8Nx4OVfK6ZXZc1KclsJM8')
            });

            await AuthService.subscribeToPush(subscription);
        } catch (err) {
            console.error('Push Subscription Error:', err);
        }
    };

    const urlBase64ToUint8Array = (base64String) => {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/\-/g, '+')
            .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    };

    const loadInitialData = async () => {
        try {
            const [rangesData, tasksData, sentTasksData] = await Promise.all([
                RangeService.getRanges(),
                // TaskService.getStats(), // Removed: stats calculated locally
                TaskService.getReceivedTasks(),
                TaskService.getSentTasks()
            ]);

            if (rangesData) {
                // Filter out self from ranges list
                const otherRanges = rangesData.filter(r => r._id !== user?._id);
                setRanges(otherRanges);
            }

            setReceivedTasks(tasksData || []);
            setSentTasks(sentTasksData || []);
        } catch (error) {
            console.error("Error loading dashboard data:", error);
            const serverMsg = error.response?.data?.message || error.message;
            toast.error("Failed to load dashboard data: " + serverMsg);
        } finally {
            setLoading(false);
        }
    };

    const loadTasks = async () => {
        try {
            const data = await TaskService.getReceivedTasks();
            setReceivedTasks(data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        loadInitialData();
    }, []);

    useEffect(() => {
        const initNotifications = async () => {
            // 1. Session Guard
            if (sessionStorage.getItem('notification_permission_checked')) {
                return;
            }

            if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
                return;
            }

            // Set guard immediately to allow only one execution per session
            sessionStorage.setItem('notification_permission_checked', 'true');

            try {
                let permission = Notification.permission;

                if (permission === 'default') {
                    // Request Permission
                    permission = await Notification.requestPermission();
                }

                if (permission === 'granted') {
                    await registerServiceWorker();
                    toast.dismiss(); // Clean up any existing toasts
                    toast.success('Notifications are enabled');
                } else if (permission === 'denied') {
                    toast.dismiss();
                    toast.info('Notifications are turned off. Enable them from browser settings.');
                }
            } catch (error) {
                console.error('Notification permission error:', error);
            }
        };

        initNotifications();
    }, []);

    useEffect(() => {
        if (user?._id) {
            socket.emit("join_room", user._id);
        }
    }, [user]);

    useEffect(() => {
        const handleNewNote = (newTask) => {
            console.log("Real-time note received:", newTask);
            toast.info(`New note from ${newTask.fromRangeId.rangeName}`);
            setReceivedTasks(prev => [newTask, ...prev]);
            setLiveStatus('Updated just now');
            setTimeout(() => setLiveStatus('Live'), 4000);
        };

        const handleReadReceipt = ({ taskId }) => {
            console.log('Task read:', taskId);
            setLiveStatus('Updated just now');
            setTimeout(() => setLiveStatus('Live'), 4000);
        };

        socket.on('new_note', handleNewNote);
        socket.on('task_read_receipt', handleReadReceipt);

        return () => {
            socket.off('new_note', handleNewNote);
            socket.off('task_read_receipt', handleReadReceipt);
        };
    }, []);



    // const loadStats = async () => { ... } // Removed: using client-side calculation

    const handleMarkRead = async (taskId) => {
        try {
            await TaskService.markAsRead(taskId);
            // Optimistic update
            setReceivedTasks(prev => prev.map(t =>
                t._id === taskId ? { ...t, isRead: true } : t
            ));
            // loadStats(); // Removed: unread count auto-updates via useEffect
        } catch (error) {
            console.error(error);
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        try {
            const savedTask = await TaskService.sendTask({
                ...msgData,
                title: 'New Note'
            });



            toast.success('Note sent successfully!');
            setMsgData({ toRangeId: '', kgid: '', priority: 'Medium', message: '' });
            // loadStats(); // Removed: stats auto-calc
            // Optimistically update sent notes
            setSentTasks(prev => [savedTask, ...prev]);
        } catch (error) {
            console.error(error);
            toast.error('Failed to send note');
        }
    };

    const handleLogout = () => {
        AuthService.logout();
        navigate('/login');
    };

    const handleLogoutClick = async () => {
        const confirmed = await showAlert({
            title: 'Sign Out',
            message: 'Are you sure you want to sign out?',
            type: 'info',
            confirmLabel: 'Sign Out',
            cancelLabel: 'Cancel'
        });

        if (confirmed) {
            handleLogout();
        }
    };

    // Filter Logic
    const getFilteredTasks = () => {
        const sourceList = activeTab === 'received' ? receivedTasks : sentTasks;

        return sourceList.filter(task => {
            const matchSearch = (
                (task.message && task.message.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (task.kgid && task.kgid.includes(searchQuery)) ||
                (task.fromRangeId?.rangeName && task.fromRangeId.rangeName.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (task.toRangeId?.rangeName && task.toRangeId.rangeName.toLowerCase().includes(searchQuery.toLowerCase()))
            );
            const matchPriority = filterPriority === 'All' || task.priority === filterPriority;
            return matchSearch && matchPriority;
        }).sort((a, b) => {
            return sortBy === 'newest'
                ? new Date(b.createdAt) - new Date(a.createdAt)
                : new Date(a.createdAt) - new Date(b.createdAt);
        });
    };

    const filteredTasks = getFilteredTasks();

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>
            <ToastContainer position="top-right" autoClose={3000} />

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                        <img src="/assets/avp-logo.png" alt="AVP Logo" style={{ height: '32px', width: 'auto' }} />
                        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
                            Dashboard <span style={{ opacity: 0.4, fontWeight: '400' }}>—</span> {user?.rangeName}
                        </h1>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                            fontSize: '12px',
                            fontWeight: '600',
                            backgroundColor: 'var(--bg-hover)',
                            color: 'var(--text-secondary)',
                            padding: '2px 8px',
                            borderRadius: '6px',
                            border: '1px solid var(--border-color)'
                        }}>
                            Range Scope: {user?.rangeName}
                        </span>
                        <button
                            onClick={() => setShowActivityModal(true)}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--brand-primary)',
                                fontSize: '12px',
                                fontWeight: '500',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                            }}>
                            View Activity <Activity size={12} />
                        </button>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ textAlign: 'right' }}>
                        <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>Welcome back,</p>
                        <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>{user?.rangeName}</p>
                    </div>
                    <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--border-color)' }}></div>

                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        style={{
                            padding: '8px',
                            backgroundColor: 'transparent',
                            color: 'var(--text-secondary)',
                            border: '1px solid transparent',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s',
                            height: '36px',
                            width: '36px',
                            padding: 0
                        }}
                        title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                        onMouseEnter={(e) => { e.target.style.backgroundColor = 'var(--bg-hover)'; }}
                        onMouseLeave={(e) => { e.target.style.backgroundColor = 'transparent'; }}
                    >
                        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                    </button>

                    <button
                        onClick={handleLogoutClick}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: 'transparent',
                            color: 'var(--text-secondary)',
                            border: '1px solid var(--border-color)',
                            // borderRadius handled by CSS
                            // cursor handled by CSS
                            fontWeight: '600', // Match CSS
                            fontSize: '13px',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.backgroundColor = 'var(--bg-hover)';
                            e.target.style.color = 'var(--text-primary)';
                            e.target.style.borderColor = 'var(--text-muted)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.backgroundColor = 'transparent';
                            e.target.style.color = 'var(--text-secondary)';
                            e.target.style.borderColor = 'var(--border-color)';
                        }}
                    >
                        Sign Out
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                {loading ? (
                    <>
                        <Skeleton height="100px" borderRadius="16px" />
                        <Skeleton height="100px" borderRadius="16px" />
                        <Skeleton height="100px" borderRadius="16px" />
                        <Skeleton height="100px" borderRadius="16px" />
                    </>
                ) : (
                    <>
                        <StatCard label="Received Notes" value={stats.received} color="var(--brand-primary)" icon={<Inbox size={24} />} />
                        <StatCard label="Sent Notes" value={stats.sent} color="var(--success)" icon={<Send size={24} />} />
                        <StatCard label="Unread Notes" value={stats.unread} color="var(--warning)" icon={<Bell size={24} />} />
                        <StatCard label="Colleagues" value={stats.colleagues} color="var(--brand-primary)" icon={<Users size={24} />} />
                    </>
                )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>

                {/* Send New Note Form - Left Column */}
                <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '16px', boxShadow: 'var(--shadow-sm)', padding: '24px', border: '1px solid var(--border-color)', height: 'fit-content' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                        <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: 'var(--brand-light)', color: 'var(--brand-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <PenLine size={18} />
                        </div>
                        <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>Send New Note</h2>
                    </div>

                    {loading ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <Skeleton height="38px" width="100%" borderRadius="6px" />
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <Skeleton height="38px" borderRadius="6px" />
                                <Skeleton height="38px" borderRadius="6px" />
                            </div>
                            <Skeleton height="80px" borderRadius="6px" />
                            <Skeleton height="40px" borderRadius="8px" />
                        </div>
                    ) : (
                        <form onSubmit={handleSend}>
                            <div style={{ marginBottom: '12px' }}>
                                <CustomSelect
                                    label="Select Recipient"
                                    required={true}
                                    value={msgData.toRangeId}
                                    onChange={(value) => setMsgData({ ...msgData, toRangeId: value })}
                                    options={ranges.map(range => ({
                                        value: range._id,
                                        label: `${range.rangeName} (${range.username})`
                                    }))}
                                    placeholder="Choose a user..."
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                                <div>
                                    <label style={labelStyle}>KGID Number *</label>
                                    <div className="input-wrapper">
                                        <div className="input-icon">
                                            <Hash size={16} />
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="KGID Number"
                                            value={msgData.kgid}
                                            onChange={(e) => setMsgData({ ...msgData, kgid: e.target.value })}
                                            className="custom-input has-icon"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <CustomSelect
                                        label="Priority"
                                        value={msgData.priority}
                                        onChange={(value) => setMsgData({ ...msgData, priority: value })}
                                        options={[
                                            { value: 'Low', label: 'Low' },
                                            { value: 'Medium', label: 'Medium' },
                                            { value: 'High', label: 'High' }
                                        ]}
                                        placeholder="Select Priority"
                                    />
                                </div>
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <label style={labelStyle}>Message *</label>
                                <textarea
                                    rows="3"
                                    placeholder="Enter the Additional information like PAN Number Or Any Other message..."
                                    value={msgData.message}
                                    onChange={(e) => setMsgData({ ...msgData, message: e.target.value })}
                                    className="custom-input"
                                    style={{ resize: 'vertical', minHeight: '80px' }}
                                    required
                                />
                            </div>

                            <button type="submit" style={buttonStyle}>Send Note</button>
                        </form>
                    )}
                </div>

                {/* Notes Section - Right Column */}
                <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '12px', boxShadow: 'var(--shadow-md)', padding: '24px', border: '1px solid var(--border-color)' }}>

                    {/* Tabs */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '0' }}>
                        <div style={{ display: 'flex', gap: '20px' }}>
                            <button
                                onClick={() => setActiveTab('received')}
                                style={{
                                    padding: '12px 4px',
                                    background: 'none',
                                    border: 'none',
                                    borderBottom: activeTab === 'received' ? '2px solid var(--brand-primary)' : '2px solid transparent',
                                    color: activeTab === 'received' ? 'var(--brand-primary)' : 'var(--text-muted)',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    fontSize: '15px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    marginBottom: '-1px'
                                }}
                            >
                                <Inbox size={18} /> Received
                            </button>
                            <button
                                onClick={() => setActiveTab('sent')}
                                style={{
                                    padding: '12px 4px',
                                    background: 'none',
                                    border: 'none',
                                    borderBottom: activeTab === 'sent' ? '2px solid var(--brand-primary)' : '2px solid transparent',
                                    color: activeTab === 'sent' ? 'var(--brand-primary)' : 'var(--text-muted)',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    fontSize: '15px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    marginBottom: '-1px'
                                }}
                            >
                                <Send size={18} /> Sent
                            </button>
                        </div>

                        {/* Soft Real-Time Indicator */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                backgroundColor: liveStatus === 'Live' ? 'var(--success)' : 'var(--brand-primary)',
                                transition: 'background-color 0.3s ease'
                            }}></span>
                            <span style={{
                                fontSize: '13px',
                                fontWeight: '500',
                                color: liveStatus === 'Live' ? 'var(--text-muted)' : 'var(--brand-primary)',
                                transition: 'color 0.3s ease'
                            }}>
                                {liveStatus}
                            </span>
                        </div>
                    </div>

                    {/* Search & Filter Bar */}
                    <div className="toolbar-container">
                        <div className="search-wrapper">
                            <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                ref={searchInputRef}
                                type="text"
                                className="search-input"
                                placeholder="Search notes..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                            <button
                                className="filter-btn"
                                onClick={() => setSortBy(prev => prev === 'newest' ? 'oldest' : 'newest')}
                                title="Sort Order"
                            >
                                <ArrowUpDown size={14} /> {sortBy === 'newest' ? 'Newest' : 'Oldest'}
                            </button>

                            <div style={{ position: 'relative' }}>
                                <select
                                    className="filter-btn"
                                    value={filterPriority}
                                    onChange={(e) => setFilterPriority(e.target.value)}
                                    style={{ paddingRight: '24px', appearance: 'none', minWidth: '100px' }}
                                >
                                    <option value="All">All Priority</option>
                                    <option value="High">High</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Low">Low</option>
                                </select>
                                <Filter size={14} style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted)' }} />
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: 'calc(100vh - 380px)', minHeight: '300px', overflowY: 'auto', paddingRight: '4px' }}>

                        {loading && (
                            <>
                                <Skeleton height="120px" borderRadius="10px" />
                                <Skeleton height="120px" borderRadius="10px" />
                                <Skeleton height="120px" borderRadius="10px" />
                            </>
                        )}

                        {!loading && filteredTasks.length === 0 && (
                            <EmptyState type={activeTab} isFiltered={searchQuery || filterPriority !== 'All'} />
                        )}

                        {!loading && filteredTasks.length > 0 && filteredTasks.map(task => (
                            <div key={task._id} className="note-card" style={taskCardStyle(activeTab === 'sent' ? true : task.isRead, task.priority, isDarkMode)}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        {activeTab === 'received' && !task.isRead && <span className="unread-dot"></span>}
                                        <span style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '14px' }}>
                                            {activeTab === 'received' ? `From: ${task.fromRangeId?.rangeName}` : `To: ${task.toRangeId?.rangeName}`}
                                        </span>
                                    </div>
                                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                        {new Date(task.createdAt).toLocaleDateString()}
                                    </span>
                                </div>

                                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                                    KGID: <span style={{ fontWeight: '500', color: 'var(--text-primary)' }}>{task.kgid}</span>
                                </div>

                                <p style={{ margin: '0 0 10px 0', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', fontSize: '13px', lineHeight: '1.4' }}>{task.message}</p>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={badgeStyle(task.priority)}>
                                        {task.priority} Priority
                                    </span>

                                    {activeTab === 'received' ? (
                                        !task.isRead ? (
                                            <button
                                                onClick={() => handleMarkRead(task._id)}
                                                className="action-link"
                                                style={{ background: 'none', border: 'none', padding: 0 }}
                                            >
                                                Mark Read
                                            </button>
                                        ) : (
                                            <span style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }} title="Read">
                                                <Check size={14} /> Read
                                            </span>
                                        )
                                    ) : (
                                        <span style={{ fontSize: '12px', color: task.isRead ? 'var(--success)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            {task.isRead ? <><Check size={12} /> Read</> : <><Clock size={12} /> Unread</>}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>



            {/* Notification Permission Modal */}

            {/* Activity Modal */}
            {showActivityModal && <ActivityModal onClose={() => setShowActivityModal(false)} />}


        </div>
    );
};

const getPriorityColor = (priority) => {
    switch (priority) {
        case 'High': return 'var(--text-primary)';
        case 'Medium': return 'var(--warning)';
        case 'Low': return 'var(--success)';
        default: return 'var(--text-muted)';
    }
};

const buttonStyle = {
    width: '100%',
    backgroundColor: 'var(--brand-primary)',
    color: 'white',
    border: 'none',
    fontSize: '14px',
    fontWeight: '600',
    boxShadow: 'var(--shadow-sm)'
};

const EmptyState = ({ type = 'received', isFiltered = false }) => (
    <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 20px',
        color: 'var(--text-muted)',
        borderRadius: '8px',
        opacity: 0.8
    }}>
        {type === 'received' ? (
            <Inbox size={40} style={{ marginBottom: '16px', opacity: 0.4 }} />
        ) : (
            <Send size={40} style={{ marginBottom: '16px', opacity: 0.4 }} />
        )}
        <p style={{ margin: 0, fontSize: '15px', fontWeight: '500' }}>
            {isFiltered
                ? 'No notes match your search or filter'
                : (type === 'received' ? 'No notes to display' : 'No sent notes yet')
            }
        </p>
    </div>
);

const badgeStyle = (priority) => ({
    fontSize: '10px',
    padding: '2px 8px',
    borderRadius: '12px',
    backgroundColor: getPriorityBg(priority),
    color: getPriorityColor(priority) === 'var(--text-primary)' ? '#ef4444' : getPriorityColor(priority),
    textTransform: 'uppercase',
    fontWeight: '600',
    border: `1px solid ${getPriorityColor(priority) === 'var(--text-primary)' ? '#ef4444' : getPriorityColor(priority)}20`
});

const taskCardStyle = (isRead, priority, isDarkMode) => ({
    padding: '16px',
    borderRadius: '10px',
    border: '1px solid var(--border-color)',
    borderLeft: `3px solid ${getPriorityColor(priority) === 'var(--text-primary)' ? '#ef4444' : getPriorityColor(priority)}`,
    backgroundColor: isRead
        ? 'var(--bg-card)'
        : (isDarkMode ? 'rgba(79, 70, 229, 0.1)' : '#EFF6FF'), // Tint for unread (Light Blue)
    transition: 'all 0.2s',
    marginBottom: '8px'
});

const getPriorityBg = (priority) => {
    switch (priority) {
        case 'High': return 'var(--bg-priority-high)';
        case 'Medium': return 'var(--bg-priority-medium)';
        case 'Low': return 'var(--bg-priority-low)';
        default: return 'var(--bg-priority-default)';
    }
};

const StatCard = ({ label, value, color, icon }) => (
    <div className="interactive-card" style={{
        backgroundColor: 'var(--bg-card)',
        borderRadius: '16px',
        padding: '24px',
        border: '1px solid var(--border-color)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: 'var(--shadow-sm)'
    }}>
        <div>
            <div style={{ fontSize: '14px', marginBottom: '4px', color: 'var(--text-secondary)', fontWeight: '500' }}>{label}</div>
            <div style={{ fontSize: '32px', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-1px' }}>{value}</div>
        </div>
        <div style={{
            fontSize: '24px',
            backgroundColor: 'var(--bg-hover)',
            color: color,
            padding: '12px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            {icon}
        </div>
    </div>
);

const labelStyle = {
    display: 'block',
    marginBottom: '4px',
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--text-secondary)'
};

export default TaskDashboard;
