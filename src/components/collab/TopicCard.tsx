'use client';

import Link from 'next/link';

interface TopicCardProps {
    id: string;
    title: string;
    description: string;
    activeUsers?: number;
    tags: string[];
    isFavorite?: boolean;
    onToggleFavorite?: (id: string) => void;
}

export function TopicCard({ id, title, description, activeUsers = 0, tags, isFavorite, onToggleFavorite }: TopicCardProps) {
    return (
        <div 
            className="glass-panel" 
            style={{ 
                padding: '1.5rem', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '1rem',
                height: '100%',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.3)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <h3 style={{ fontSize: '1.25rem', margin: 0, lineHeight: '1.3' }}>{title}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {onToggleFavorite && (
                        <button
                            onClick={() => onToggleFavorite(id)}
                            aria-label={isFavorite ? 'Remove favorite' : 'Add favorite'}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '1rem',
                                color: isFavorite ? 'hsl(var(--warning))' : 'hsl(var(--muted-foreground))'
                            }}
                        >
                            {isFavorite ? '★' : '☆'}
                        </button>
                    )}
                    <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.25rem',
                        fontSize: '0.8rem', 
                        color: 'hsl(var(--success))', 
                        background: 'hsl(var(--success) / 0.1)', 
                        padding: '0.25rem 0.75rem', 
                        borderRadius: 'var(--radius-full)',
                        whiteSpace: 'nowrap'
                    }}>
                        <span style={{ 
                            width: '6px', 
                            height: '6px', 
                            background: 'hsl(var(--success))', 
                            borderRadius: '50%',
                            display: 'inline-block',
                            animation: 'pulse 2s ease-in-out infinite'
                        }} />
                        {activeUsers} active
                    </div>
                </div>
            </div>
            <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.9rem', flex: 1, lineHeight: '1.5' }}>
                {description}
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                {tags.map(tag => (
                    <span 
                        key={tag} 
                        style={{ 
                            fontSize: '0.75rem', 
                            background: 'hsl(var(--secondary) / 0.1)', 
                            color: 'hsl(var(--secondary))', 
                            padding: '0.25rem 0.75rem', 
                            borderRadius: 'var(--radius-full)',
                            fontWeight: 500
                        }}
                    >
                        #{tag}
                    </span>
                ))}
            </div>
            <Link 
                href={`/topics/${id}`} 
                className="btn btn-primary" 
                style={{ 
                    marginTop: 'auto',
                    textDecoration: 'none', 
                    textAlign: 'center',
                    width: '100%'
                }}
            >
                Join Room
            </Link>
        </div>
    );
}
