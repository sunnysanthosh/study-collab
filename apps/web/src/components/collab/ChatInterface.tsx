'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { FileUpload } from '@/components/ui/FileUpload';
import { useSocket } from '@/hooks/useSocket';
import { useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { messageApi, fileApi } from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';

interface Message {
    id: string;
    user: string;
    avatar: string;
    text: string;
    time: string;
    isOwn: boolean;
    userId?: string;
    edited_at?: string;
    reactions?: any[];
    reaction_counts?: Record<string, number>;
}

const EMOJI_OPTIONS = ['👍', '❤️', '😄', '🎉', '🔥', '💯'];
const PAGE_SIZE = 50;

export function ChatInterface() {
    const params = useParams();
    const roomId = params.id as string;
    const { user } = useAuth();
    const { showToast } = useToast();
    
    const userId = user?.id || '';
    const userName = user?.name || user?.email || 'Guest';
    
    const { messages: socketMessages, isConnected, typingUsers, roomUsers, sendMessage, sendTypingIndicator } = useSocket({
        roomId,
        userId,
        userName,
    });
    
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
    const [editValue, setEditValue] = useState('');
    const [showReactions, setShowReactions] = useState<string | null>(null);
    const [uploadingFile, setUploadingFile] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<number | null>(null);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [hasMoreMessages, setHasMoreMessages] = useState(true);
    const [loadedCount, setLoadedCount] = useState(0);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Load messages from API
    useEffect(() => {
        setMessages([]);
        setLoadedCount(0);
        setHasMoreMessages(true);
        const loadMessages = async () => {
            setLoadingMessages(true);
            try {
                const response = await messageApi.getMessages(roomId, PAGE_SIZE, 0);
                if (response.data?.messages) {
                    const formattedMessages: Message[] = response.data.messages.map((msg: any) => ({
                        id: msg.id,
                        user: msg.user_name || 'Unknown',
                        avatar: msg.user_avatar || (msg.user_name?.charAt(0).toUpperCase() || '?'),
                        text: msg.content,
                        time: msg.created_at,
                        isOwn: msg.user_id === userId,
                        userId: msg.user_id,
                        edited_at: msg.edited_at,
                        reactions: msg.reactions || [],
                        reaction_counts: msg.reaction_counts || {},
                    }));
                    setMessages(formattedMessages);
                    setLoadedCount(formattedMessages.length);
                    setHasMoreMessages(formattedMessages.length === PAGE_SIZE);
                }
            } catch (error) {
                console.error('Failed to load messages:', error);
            } finally {
                setLoadingMessages(false);
            }
        };
        loadMessages();
    }, [roomId, userId]);

    const loadMoreMessages = async () => {
        if (loadingMessages || !hasMoreMessages) return;
        setLoadingMessages(true);
        try {
            const response = await messageApi.getMessages(roomId, PAGE_SIZE, loadedCount);
            if (response.data?.messages) {
                const formattedMessages: Message[] = response.data.messages.map((msg: any) => ({
                    id: msg.id,
                    user: msg.user_name || 'Unknown',
                    avatar: msg.user_avatar || (msg.user_name?.charAt(0).toUpperCase() || '?'),
                    text: msg.content,
                    time: msg.created_at,
                    isOwn: msg.user_id === userId,
                    userId: msg.user_id,
                    edited_at: msg.edited_at,
                    reactions: msg.reactions || [],
                    reaction_counts: msg.reaction_counts || {},
                }));
                setMessages((prev) => [...formattedMessages, ...prev]);
                setLoadedCount((prev) => prev + formattedMessages.length);
                setHasMoreMessages(formattedMessages.length === PAGE_SIZE);
            }
        } catch (error) {
            console.error('Failed to load more messages:', error);
        } finally {
            setLoadingMessages(false);
        }
    };

    // Merge socket messages with API messages
    useEffect(() => {
        if (socketMessages.length > 0) {
            setMessages((prev) => {
                const newMessages = [...prev];
                socketMessages.forEach((socketMsg) => {
                    const existingIndex = newMessages.findIndex((m) => m.id === socketMsg.id);
                    if (existingIndex >= 0) {
                        newMessages[existingIndex] = { ...newMessages[existingIndex], ...socketMsg };
                    } else {
                        newMessages.push(socketMsg);
                    }
                });
                return newMessages;
            });
        }
    }, [socketMessages]);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (inputValue.trim()) {
            try {
                if (isConnected) {
                    sendMessage(inputValue);
                } else {
                    // Fallback to API
                    await messageApi.createMessage(roomId, inputValue);
                }
                setInputValue('');
            } catch (error) {
                showToast('Failed to send message', 'error');
            }
        }
    };

    const handleEdit = async (messageId: string) => {
        if (!editValue.trim()) return;
        try {
            await messageApi.editMessage(messageId, editValue);
            setMessages((prev) =>
                prev.map((msg) =>
                    msg.id === messageId
                        ? { ...msg, text: editValue, edited_at: new Date().toISOString() }
                        : msg
                )
            );
            setEditingMessageId(null);
            setEditValue('');
            showToast('Message updated', 'success');
        } catch (error) {
            showToast('Failed to update message', 'error');
        }
    };

    const handleDelete = async (messageId: string) => {
        if (!confirm('Are you sure you want to delete this message?')) return;
        try {
            await messageApi.deleteMessage(messageId);
            setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
            showToast('Message deleted', 'success');
        } catch (error) {
            showToast('Failed to delete message', 'error');
        }
    };

    const handleReaction = async (messageId: string, emoji: string) => {
        try {
            await messageApi.addReaction(messageId, emoji);
            // Reload reactions for this message
            const response = await messageApi.getReactions(messageId);
            if (response.data?.reactions) {
                setMessages((prev) =>
                    prev.map((msg) =>
                        msg.id === messageId
                            ? { ...msg, reactions: response.data.reactions }
                            : msg
                    )
                );
            }
        } catch (error) {
            showToast('Failed to add reaction', 'error');
        }
    };

    const handleFileUpload = async (file: File) => {
        setUploadingFile(true);
        setUploadProgress(0);
        try {
            const response = await fileApi.uploadFile(file, 'messages', (progress) => {
                setUploadProgress(progress);
            });
            if (response.error) {
                showToast(response.error, 'error');
                return;
            }
            
            // Create message with file link
            const fileUrl = response.data.file.url.startsWith('http') 
                ? response.data.file.url 
                : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}${response.data.file.url}`;
            const messageContent = `📎 [${file.name}](${fileUrl})`;
            
            if (isConnected) {
                sendMessage(messageContent);
            } else {
                await messageApi.createMessage(roomId, messageContent);
            }
            showToast('File uploaded successfully', 'success');
        } catch (error) {
            showToast('Failed to upload file', 'error');
        } finally {
            setUploadingFile(false);
            setUploadProgress(null);
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
                            {messages.length} {messages.length === 1 ? 'message' : 'messages'}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: 'hsl(var(--muted-foreground))' }}>
                            • {roomUsers.length} online
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
                {hasMoreMessages && (
                    <Button
                        variant="ghost"
                        onClick={loadMoreMessages}
                        disabled={loadingMessages}
                        style={{ alignSelf: 'center' }}
                    >
                        {loadingMessages ? 'Loading...' : 'Load earlier messages'}
                    </Button>
                )}
                {messages.map((message) => (
                    <div 
                        key={message.id}
                        style={{ 
                            display: 'flex', 
                            gap: '0.75rem',
                            flexDirection: message.isOwn ? 'row-reverse' : 'row',
                            animation: 'fadeIn 0.2s ease-out',
                            position: 'relative'
                        }}
                        onMouseEnter={(e) => {
                            const actions = e.currentTarget.querySelector('.message-actions') as HTMLElement;
                            if (actions) actions.style.opacity = '1';
                        }}
                        onMouseLeave={(e) => {
                            const actions = e.currentTarget.querySelector('.message-actions') as HTMLElement;
                            if (actions) actions.style.opacity = '0';
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
                                {message.edited_at && <span style={{ marginLeft: '0.5rem', fontStyle: 'italic' }}>(edited)</span>}
                            </div>
                            {editingMessageId === message.id ? (
                                <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                                    <input
                                        type="text"
                                        value={editValue}
                                        onChange={(e) => setEditValue(e.target.value)}
                                        style={{
                                            flex: 1,
                                            padding: '0.5rem',
                                            borderRadius: 'var(--radius-md)',
                                            border: '1px solid hsl(var(--input))',
                                            background: 'rgba(255,255,255,0.05)',
                                            color: 'inherit',
                                            fontSize: '0.9rem',
                                        }}
                                        autoFocus
                                    />
                                    <Button onClick={() => handleEdit(message.id)} style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>Save</Button>
                                    <Button variant="ghost" onClick={() => {
                                        setEditingMessageId(null);
                                        setEditValue('');
                                    }} style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>Cancel</Button>
                                </div>
                            ) : (
                                <>
                                    <div style={{ 
                                        background: message.isOwn ? 'hsl(var(--primary))' : 'hsl(var(--muted))', 
                                        color: message.isOwn ? 'white' : 'hsl(var(--foreground))',
                                        padding: '0.75rem 1rem', 
                                        borderRadius: message.isOwn ? '12px 4px 12px 12px' : '4px 12px 12px 12px', 
                                        fontSize: '0.9rem',
                                        lineHeight: '1.4',
                                        wordBreak: 'break-word',
                                        position: 'relative'
                                    }}>
                                        {message.text}
                                        <div className="message-actions" style={{
                                            position: 'absolute',
                                            top: '-30px',
                                            [message.isOwn ? 'right' : 'left']: '0',
                                            display: 'flex',
                                            gap: '0.25rem',
                                            opacity: 0,
                                            transition: 'opacity 0.2s',
                                            background: 'hsl(var(--background))',
                                            padding: '0.25rem',
                                            borderRadius: 'var(--radius-md)',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                                        }}>
                                            {message.isOwn && (
                                                <>
                                                    <button
                                                        onClick={() => {
                                                            setEditingMessageId(message.id);
                                                            setEditValue(message.text);
                                                        }}
                                                        style={{
                                                            background: 'transparent',
                                                            border: 'none',
                                                            color: 'hsl(var(--foreground))',
                                                            cursor: 'pointer',
                                                            padding: '0.25rem 0.5rem',
                                                            fontSize: '0.8rem',
                                                            borderRadius: 'var(--radius-sm)'
                                                        }}
                                                    >
                                                        ✏️
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(message.id)}
                                                        style={{
                                                            background: 'transparent',
                                                            border: 'none',
                                                            color: 'hsl(var(--destructive))',
                                                            cursor: 'pointer',
                                                            padding: '0.25rem 0.5rem',
                                                            fontSize: '0.8rem',
                                                            borderRadius: 'var(--radius-sm)'
                                                        }}
                                                    >
                                                        🗑️
                                                    </button>
                                                </>
                                            )}
                                            <button
                                                onClick={() => setShowReactions(showReactions === message.id ? null : message.id)}
                                                style={{
                                                    background: 'transparent',
                                                    border: 'none',
                                                    color: 'hsl(var(--foreground))',
                                                    cursor: 'pointer',
                                                    padding: '0.25rem 0.5rem',
                                                    fontSize: '0.8rem',
                                                    borderRadius: 'var(--radius-sm)'
                                                }}
                                            >
                                                😀
                                            </button>
                                        </div>
                                    </div>
                                    {message.reaction_counts && Object.keys(message.reaction_counts).length > 0 && (
                                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
                                            {Object.entries(message.reaction_counts).map(([emoji, count]) => (
                                                <button
                                                    key={emoji}
                                                    onClick={() => handleReaction(message.id, emoji)}
                                                    style={{
                                                        background: 'hsl(var(--muted))',
                                                        border: 'none',
                                                        borderRadius: '12px',
                                                        padding: '0.25rem 0.5rem',
                                                        fontSize: '0.8rem',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.25rem'
                                                    }}
                                                >
                                                    {emoji} {count}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                    {showReactions === message.id && (
                                        <div style={{
                                            display: 'flex',
                                            gap: '0.5rem',
                                            marginTop: '0.5rem',
                                            padding: '0.5rem',
                                            background: 'hsl(var(--muted))',
                                            borderRadius: 'var(--radius-md)'
                                        }}>
                                            {EMOJI_OPTIONS.map((emoji) => (
                                                <button
                                                    key={emoji}
                                                    onClick={() => {
                                                        handleReaction(message.id, emoji);
                                                        setShowReactions(null);
                                                    }}
                                                    style={{
                                                        background: 'transparent',
                                                        border: 'none',
                                                        fontSize: '1.2rem',
                                                        cursor: 'pointer',
                                                        padding: '0.25rem',
                                                        borderRadius: 'var(--radius-sm)',
                                                        transition: 'transform 0.2s'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.transform = 'scale(1.2)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.transform = 'scale(1)';
                                                    }}
                                                >
                                                    {emoji}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
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
                <div ref={messagesEndRef} />
            </div>

            <form 
                onSubmit={handleSend}
                style={{ 
                    padding: '1rem 1.5rem', 
                    borderTop: '1px solid var(--glass-border)',
                    display: 'flex',
                    gap: '0.75rem',
                    alignItems: 'flex-end'
                }}
            >
                <FileUpload
                    onFileSelect={handleFileUpload}
                    accept="image/*,application/pdf,.doc,.docx,.txt"
                    maxSize={10}
                    disabled={uploadingFile}
                    variant="icon"
                />
                {uploadingFile && uploadProgress !== null && (
                    <div style={{
                        minWidth: '120px',
                        fontSize: '0.75rem',
                        color: 'hsl(var(--muted-foreground))'
                    }}>
                        Uploading {Math.round(uploadProgress)}%
                    </div>
                )}
                <input
                    type="text"
                    placeholder="Type a message..."
                    value={inputValue}
                    onChange={(e) => {
                        setInputValue(e.target.value);
                        if (isConnected && e.target.value.trim()) {
                            sendTypingIndicator();
                        }
                    }}
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
                />
                <Button 
                    type="submit"
                    disabled={!inputValue.trim() || uploadingFile}
                    style={{ padding: '0.75rem 1.5rem' }}
                >
                    Send
                </Button>
            </form>
        </div>
    );
}
