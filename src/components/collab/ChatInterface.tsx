'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';

interface Message {
    id: string;
    user: string;
    avatar: string;
    text: string;
    time: string;
    isOwn: boolean;
}

export function ChatInterface() {
    const [messages] = useState<Message[]>([
        { id: '1', user: 'Alice', avatar: 'A', text: 'Has anyone solved problem 3?', time: '2m ago', isOwn: false },
        { id: '2', user: 'You', avatar: 'B', text: 'I think you need to use the chain rule there.', time: 'Just now', isOwn: true },
        { id: '3', user: 'Charlie', avatar: 'C', text: 'Great point! That makes sense.', time: '1m ago', isOwn: false },
    ]);
    
    const [inputValue, setInputValue] = useState('');

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputValue.trim()) {
            // TODO: Send message via WebSocket or API
            console.log('Sending message:', inputValue);
            setInputValue('');
        }
    };

    return (
        <div className="glass-panel" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ 
                padding: '1rem 1.5rem', 
                borderBottom: '1px solid var(--glass-border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div>
                    <h3 style={{ fontSize: '1.1rem', margin: 0, marginBottom: '0.25rem' }}>Live Chat</h3>
                    <span style={{ fontSize: '0.8rem', color: 'hsl(var(--muted-foreground))' }}>
                        {messages.length} {messages.length === 1 ? 'message' : 'messages'}
                    </span>
                </div>
                <div style={{ 
                    width: '8px', 
                    height: '8px', 
                    background: 'hsl(var(--success))', 
                    borderRadius: '50%',
                    animation: 'pulse 2s ease-in-out infinite'
                }} />
            </div>

            <div style={{ 
                flex: 1, 
                padding: '1rem', 
                overflowY: 'auto', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '1rem',
                minHeight: 0
            }}>
                {messages.map((message) => (
                    <div 
                        key={message.id}
                        style={{ 
                            display: 'flex', 
                            gap: '0.75rem',
                            flexDirection: message.isOwn ? 'row-reverse' : 'row',
                            animation: 'fadeIn 0.2s ease-out'
                        }}
                    >
                        <div style={{ 
                            width: '36px', 
                            height: '36px', 
                            borderRadius: '50%', 
                            background: message.isOwn ? 'hsl(var(--primary))' : 'hsl(var(--secondary))', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            fontSize: '0.9rem', 
                            fontWeight: 'bold',
                            color: message.isOwn ? 'white' : 'black',
                            flexShrink: 0
                        }}>
                            {message.avatar}
                        </div>
                        <div style={{ 
                            flex: 1,
                            maxWidth: 'calc(100% - 50px)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: message.isOwn ? 'flex-end' : 'flex-start'
                        }}>
                            <div style={{ 
                                fontSize: '0.8rem', 
                                color: 'hsl(var(--muted-foreground))',
                                marginBottom: '0.25rem'
                            }}>
                                {message.user} • {message.time}
                            </div>
                            <div style={{ 
                                background: message.isOwn ? 'hsl(var(--primary))' : 'hsl(var(--muted))', 
                                color: message.isOwn ? 'white' : 'hsl(var(--foreground))',
                                padding: '0.75rem 1rem', 
                                borderRadius: message.isOwn ? '12px 4px 12px 12px' : '4px 12px 12px 12px', 
                                fontSize: '0.9rem',
                                lineHeight: '1.4',
                                wordBreak: 'break-word'
                            }}>
                                {message.text}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <form 
                onSubmit={handleSend}
                style={{ 
                    padding: '1rem 1.5rem', 
                    borderTop: '1px solid var(--glass-border)',
                    display: 'flex',
                    gap: '0.75rem'
                }}
            >
                <input
                    type="text"
                    placeholder="Type a message..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    style={{
                        flex: 1,
                        padding: '0.75rem 1rem',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid hsl(var(--input))',
                        background: 'rgba(255,255,255,0.05)',
                        color: 'inherit',
                        fontSize: '0.9rem',
                        outline: 'none',
                        transition: 'all 0.2s ease'
                    }}
                    onFocus={(e) => {
                        e.currentTarget.style.borderColor = 'hsl(var(--primary))';
                        e.currentTarget.style.boxShadow = '0 0 0 3px hsl(var(--primary) / 0.1)';
                    }}
                    onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'hsl(var(--input))';
                        e.currentTarget.style.boxShadow = 'none';
                    }}
                />
                <Button 
                    type="submit"
                    disabled={!inputValue.trim()}
                    style={{ padding: '0.75rem 1.5rem' }}
                >
                    Send
                </Button>
            </form>
        </div>
    );
}
