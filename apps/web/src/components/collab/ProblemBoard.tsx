'use client';

import { Button } from '@/components/ui/Button';
import { useState } from 'react';

type Tool = 'draw' | 'text' | 'image';

export function ProblemBoard() {
    const [activeTool, setActiveTool] = useState<Tool | null>(null);

    const tools: { type: Tool; icon: string; label: string }[] = [
        { type: 'draw', icon: '✏️', label: 'Draw' },
        { type: 'text', icon: '📝', label: 'Text' },
        { type: 'image', icon: '📷', label: 'Image' },
    ];

    return (
        <div className="glass-panel" style={{ height: '100%', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '1.5rem',
                flexWrap: 'wrap',
                gap: '1rem'
            }}>
                <div>
                    <h2 style={{ fontSize: '1.5rem', margin: 0, marginBottom: '0.25rem' }}>Problem #3: Derivatives</h2>
                    <p style={{ fontSize: '0.85rem', color: 'hsl(var(--muted-foreground))', margin: 0 }}>
                        Find the derivative of f(x) = x² + 3x - 5
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {tools.map(tool => (
                        <Button
                            key={tool.type}
                            variant={activeTool === tool.type ? 'primary' : 'ghost'}
                            onClick={() => setActiveTool(activeTool === tool.type ? null : tool.type)}
                            style={{ 
                                padding: '0.5rem 1rem',
                                fontSize: '0.85rem'
                            }}
                        >
                            <span style={{ marginRight: '0.5rem' }}>{tool.icon}</span>
                            {tool.label}
                        </Button>
                    ))}
                </div>
            </div>

            <div style={{
                flex: 1,
                background: 'rgba(0,0,0,0.2)',
                borderRadius: 'var(--radius-md)',
                border: '2px dashed hsl(var(--muted-foreground) / 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'hsl(var(--muted-foreground))',
                minHeight: 0,
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{ textAlign: 'center', padding: '2rem', zIndex: 1 }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}>📐</div>
                    <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem', fontWeight: 500 }}>
                        Interactive Whiteboard Area
                    </p>
                    <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>
                        {activeTool 
                            ? `${tools.find(t => t.type === activeTool)?.label} tool selected` 
                            : 'Select a tool to start working'
                        }
                    </p>
                    {activeTool === 'text' && (
                        <div style={{ 
                            marginTop: '2rem',
                            padding: '1rem',
                            background: 'rgba(255,255,255,0.05)',
                            borderRadius: 'var(--radius-md)',
                            maxWidth: '400px',
                            margin: '2rem auto 0'
                        }}>
                            <textarea
                                placeholder="Type your solution here..."
                                style={{
                                    width: '100%',
                                    minHeight: '150px',
                                    padding: '1rem',
                                    background: 'transparent',
                                    border: '1px solid hsl(var(--input))',
                                    borderRadius: 'var(--radius-md)',
                                    color: 'hsl(var(--foreground))',
                                    fontSize: '1rem',
                                    fontFamily: 'monospace',
                                    resize: 'vertical',
                                    outline: 'none'
                                }}
                            />
                        </div>
                    )}
                </div>
                
                {/* Background pattern */}
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: 'radial-gradient(circle, hsl(var(--muted-foreground) / 0.1) 1px, transparent 1px)',
                    backgroundSize: '20px 20px',
                    pointerEvents: 'none'
                }} />
            </div>
        </div>
    );
}
