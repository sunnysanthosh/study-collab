import { Server, Socket } from 'socket.io';
import { createServer } from 'http';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { verifyToken, TokenPayload } from './utils/jwt';
import * as MessageModel from './models/Message';
import * as UserModel from './models/User';
import * as TopicMemberModel from './models/TopicMember';
import pool from './db/connection';
import crypto from 'crypto';

dotenv.config();

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

interface RoomUser {
  userId: string;
  userName: string;
  userAvatar?: string;
  socketId: string;
}

interface AuthenticatedSocket extends Socket {
  user?: TokenPayload;
}

const rooms = new Map<string, Set<RoomUser>>();

// Middleware for JWT authentication
const hashToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

const isTokenBlacklisted = async (token: string): Promise<boolean> => {
  const tokenHash = hashToken(token);
  const result = await pool.query(
    `SELECT 1
     FROM token_blacklist
     WHERE token_hash = $1
       AND (expires_at IS NULL OR expires_at > NOW())
     LIMIT 1`,
    [tokenHash]
  );
  return result.rowCount > 0;
};

const upsertUserSession = async (userId: string, status: string, socketId?: string) => {
  await pool.query(
    `INSERT INTO user_sessions (user_id, status, last_seen, socket_id, updated_at)
     VALUES ($1, $2, NOW(), $3, NOW())
     ON CONFLICT (user_id)
     DO UPDATE SET status = $2, last_seen = NOW(), socket_id = $3, updated_at = NOW()`,
    [userId, status, socketId || null]
  );
};

const setUserOffline = async (userId: string) => {
  await pool.query(
    `UPDATE user_sessions
     SET status = 'offline', last_seen = NOW(), socket_id = NULL, updated_at = NOW()
     WHERE user_id = $1`,
    [userId]
  );
};

const startNotificationListener = async () => {
  const client = await pool.connect();
  try {
    await client.query('LISTEN notification_created');
    client.on('notification', (msg) => {
      if (!msg.payload) return;
      try {
        const payload = JSON.parse(msg.payload);
        const userId = payload.userId;
        if (userId) {
          io.to(userId).emit('notification', payload.notification);
        }
      } catch (error) {
        console.error('Failed to parse notification payload:', error);
      }
    });
    console.log('✅ WebSocket: Listening for notification_created events');
  } catch (error) {
    console.error('❌ WebSocket: Failed to listen for notifications:', error);
    client.release();
  }
};

const createMessageNotifications = async (topicId: string, senderId: string, content: string) => {
  const topicResult = await pool.query('SELECT title FROM topics WHERE id = $1', [topicId]);
  const topicTitle = topicResult.rows[0]?.title || 'a topic';
  const membersResult = await pool.query(
    'SELECT user_id FROM topic_members WHERE topic_id = $1',
    [topicId]
  );

  for (const row of membersResult.rows) {
    if (row.user_id === senderId) continue;
    const notificationResult = await pool.query(
      `INSERT INTO notifications (user_id, type, title, message, link)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        row.user_id,
        'message',
        `New message in ${topicTitle}`,
        content.trim().slice(0, 140),
        `/topics/${topicId}`,
      ]
    );
    const notification = notificationResult.rows[0];
    await pool.query('NOTIFY notification_created, $1', [
      JSON.stringify({ userId: notification.user_id, notification }),
    ]);
  }
};

io.use(async (socket: AuthenticatedSocket, next) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      console.log(`Connection rejected: No token provided for socket ${socket.id}`);
      return next(new Error('Authentication required'));
    }
    
    try {
      const payload = verifyToken(token);
      const revoked = await isTokenBlacklisted(token);
      if (revoked) {
        return next(new Error('Token has been revoked'));
      }
      socket.user = payload;
      console.log(`✅ Authenticated user: ${payload.email} (${payload.userId})`);
      next();
    } catch (error: any) {
      console.log(`❌ Authentication failed for socket ${socket.id}: ${error.message}`);
      return next(new Error('Invalid or expired token'));
    }
  } catch (error) {
    console.error('Authentication middleware error:', error);
    return next(new Error('Authentication failed'));
  }
});

// Initialize database connection
pool.query('SELECT NOW()')
  .then(() => {
    console.log('✅ WebSocket: Database connection established');
    startNotificationListener().catch((error) => {
      console.error('❌ WebSocket: Notification listener error:', error);
    });
  })
  .catch((error) => {
    console.error('❌ WebSocket: Database connection failed:', error);
    console.log('⚠️  WebSocket will start but message persistence will fail');
  });

io.on('connection', async (socket: AuthenticatedSocket) => {
  if (!socket.user) {
    console.log(`Connection rejected: No user data for socket ${socket.id}`);
    socket.disconnect();
    return;
  }

  const userId = socket.user.userId;
  console.log(`✅ User connected: ${socket.user.email} (${userId}) - Socket: ${socket.id}`);
  socket.join(userId);
  await upsertUserSession(userId, 'online', socket.id);
  io.emit('presence-update', { userId, status: 'online' });

  // Get user info from database
  let userInfo: { name: string; avatar_url?: string } | null = null;
  try {
    const user = await UserModel.getUserById(userId);
    if (user) {
      userInfo = { name: user.name, avatar_url: user.avatar_url };
    }
  } catch (error) {
    console.error('Error fetching user info:', error);
  }

  socket.on('join-room', async ({ roomId }: { roomId: string }) => {
    try {
      // Verify user is a member of the topic
      const isMember = await TopicMemberModel.isMemberOfTopic(roomId, userId);
      if (!isMember) {
        // Auto-add user as member if not already
        await TopicMemberModel.addMemberToTopic(roomId, userId);
        console.log(`Auto-added user ${userId} to topic ${roomId}`);
      }

      socket.join(roomId);
      
      if (!rooms.has(roomId)) {
        rooms.set(roomId, new Set());
      }
      
      const room = rooms.get(roomId)!;
      const userName = userInfo?.name || socket.user.email;
      const roomUser: RoomUser = {
        userId,
        userName,
        userAvatar: userInfo?.avatar_url,
        socketId: socket.id,
      };
      room.add(roomUser);
      
      // Load message history from database
      try {
        const messages = await MessageModel.getMessagesByTopic(roomId, 50, 0, 'desc');
        socket.emit('message-history', { messages: messages.reverse() });
      } catch (error) {
        console.error('Error loading message history:', error);
      }
      
      // Notify others in the room
      socket.to(roomId).emit('user-joined', { userId, userName, userAvatar: userInfo?.avatar_url });
      
      // Send current room users to the new user
      const users = Array.from(room).map(u => ({
        userId: u.userId,
        userName: u.userName,
        userAvatar: u.userAvatar,
      }));
      socket.emit('room-users', { users });
      
      console.log(`User ${userName} (${userId}) joined room ${roomId}`);
    } catch (error) {
      console.error('Error joining room:', error);
      socket.emit('error', { message: 'Failed to join room' });
    }
  });

  socket.on('leave-room', ({ roomId }: { roomId: string }) => {
    socket.leave(roomId);
    
    const room = rooms.get(roomId);
    if (room) {
      room.forEach(user => {
        if (user.userId === userId && user.socketId === socket.id) {
          room.delete(user);
        }
      });
      
      if (room.size === 0) {
        rooms.delete(roomId);
      }
    }
    
    const userName = userInfo?.name || socket.user.email;
    socket.to(roomId).emit('user-left', { userId, userName });
    console.log(`User ${userName} (${userId}) left room ${roomId}`);
  });

  socket.on('message', async ({ roomId, text }: { roomId: string; text: string }) => {
    try {
      if (!text || text.trim().length === 0) {
        return;
      }

      // Verify user is a member of the topic
      const isMember = await TopicMemberModel.isMemberOfTopic(roomId, userId);
      if (!isMember) {
        socket.emit('error', { message: 'You must be a member of this topic to send messages' });
        return;
      }

      // Save message to database
      const savedMessage = await MessageModel.createMessage({
        topic_id: roomId,
        user_id: userId,
        content: text.trim(),
      });

      const userName = userInfo?.name || socket.user.email;
      const message = {
        id: savedMessage.id,
        userId,
        user: userName,
        avatar: userInfo?.avatar_url || userName.charAt(0).toUpperCase(),
        text: savedMessage.content,
        time: new Date(savedMessage.created_at).toISOString(),
      };
      
      // Broadcast to all users in the room including sender
      io.to(roomId).emit('message', message);

      try {
        await createMessageNotifications(roomId, userId, text);
      } catch (notifyError) {
        console.error('Error creating message notifications:', notifyError);
      }
      
      console.log(`Message saved and broadcast in room ${roomId} from ${userName}: ${text}`);
    } catch (error) {
      console.error('Error handling message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  socket.on('typing', ({ roomId }: { roomId: string }) => {
    const userName = userInfo?.name || socket.user.email;
    socket.to(roomId).emit('user-typing', { userId, userName });
  });

  socket.on('stop-typing', ({ roomId }: { roomId: string }) => {
    const userName = userInfo?.name || socket.user.email;
    socket.to(roomId).emit('user-stopped-typing', { userId, userName });
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.user?.email} (${userId}) - Socket: ${socket.id}`);
    
    // Remove user from all rooms
    rooms.forEach((room, roomId) => {
      room.forEach(user => {
        if (user.userId === userId && user.socketId === socket.id) {
          room.delete(user);
          const userName = userInfo?.name || socket.user.email;
          socket.to(roomId).emit('user-left', { userId, userName });
        }
      });
      
      if (room.size === 0) {
        rooms.delete(roomId);
      }
    });

    setUserOffline(userId)
      .then(() => {
        io.emit('presence-update', { userId, status: 'offline' });
      })
      .catch((error) => {
        console.error('Failed to update offline status:', error);
      });
  });
});

const PORT = process.env.PORT || 3002;
httpServer.listen(PORT, () => {
  console.log(`🚀 WebSocket server running on port ${PORT}`);
});
