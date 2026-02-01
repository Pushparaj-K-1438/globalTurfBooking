"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { Bell, X, Check, Calendar, ShoppingBag, User, AlertCircle, CheckCircle, Info, Trash2 } from "lucide-react";

// Notification Context
const NotificationContext = createContext(null);

export function useNotifications() {
    return useContext(NotificationContext);
}

export function NotificationProvider({ children }) {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        // Fetch notifications on mount
        fetchNotifications();

        // Poll for new notifications every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await fetch("/api/admin/notifications");
            if (res.ok) {
                const data = await res.json();
                setNotifications(data.notifications || []);
                setUnreadCount(data.unreadCount || 0);
            }
        } catch (error) {
            console.error("Failed to fetch notifications");
        }
    };

    const markAsRead = async (id) => {
        try {
            await fetch(`/api/admin/notifications/${id}`, { method: "PATCH" });
            setNotifications(notifications.map(n =>
                n._id === id ? { ...n, isRead: true } : n
            ));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error("Failed to mark as read");
        }
    };

    const markAllAsRead = async () => {
        try {
            await fetch("/api/admin/notifications/read-all", { method: "POST" });
            setNotifications(notifications.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error("Failed to mark all as read");
        }
    };

    const deleteNotification = async (id) => {
        try {
            await fetch(`/api/admin/notifications/${id}`, { method: "DELETE" });
            setNotifications(notifications.filter(n => n._id !== id));
        } catch (error) {
            console.error("Failed to delete notification");
        }
    };

    const addNotification = (notification) => {
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);
    };

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount,
            fetchNotifications,
            markAsRead,
            markAllAsRead,
            deleteNotification,
            addNotification
        }}>
            {children}
        </NotificationContext.Provider>
    );
}

// Notification Bell Component
export function NotificationBell() {
    const [isOpen, setIsOpen] = useState(false);
    const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications() || {
        notifications: [],
        unreadCount: 0,
        markAsRead: () => { },
        markAllAsRead: () => { },
        deleteNotification: () => { }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'booking': return Calendar;
            case 'order': return ShoppingBag;
            case 'user': return User;
            case 'error': return AlertCircle;
            case 'success': return CheckCircle;
            default: return Info;
        }
    };

    const getIconColor = (type) => {
        switch (type) {
            case 'booking': return 'bg-blue-100 text-blue-600';
            case 'order': return 'bg-purple-100 text-purple-600';
            case 'user': return 'bg-emerald-100 text-emerald-600';
            case 'error': return 'bg-red-100 text-red-600';
            case 'success': return 'bg-green-100 text-green-600';
            default: return 'bg-slate-100 text-slate-600';
        }
    };

    const formatTime = (date) => {
        const now = new Date();
        const diff = now - new Date(date);
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return `${days}d ago`;
    };

    // Demo notifications if none exist
    const displayNotifications = notifications.length > 0 ? notifications : [
        { _id: '1', type: 'booking', title: 'New Booking', message: 'John Doe booked Turf A for tomorrow', createdAt: new Date(Date.now() - 300000), isRead: false },
        { _id: '2', type: 'order', title: 'New Order', message: 'Sarah placed an order for ₹2,500', createdAt: new Date(Date.now() - 3600000), isRead: false },
        { _id: '3', type: 'success', title: 'Payment Received', message: 'Payment of ₹1,800 confirmed', createdAt: new Date(Date.now() - 7200000), isRead: true },
        { _id: '4', type: 'user', title: 'New Customer', message: 'Mike registered on the platform', createdAt: new Date(Date.now() - 86400000), isRead: true },
    ];

    const displayUnreadCount = unreadCount > 0 ? unreadCount : displayNotifications.filter(n => !n.isRead).length;

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
                <Bell size={22} className="text-slate-600" />
                {displayUnreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {displayUnreadCount > 9 ? '9+' : displayUnreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
                    <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden">
                        {/* Header */}
                        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="font-bold text-slate-900">Notifications</h3>
                            {displayUnreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                                >
                                    Mark all read
                                </button>
                            )}
                        </div>

                        {/* Notifications List */}
                        <div className="max-h-[400px] overflow-y-auto">
                            {displayNotifications.length === 0 ? (
                                <div className="p-8 text-center text-slate-400">
                                    <Bell size={32} className="mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">No notifications</p>
                                </div>
                            ) : (
                                displayNotifications.map((notification) => {
                                    const Icon = getIcon(notification.type);
                                    return (
                                        <div
                                            key={notification._id}
                                            onClick={() => markAsRead(notification._id)}
                                            className={`p-4 border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors ${!notification.isRead ? 'bg-emerald-50/50' : ''
                                                }`}
                                        >
                                            <div className="flex gap-3">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${getIconColor(notification.type)}`}>
                                                    <Icon size={18} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <p className="font-semibold text-slate-900 text-sm">{notification.title}</p>
                                                        {!notification.isRead && (
                                                            <span className="w-2 h-2 bg-emerald-500 rounded-full flex-shrink-0 mt-1.5"></span>
                                                        )}
                                                    </div>
                                                    <p className="text-slate-500 text-sm truncate">{notification.message}</p>
                                                    <p className="text-xs text-slate-400 mt-1">{formatTime(notification.createdAt)}</p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-3 border-t border-slate-100">
                            <button className="w-full py-2 text-sm font-medium text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors">
                                View All Notifications
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default NotificationBell;
