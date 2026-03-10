import NotificationItem from '../components/notifications/NotificationItem';
import { useState, useEffect } from 'react';
import api from '../services/api';
import { useSocket } from '../context/SocketContext';
import { toast } from 'react-hot-toast';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const { socket } = useSocket();

    const fetchNotifications = async () => {
        try {
            const response = await api.get('/notifications');
            setNotifications(response.data.data.notifications);
        } catch (error) {
            console.error('Failed to load notifications', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    useEffect(() => {
        if (!socket) return;

        socket.on('new_notification', (data) => {
            setNotifications(prev => [data.notification, ...prev]);
            toast.success('New notification');
        });

        return () => {
            socket.off('new_notification');
        };
    }, [socket]);

    const markAllAsRead = async () => {
        try {
            await api.put('/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            toast.success('All marked as read');
        } catch (error) {
            toast.error('Failed to mark as read');
        }
    };

    const handleMarkAsRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n.id === id || n._id === id ? ({ ...n, isRead: true }) : n));
        } catch (error) {
            console.error('Failed to mark read', error);
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-4 px-2">
                <h1 className="text-xl font-bold text-gray-200">Notifications</h1>
                <button
                    onClick={markAllAsRead}
                    className="text-xs text-secondary hover:underline font-bold"
                >
                    Mark all as read
                </button>
            </div>

            <div className="bg-dark-800 rounded-lg border border-dark-600 overflow-hidden">
                {loading ? (
                    <div className="p-4 text-center text-gray-500">Loading...</div>
                ) : notifications.length > 0 ? (
                    notifications.map(notification => (
                        <div key={notification._id || notification.id} onClick={() => handleMarkAsRead(notification._id || notification.id)}>
                            <NotificationItem notification={notification} />
                        </div>
                    ))
                ) : (
                    <div className="p-8 text-center text-gray-500">No notifications yet.</div>
                )}
            </div>
        </div>
    );
};

export default Notifications;
