export function ProblemBoard() {
    return (
        <div className="glass-panel" style={{ height: '100%', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Problem #3: Derivatives</h2>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-ghost" style={{ padding: '0.5rem' }}>✏️ Draw</button>
                    <button className="btn btn-ghost" style={{ padding: '0.5rem' }}>📝 Text</button>
                    <button className="btn btn-ghost" style={{ padding: '0.5rem' }}>📷 Image</button>
                </div>
            </div>

            <div style={{
                flex: 1,
                background: 'rgba(0,0,0,0.2)',
                borderRadius: 'var(--radius-md)',
                border: '1px dashed var(--muted-foreground)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'hsl(var(--muted-foreground))'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <p>Interactive Whiteboard Area</p>
                    <p style={{ fontSize: '0.8rem' }}>(Real-time canvas would go here)</p>
                </div>
            </div>
        </div>
    );
}
