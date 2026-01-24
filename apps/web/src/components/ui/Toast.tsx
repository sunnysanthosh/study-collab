'use client';

import { useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
    message: string;
    type: ToastType;
    onClose: () => void;
    duration?: number;
}

export function Toast({ message, type, onClose, duration = 3000 }: ToastProps) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const typeStyles: Record<ToastType, { bg: string; border: string; icon: string }> = {
        success: {
            bg: 'hsl(var(--success) / 0.1)',
            border: 'hsl(var(--success))',
            icon: '✅'
        },
        error: {
            bg: 'hsl(var(--destructive) / 0.1)',
            border: 'hsl(var(--destructive))',
            icon: '❌'
        },
        info: {
            bg: 'hsl(var(--primary) / 0.1)',
            border: 'hsl(var(--primary))',
            icon: 'ℹ️'
        },
        warning: {
            bg: 'hsl(var(--warning) / 0.1)',
            border: 'hsl(var(--warning))',
            icon: '⚠️'
        },
    };

    const style = typeStyles[type];

    return (
        <div
            className="animate-slideIn"
            style={{
                position: 'fixed',
                bottom: '2rem',
                right: '2rem',
                padding: '1rem 1.5rem',
                background: style.bg,
                border: `2px solid ${style.border}`,
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                zIndex: 9999,
                maxWidth: '400px',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
                animation: 'fadeIn 0.3s ease-out'
            }}
        >
            <span style={{ fontSize: '1.2rem' }}>{style.icon}</span>
            <span style={{ flex: 1, fontSize: '0.95rem', fontWeight: 500 }}>{message}</span>
            <button
                onClick={onClose}
                style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'hsl(var(--foreground))',
                    cursor: 'pointer',
                    fontSize: '1.2rem',
                    padding: '0.25rem',
                    opacity: 0.7,
                    transition: 'opacity 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
            >
                ×
            </button>
        </div>
    );
}

