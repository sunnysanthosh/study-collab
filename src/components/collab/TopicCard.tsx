import Link from 'next/link';

interface TopicCardProps {
    id: string;
    title: string;
    description: string;
    activeUsers: number;
    tags: string[];
}

export function TopicCard({ id, title, description, activeUsers, tags }: TopicCardProps) {
    return (
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', transition: 'transform 0.2s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <h3 style={{ fontSize: '1.25rem', margin: 0 }}>{title}</h3>
                <span style={{ fontSize: '0.8rem', color: 'hsl(var(--success))', background: 'hsl(var(--success) / 0.1)', padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-full)' }}>
                    {activeUsers} active
                </span>
            </div>
            <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.9rem', flex: 1 }}>
                {description}
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {tags.map(tag => (
                    <span key={tag} style={{ fontSize: '0.75rem', background: 'hsl(var(--secondary) / 0.1)', color: 'hsl(var(--secondary))', padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-sm)' }}>
                        #{tag}
                    </span>
                ))}
            </div>
            <Link href={`/topics/${id}`} className="btn btn-primary" style={{ marginTop: '0.5rem', textDecoration: 'none', textAlign: 'center' }}>
                Join Room
            </Link>
        </div>
    );
}
