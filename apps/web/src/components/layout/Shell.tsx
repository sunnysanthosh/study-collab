import { Navbar } from './Navbar';

export function Shell({ children }: { children: React.ReactNode }) {
    return (
        <div style={{ minHeight: '100vh', position: 'relative', paddingTop: '80px' }}>
            <Navbar />
            <main className="container" style={{ padding: '2rem 1.5rem' }}>
                {children}
            </main>
        </div>
    );
}
