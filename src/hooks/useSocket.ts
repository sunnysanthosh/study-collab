'use client';

import { useEffect, useState, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { initializeSocket, disconnectSocket, getSocket } from '@/lib/socket';

interface Message {
  id: string;
  user: string;
  avatar: string;
  text: string;
  time: string;
  isOwn: boolean;
}

interface UseSocketProps {
  roomId: string;
  userId: string;
  userName: string;
}

export function useSocket({ roomId, userId, userName }: UseSocketProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const socketRef = useRef<Socket | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const socket = initializeSocket(roomId);
    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      socket.emit('join-room', { roomId, userId, userName });
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('message', (data: { id: string; user: string; avatar: string; text: string; time: string; userId: string }) => {
      const message: Message = {
        id: data.id,
        user: data.user,
        avatar: data.avatar,
        text: data.text,
        time: data.time,
        isOwn: data.userId === userId,
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
      userId,
      userName,
      text,
      time: new Date().toISOString(),
    };

    socketRef.current.emit('message', message);

    // Clear typing indicator
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    socketRef.current.emit('stop-typing', { roomId, userId, userName });
  };

  const sendTypingIndicator = () => {
    if (!socketRef.current || !isConnected) return;

    socketRef.current.emit('typing', { roomId, userId, userName });

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current?.emit('stop-typing', { roomId, userId, userName });
    }, 3000);
  };

  return {
    messages,
    isConnected,
    typingUsers,
    sendMessage,
    sendTypingIndicator,
  };
}

