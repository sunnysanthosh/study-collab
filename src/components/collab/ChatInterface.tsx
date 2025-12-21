'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { useSocket } from '@/hooks/useSocket';
import { useParams } from 'next/navigation';

interface Message {
    id: string;
    user: string;
    avatar: string;
    text: string;
    time: string;
    isOwn: boolean;
}

export function ChatInterface() {
    const params = useParams();
    const roomId = params.id as string;
    
    // TODO: Get from auth context
    const userId = 'user-123';
    const userName = 'You';
    
    const { messages, isConnected, typingUsers, sendMessage, sendTypingIndicator } = useSocket({
        roomId,
        userId,
        userName,
    });
    
    const [inputValue, setInputValue] = useState('');

    // Fallback messages if socket not connected
    const [fallbackMessages] = useState<Message[]>([
        { id: '1', user: 'Alice', avatar: 'A', text: 'Has anyone solved problem 3?', time: '2m ago', isOwn: false },
        { id: '2', user: 'You', avatar: 'B', text: 'I think you need to use the chain rule there.', time: 'Just now', isOwn: true },
    ]);

    const displayMessages = isConnected && messages.length > 0 ? messages : fallbackMessages;

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputValue.trim()) {
            if (isConnected) {
                sendMessage(inputValue);
            } else {
                console.log('Socket not connected, using fallback:', inputValue);
            }
            setInputValue('');
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
        if (isConnected && e.target.value.trim()) {
            sendTypingIndicator();
        }
    };

    const formatTime = (timeString: string) => {
        try {
            const date = new Date(timeString);
            const now = new Date();
            const diff = now.getTime() - date.getTime();
            const minutes = Math.floor(diff / 60000);
            
            if (minutes < 1) return 'Just now';
            if (minutes < 60) return `${minutes}m ago`;
            const hours = Math.floor(minutes / 60);
            if (hours < 24) return `${hours}h ago`;
            return date.toLocaleDateString();
        } catch {
            return timeString;
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
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.8rem', color: 'hsl(var(--muted-foreground))' }}>
                            {displayMessages.length} {displayMessages.length === 1 ? 'message' : 'messages'}
                        </span>
                        {isConnected ? (
                            <span style={{ fontSize: '0.75rem', color: 'hsl(var(--success))' }}>• Connected</span>
                        ) : (
                            <span style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))' }}>• Offline</span>
                        )}
                    </div>
                </div>
                <div style={{ 
                    width: '8px', 
                    height: '8px', 
                    background: isConnected ? 'hsl(var(--success))' : 'hsl(var(--muted-foreground))', 
                    borderRadius: '50%',
                    animation: isConnected ? 'pulse 2s ease-in-out infinite' : 'none'
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
                {displayMessages.map((message) => (
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
                            {message.user} • {formatTime(message.time)}
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
                {typingUsers.length > 0 && (
                    <div style={{ 
                        display: 'flex', 
                        gap: '0.75rem',
                        alignItems: 'center',
                        padding: '0.5rem 0',
                        color: 'hsl(var(--muted-foreground))',
                        fontSize: '0.85rem',
                        fontStyle: 'italic'
                    }}>
                        <div style={{ 
                            width: '36px', 
                            height: '36px', 
                            borderRadius: '50%', 
                            background: 'hsl(var(--muted))', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            fontSize: '0.9rem', 
                            fontWeight: 'bold',
                            flexShrink: 0
                        }}>
                            ...
                        </div>
                        <span>{typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...</span>
                    </div>
                )}
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
                    onChange={handleInputChange}
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
