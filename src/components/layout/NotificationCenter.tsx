'use client';

import { useState, useEffect } from 'react';
import { notificationApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface Notification {
    id: string;
    title: string;
    message: string | null;
    link: string | null;
    type: 'message' | 'topic_invite' | 'reaction' | 'system';
    read: boolean;
    created_at: string;
}

export function NotificationCenter() {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        if (user) {
            loadNotifications();
            loadUnreadCount();
            
            // Refresh every 30 seconds
            const interval = setInterval(() => {
                loadNotifications();
                loadUnreadCount();
            }, 30000);
            
            return () => clearInterval(interval);
        }
    }, [user]);

    const loadNotifications = async () => {
        try {
            setLoading(true);
            const response = await notificationApi.getNotifications(50, 0);
            if (response.data?.notifications) {
                setNotifications(response.data.notifications);
            }
        } catch (error) {
            console.error('Failed to load notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadUnreadCount = async () => {
        try {
            const response = await notificationApi.getUnreadCount();
            if (response.data?.count !== undefined) {
                setUnreadCount(response.data.count);
            }
        } catch (error) {
            console.error('Failed to load unread count:', error);
        }
    };

    const handleMarkAsRead = async (notificationId: string) => {
        try {
            await notificationApi.markAsRead(notificationId);
            setNotifications((prev) =>
                prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
            );
            setUnreadCount((prev) => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await notificationApi.markAllAsRead();
            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    const handleDelete = async (notificationId: string) => {
        try {
            await notificationApi.deleteNotification(notificationId);
            setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
            // Update unread count if notification was unread
            const notification = notifications.find((n) => n.id === notificationId);
            if (notification && !notification.read) {
                setUnreadCount((prev) => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error('Failed to delete notification:', error);
        }
    };

    const formatTime = (timeString: string) => {
        try {
            const date = new Date(timeString);
            const now = new Date();
            const diff = now.getTime() - date.getTime();
            const minutes = Math.floor(diff / 60000);
            
            if (minutes < 1) return 'Just now';
            if (minutes < 60) return `${minutes}m ago`;
            const hours = Math.floor(minutes / 60);
            if (hours < 24) return `${hours}h ago`;
            const days = Math.floor(hours / 24);
            if (days < 7) return `${days}d ago`;
            return date.toLocaleDateString();
        } catch {
            return timeString;
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'message':
                return 'hsl(var(--primary))';
            case 'topic_invite':
                return 'hsl(var(--success))';
            case 'reaction':
                return 'hsl(var(--warning))';
            case 'system':
                return 'hsl(var(--muted-foreground))';
            default:
                return 'hsl(var(--primary))';
        }
    };

    if (!user) return null;

    return (
        <div style={{ position: 'relative' }}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    position: 'relative',
                    background: 'transparent',
                    border: 'none',
                    color: 'hsl(var(--foreground))',
                    fontSize: '1.5rem',
                    cursor: 'pointer',
                    padding: '0.5rem',
                    borderRadius: 'var(--radius-md)',
                    transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'hsl(var(--muted))'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
                🔔
                {unreadCount > 0 && (
                    <span style={{
                        position: 'absolute',
                        top: '0',
                        right: '0',
                        background: 'hsl(var(--destructive))',
                        color: 'white',
                        fontSize: '0.7rem',
                        fontWeight: 'bold',
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px solid hsl(var(--background))'
                    }}>
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <>
                    <div
                        style={{
                            position: 'fixed',
                            inset: 0,
                            zIndex: 40
                        }}
                        onClick={() => setIsOpen(false)}
                    />
                    <div
                        className="glass-panel animate-fadeIn"
                        style={{
                            position: 'absolute',
                            top: 'calc(100% + 1rem)',
                            right: 0,
                            width: '380px',
                            maxHeight: '500px',
                            overflowY: 'auto',
                            zIndex: 50,
                            padding: '1rem',
                            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)'
                        }}
                    >
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '1rem',
                            paddingBottom: '1rem',
                            borderBottom: '1px solid var(--glass-border)'
                        }}>
                            <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Notifications</h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllAsRead}
                                    style={{
                                        fontSize: '0.85rem',
                                        color: 'hsl(var(--primary))',
                                        background: 'transparent',
                                        border: 'none',
                                        cursor: 'pointer',
                                        padding: '0.25rem 0.5rem',
                                        borderRadius: 'var(--radius-sm)',
                                        transition: 'background 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'hsl(var(--muted))'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                    Mark all as read
                                </button>
                            )}
                        </div>

                        {loading ? (
                            <div style={{ textAlign: 'center', padding: '2rem', color: 'hsl(var(--muted-foreground))' }}>
                                Loading...
                            </div>
                        ) : notifications.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '2rem', color: 'hsl(var(--muted-foreground))' }}>
                                No notifications
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        style={{
                                            padding: '1rem',
                                            background: notification.read ? 'transparent' : 'hsl(var(--primary) / 0.05)',
                                            borderRadius: 'var(--radius-md)',
                                            border: `1px solid ${notification.read ? 'transparent' : getTypeColor(notification.type) + '40'}`,
                                            cursor: notification.link ? 'pointer' : 'default',
                                            transition: 'all 0.2s'
                                        }}
                                        onClick={() => {
                                            if (notification.link) {
                                                window.location.href = notification.link;
                                            }
                                            if (!notification.read) {
                                                handleMarkAsRead(notification.id);
                                            }
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = 'hsl(var(--muted) / 0.3)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = notification.read ? 'transparent' : 'hsl(var(--primary) / 0.05)';
                                        }}
                                    >
                                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                                            <div style={{
                                                width: '8px',
                                                height: '8px',
                                                borderRadius: '50%',
                                                background: getTypeColor(notification.type),
                                                marginTop: '0.5rem',
                                                flexShrink: 0,
                                                opacity: notification.read ? 0.5 : 1
                                            }} />
                                            <div style={{ flex: 1 }}>
                                                <div style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'start',
                                                    marginBottom: '0.25rem'
                                                }}>
                                                    <h4 style={{
                                                        fontSize: '0.95rem',
                                                        fontWeight: notification.read ? 400 : 600,
                                                        margin: 0
                                                    }}>
                                                        {notification.title}
                                                    </h4>
                                                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                        <span style={{
                                                            fontSize: '0.75rem',
                                                            color: 'hsl(var(--muted-foreground))',
                                                            whiteSpace: 'nowrap',
                                                            marginLeft: '0.5rem'
                                                        }}>
                                                            {formatTime(notification.created_at)}
                                                        </span>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDelete(notification.id);
                                                            }}
                                                            style={{
                                                                background: 'transparent',
                                                                border: 'none',
                                                                color: 'hsl(var(--muted-foreground))',
                                                                cursor: 'pointer',
                                                                fontSize: '0.8rem',
                                                                padding: '0.25rem',
                                                                borderRadius: 'var(--radius-sm)',
                                                                transition: 'color 0.2s'
                                                            }}
                                                            onMouseEnter={(e) => e.currentTarget.style.color = 'hsl(var(--destructive))'}
                                                            onMouseLeave={(e) => e.currentTarget.style.color = 'hsl(var(--muted-foreground))'}
                                                        >
                                                            ×
                                                        </button>
                                                    </div>
                                                </div>
                                                {notification.message && (
                                                    <p style={{
                                                        fontSize: '0.85rem',
                                                        color: 'hsl(var(--muted-foreground))',
                                                        margin: 0,
                                                        lineHeight: '1.4'
                                                    }}>
                                                        {notification.message}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
