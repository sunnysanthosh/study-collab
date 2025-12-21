'use client';

import { useState } from 'react';

interface Notification {
    id: string;
    title: string;
    message: string;
    time: string;
    read: boolean;
    type: 'info' | 'success' | 'warning' | 'error';
}

export function NotificationCenter() {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications] = useState<Notification[]>([
        {
            id: '1',
            title: 'New Message',
            message: 'Alice sent you a message in Calculus I',
            time: '5m ago',
            read: false,
            type: 'info'
        },
        {
            id: '2',
            title: 'Topic Updated',
            message: 'Physics: Mechanics topic has new problems',
            time: '1h ago',
            read: false,
            type: 'success'
        },
        {
            id: '3',
            title: 'Study Reminder',
            message: 'You have a study session starting in 30 minutes',
            time: '2h ago',
            read: true,
            type: 'warning'
        },
    ]);

    const unreadCount = notifications.filter(n => !n.read).length;

    const typeColors = {
        info: 'hsl(var(--primary))',
        success: 'hsl(var(--success))',
        warning: 'hsl(var(--warning))',
        error: 'hsl(var(--destructive))',
    };

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
                                    style={{
                                        fontSize: '0.85rem',
                                        color: 'hsl(var(--primary))',
                                        background: 'transparent',
                                        border: 'none',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Mark all as read
                                </button>
                            )}
                        </div>

                        {notifications.length === 0 ? (
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
                                            border: `1px solid ${notification.read ? 'transparent' : typeColors[notification.type] + '40'}`,
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
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
                                                background: typeColors[notification.type],
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
                                                    <span style={{
                                                        fontSize: '0.75rem',
                                                        color: 'hsl(var(--muted-foreground))',
                                                        whiteSpace: 'nowrap',
                                                        marginLeft: '0.5rem'
                                                    }}>
                                                        {notification.time}
                                                    </span>
                                                </div>
                                                <p style={{
                                                    fontSize: '0.85rem',
                                                    color: 'hsl(var(--muted-foreground))',
                                                    margin: 0,
                                                    lineHeight: '1.4'
                                                }}>
                                                    {notification.message}
                                                </p>
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

