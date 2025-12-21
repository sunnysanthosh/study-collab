import { Server } from 'socket.io';
import { createServer } from 'http';
import express from 'express';
import cors from 'cors';

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
  socketId: string;
}

const rooms = new Map<string, Set<RoomUser>>();

// Middleware for authentication (simplified)
io.use((socket, next) => {
  // TODO: Implement JWT verification
  const token = socket.handshake.auth.token;
  // For now, allow all connections
  next();
});

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('join-room', ({ roomId, userId, userName }: { roomId: string; userId: string; userName: string }) => {
    socket.join(roomId);
    
    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Set());
    }
    
    const room = rooms.get(roomId)!;
    room.add({ userId, userName, socketId: socket.id });
    
    // Notify others in the room
    socket.to(roomId).emit('user-joined', { userId, userName });
    
    // Send current room users to the new user
    const users = Array.from(room).map(u => ({ userId: u.userId, userName: u.userName }));
    socket.emit('room-users', { users });
    
    console.log(`User ${userName} (${userId}) joined room ${roomId}`);
  });

  socket.on('leave-room', ({ roomId, userId, userName }: { roomId: string; userId: string; userName: string }) => {
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
    
    socket.to(roomId).emit('user-left', { userId, userName });
    console.log(`User ${userName} (${userId}) left room ${roomId}`);
  });

  socket.on('message', ({ roomId, userId, userName, text, time }: { 
    roomId: string; 
    userId: string; 
    userName: string; 
    text: string; 
    time: string;
  }) => {
    const message = {
      id: `${Date.now()}-${Math.random()}`,
      userId,
      user: userName,
      avatar: userName.charAt(0).toUpperCase(),
      text,
      time,
    };
    
    // Broadcast to all users in the room including sender
    io.to(roomId).emit('message', message);
    
    // TODO: Save message to database
    console.log(`Message in room ${roomId} from ${userName}: ${text}`);
  });

  socket.on('typing', ({ roomId, userId, userName }: { roomId: string; userId: string; userName: string }) => {
    socket.to(roomId).emit('user-typing', { userId, userName });
  });

  socket.on('stop-typing', ({ roomId, userId, userName }: { roomId: string; userId: string; userName: string }) => {
    socket.to(roomId).emit('user-stopped-typing', { userId, userName });
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    
    // Remove user from all rooms
    rooms.forEach((room, roomId) => {
      room.forEach(user => {
        if (user.socketId === socket.id) {
          room.delete(user);
          socket.to(roomId).emit('user-left', { userId: user.userId, userName: user.userName });
        }
      });
      
      if (room.size === 0) {
        rooms.delete(roomId);
      }
    });
  });
});

const PORT = process.env.PORT || 3002;
httpServer.listen(PORT, () => {
  console.log(`WebSocket server running on port ${PORT}`);
});

