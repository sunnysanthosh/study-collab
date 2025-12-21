export function ChatInterface() {
    return (
        <div className="glass-panel" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '1rem', borderBottom: '1px solid var(--glass-border)' }}>
                <h3 style={{ fontSize: '1rem', margin: 0 }}>Live Chat</h3>
            </div>

            <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {/* Mock Messages */}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'hsl(var(--primary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold' }}>A</div>
                    <div>
                        <div style={{ fontSize: '0.8rem', color: 'hsl(var(--muted-foreground))' }}>Alice • 2m ago</div>
                        <div style={{ background: 'hsl(var(--muted))', padding: '0.5rem', borderRadius: '0 8px 8px 8px', fontSize: '0.9rem' }}>
                            Has anyone solved problem 3?
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'row-reverse' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'hsl(var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold', color: 'black' }}>B</div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.8rem', color: 'hsl(var(--muted-foreground))' }}>You • Just now</div>
                        <div style={{ background: 'hsl(var(--primary))', color: 'white', padding: '0.5rem', borderRadius: '8px 0 8px 8px', fontSize: '0.9rem' }}>
                            I think you need to use the chain rule there.
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ padding: '1rem', borderTop: '1px solid var(--glass-border)' }}>
                <input
                    type="text"
                    placeholder="Type a message..."
                    style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--input)',
                        background: 'rgba(255,255,255,0.05)',
                        color: 'inherit',
                        outline: 'none'
                    }}
                />
            </div>
        </div>
    );
}
