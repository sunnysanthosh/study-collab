import Link from 'next/link';

export function Navbar() {
    return (
        <nav className="glass-panel" style={{
            position: 'fixed',
            top: '1rem',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'calc(100% - 2rem)',
            maxWidth: '1280px',
            zIndex: 50,
            padding: '1rem 2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        }}>
            <Link href="/" style={{ textDecoration: 'none' }}>
                <h2 style={{
                    fontSize: '1.5rem',
                    background: 'linear-gradient(to right, hsl(var(--primary)), hsl(var(--secondary)))',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    margin: 0
                }}>
                    StudyCollab
                </h2>
            </Link>

            <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                <Link href="/topics" className="btn-ghost" style={{ textDecoration: 'none', fontWeight: 500 }}>Topics</Link>
                <Link href="/about" className="btn-ghost" style={{ textDecoration: 'none', fontWeight: 500 }}>About</Link>
                <Link href="/login" className="btn btn-primary" style={{ textDecoration: 'none', fontSize: '0.9rem', padding: '0.5rem 1.2rem' }}>
                    Login
                </Link>
            </div>
        </nav>
    );
}
