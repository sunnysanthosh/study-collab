'use client';

import { useEffect, useState, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { initializeSocket, disconnectSocket, getSocket } from '@/lib/socket';
import { api } from '@/lib/api';

interface Message {
  id: string;
  user: string;
  avatar: string;
  text: string;
  time: string;
  isOwn: boolean;
  userId?: string;
}

interface UseSocketProps {
  roomId: string;
  userId: string;
  userName: string;
}

interface RoomUser {
  userId: string;
  userName: string;
  userAvatar?: string;
}

export function useSocket({ roomId, userId, userName }: UseSocketProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [roomUsers, setRoomUsers] = useState<RoomUser[]>([]);
  const socketRef = useRef<Socket | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const token = api.getToken();
    if (!token) {
      console.error('No token available for WebSocket connection');
      return;
    }

    const socket = initializeSocket(roomId, token);
    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      console.log('Socket connected, joining room:', roomId);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Socket disconnected');
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setIsConnected(false);
    });

    // Load message history
    socket.on('message-history', (data: { messages: any[] }) => {
      const historyMessages: Message[] = data.messages.map((msg: any) => ({
        id: msg.id,
        user: msg.user_name || 'Unknown',
        avatar: msg.user_avatar || (msg.user_name?.charAt(0).toUpperCase() || '?'),
        text: msg.content,
        time: msg.created_at,
        isOwn: msg.user_id === userId,
        userId: msg.user_id,
      }));
      setMessages(historyMessages);
    });

    socket.on('room-users', (data: { users: RoomUser[] }) => {
      setRoomUsers(data.users);
    });

    socket.on('user-joined', (data: { userId: string; userName: string; userAvatar?: string }) => {
      setRoomUsers((prev) => {
        if (prev.find((user) => user.userId === data.userId)) {
          return prev;
        }
        return [...prev, { userId: data.userId, userName: data.userName, userAvatar: data.userAvatar }];
      });
    });

    socket.on('user-left', (data: { userId: string }) => {
      setRoomUsers((prev) => prev.filter((user) => user.userId !== data.userId));
    });

    // Handle new messages
    socket.on('message', (data: { 
      id: string; 
      user: string; 
      avatar: string; 
      text: string; 
      time: string; 
      userId: string;
    }) => {
      const message: Message = {
        id: data.id,
        user: data.user,
        avatar: data.avatar,
        text: data.text,
        time: data.time,
        isOwn: data.userId === userId,
        userId: data.userId,
      };
      setMessages((prev) => [...prev, message]);
    });

    socket.on('user-typing', (data: { userId: string; userName: string }) => {
      if (data.userId !== userId) {
        setTypingUsers((prev) => {
          if (!prev.includes(data.userName)) {
            return [...prev, data.userName];
          }
          return prev;
        });

        // Clear typing indicator after 3 seconds
        setTimeout(() => {
          setTypingUsers((prev) => prev.filter((name) => name !== data.userName));
        }, 3000);
      }
    });

    socket.on('user-stopped-typing', (data: { userId: string; userName: string }) => {
      setTypingUsers((prev) => prev.filter((name) => name !== data.userName));
    });

    socket.on('error', (error: { message: string }) => {
      console.error('Socket error:', error.message);
    });

    return () => {
      disconnectSocket();
    };
  }, [roomId, userId, userName]);

  const sendMessage = (text: string) => {
    if (!socketRef.current || !isConnected) {
      console.warn('Socket not connected');
      return;
    }

    const message = {
      roomId,
      text: text.trim(),
    };

    socketRef.current.emit('message', message);

    // Clear typing indicator
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    socketRef.current.emit('stop-typing', { roomId });
  };

  const sendTypingIndicator = () => {
    if (!socketRef.current || !isConnected) return;

    socketRef.current.emit('typing', { roomId });

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current?.emit('stop-typing', { roomId });
    }, 3000);
  };

  return {
    messages,
    isConnected,
    typingUsers,
    roomUsers,
    sendMessage,
    sendTypingIndicator,
  };
}
