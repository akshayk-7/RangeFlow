import React, { useState, useEffect, useContext } from 'react';
import styled from 'styled-components';
import { X, Clock, Activity, LogIn, LogOut, Send, Inbox, Check } from 'lucide-react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import SocketContext from '../context/SocketContext';
import Skeleton from './Skeleton';

const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify_content: center;
    align_items: center;
    z-index: 1000;
    backdrop-filter: blur(4px);
    animation: fadeIn 0.2s ease-out;

    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
`;

const ModalContent = styled.div`
    background-color: var(--bg-card);
    border-radius: 16px;
    width: 90%;
    max-width: 500px;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
    box-shadow: var(--shadow-xl);
    border: 1px solid var(--border-color);
    animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);

    @keyframes slideUp {
        from { transform: translateY(20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
    }
`;

const Header = styled.div`
    padding: 20px 24px;
    border-bottom: 1px solid var(--border-color);
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const Title = styled.h2`
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: var(--text-primary);
    display: flex;
    align-items: center;
    gap: 10px;
`;

const CloseButton = styled.button`
    background: none;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    padding: 4px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;

    &:hover {
        background-color: var(--bg-hover);
        color: var(--text-primary);
    }
`;

const ActivityList = styled.div`
    flex: 1;
    overflow-y: auto;
    padding: 20px 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;

    &::-webkit-scrollbar {
        width: 6px;
    }
    &::-webkit-scrollbar-track {
        background: transparent;
    }
    &::-webkit-scrollbar-thumb {
        background-color: var(--border-color);
        border-radius: 10px;
    }
`;

const ActivityItem = styled.div`
    display: flex;
    gap: 16px;
    align-items: flex-start;
    animation: fadeInItem 0.3s ease-out; /* Simple entry animation */

    @keyframes fadeInItem {
        from { opacity: 0; transform: translateY(5px); }
        to { opacity: 1; transform: translateY(0); }
    }
`;

const IconWrapper = styled.div`
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background-color: ${props => props.bgColor || 'var(--bg-hover)'};
    color: ${props => props.color || 'var(--text-secondary)'};
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
`;

const Content = styled.div`
    flex: 1;
`;

const ActionText = styled.p`
    margin: 0 0 4px 0;
    font-size: 14px;
    font-weight: 500;
    color: var(--text-primary);
`;

const DetailText = styled.p`
    margin: 0 0 4px 0;
    font-size: 13px;
    color: var(--text-secondary);
`;

const TimeText = styled.span`
    font-size: 11px;
    color: var(--text-muted);
    display: flex;
    align-items: center;
    gap: 4px;
`;

const EmptyState = styled.div`
    padding: 40px;
    text-align: center;
    color: var(--text-muted);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
`;

const ActivityModal = ({ onClose }) => {
    const { user } = useContext(AuthContext);
    const { socket } = useContext(SocketContext);
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchActivity = async () => {
        try {
            // Updated Endpoint
            const res = await axios.get(`http://localhost:5001/api/ranges/${user._id}/activity`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setActivities(res.data);
        } catch (error) {
            console.error('Error fetching activity:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchActivity();
        }
    }, [user]);

    // Real-time updates
    useEffect(() => {
        if (!socket) return;

        const handleReceiveTask = (newTask) => {
            // Mock an activity log since the backend log isn't broadcasted to everyone globally for security reasons usually
            // But wait, the prompt says "Real-time updates via existing socket events"
            // So we construct a client-side temporary log item to append immediately
            const newLog = {
                _id: 'temp_' + Date.now(),
                actionType: 'Note Received',
                target: user.rangeName, // It was sent TO me
                performedBy: newTask.fromRangeId.rangeName, // FROM sender
                timestamp: new Date()
            };
            setActivities(prev => [newLog, ...prev]);
        };

        // Listen for read receipts (Sent by me, read by them)
        const handleReadReceipt = ({ taskId }) => {
            // This event comes to me when SOMEONE reads my note
            // I don't have the "performedBy" name easily in the payload unless I query or store it.
            // But 'task_read_receipt' payload in 'socket.js' is just { taskId }.
            // However, `markTaskRead` emits it to `fromRangeId` (me).
            // It doesn't send the reader's name.
            // But I verified `taskController.js` emits: io.to(...).emit('task_read_receipt', { taskId: task._id });
            // The backend log is created though.

            // To show it in UI immediately, I might just say "A note was read".
            // Or, better, re-fetch? Re-fetching is safer and ensures data consistency including names.
            fetchActivity();
        };

        const handleNoteCreated = (task) => {
            // If I sent a note from another tab/device?
            // Dashboard `sendTask` sends to API. API emits `note:created` (globally? no, verifying).
            // taskController: io.emit('note:created', savedTask); -> This is global broadcast! This might be noisy/insecure if not scoped.
            // But checking taskController lines 27: io.emit('note:created', savedTask); 
            // Yes, it emits to everyone on 'note:created'?

            // If I am the sender:
            if (task.fromRangeId === user._id || (typeof task.fromRangeId === 'object' && task.fromRangeId._id === user._id)) {
                const newLog = {
                    _id: 'temp_' + Date.now(),
                    actionType: 'Note Sent',
                    target: task.toRangeId.rangeName || 'Recipient', // Potentially unpopulated if just ID
                    performedBy: user.rangeName,
                    timestamp: new Date()
                };
                // If names are missing, maybe re-fetch is better.
                fetchActivity();
            }
        };

        socket.on('receive_task', handleReceiveTask);
        socket.on('task_read_receipt', handleReadReceipt);
        // Socket.io doesn't default listen to own emits unless configured, but 'note:created' is broadcast.
        // Assuming we rely on receive_task and read_receipt primarily. 
        // For "Note Sent", the Dashboard calls sendTask. We can trigger refresh from parent, but socket is better.
        // Let's rely on fetchActivity() for complex ones to be safe.

        return () => {
            socket.off('receive_task', handleReceiveTask);
            socket.off('task_read_receipt', handleReadReceipt);
        };
    }, [socket, user]);


    const getIcon = (action) => {
        switch (action) {
            case 'Login Success': return { icon: <LogIn size={18} />, color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' };
            case 'Logout': return { icon: <LogOut size={18} />, color: '#6b7280', bg: 'rgba(107, 114, 128, 0.1)' };
            case 'Note Sent': return { icon: <Send size={18} />, color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' };
            case 'Note Received': return { icon: <Inbox size={18} />, color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)' };
            case 'Note Read': return { icon: <Check size={18} />, color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' };
            default: return { icon: <Activity size={18} />, color: '#6b7280', bg: 'var(--bg-hover)' };
        }
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' · ' + date.toLocaleDateString();
    };

    return (
        <ModalOverlay onClick={onClose}>
            <ModalContent onClick={e => e.stopPropagation()}>
                <Header>
                    <Title><Activity size={20} /> Range Activity</Title>
                    <CloseButton onClick={onClose}><X size={20} /></CloseButton>
                </Header>

                <ActivityList>
                    {loading ? (
                        <>
                            <Skeleton height="50px" borderRadius="8px" />
                            <Skeleton height="50px" borderRadius="8px" />
                            <Skeleton height="50px" borderRadius="8px" />
                        </>
                    ) : activities.length > 0 ? (
                        activities.map(log => {
                            const style = getIcon(log.actionType);
                            // Determine relevant text based on action
                            let detail = '';
                            if (log.actionType === 'Note Sent') detail = `To: ${log.target}`;
                            else if (log.actionType === 'Note Received') detail = `From: ${log.performedBy}`;
                            else if (log.actionType === 'Note Read') detail = `Task ID: ${log.target.replace('Note ID ', '')}`; // or just 'Read by recipient'
                            else detail = log.target; // Fallback

                            return (
                                <ActivityItem key={log._id}>
                                    <IconWrapper color={style.color} bgColor={style.bg}>
                                        {style.icon}
                                    </IconWrapper>
                                    <Content>
                                        <ActionText>{log.actionType}</ActionText>
                                        <DetailText>{detail}</DetailText>
                                        <TimeText><Clock size={10} /> {formatTime(log.timestamp)}</TimeText>
                                    </Content>
                                </ActivityItem>
                            );
                        })
                    ) : (
                        <EmptyState>
                            <Activity size={40} style={{ opacity: 0.3 }} />
                            <p>No recent activity</p>
                        </EmptyState>
                    )}
                </ActivityList>
            </ModalContent>
        </ModalOverlay>
    );
};

export default ActivityModal;
