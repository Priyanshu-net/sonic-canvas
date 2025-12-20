import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

export function createSonicCanvasServer({ port = 3001, corsOrigin = 'http://localhost:5173' } = {}) {
  const app = express();
  const httpServer = createServer(app);

  const io = new Server(httpServer, {
    cors: {
      origin: Array.isArray(corsOrigin) ? corsOrigin : corsOrigin,
      methods: ['GET', 'POST']
    }
  });

  app.use(cors());
  app.use(express.json());

  app.get('/', (req, res) => {
    res.json({ status: 'Sonic Canvas Server Running' });
  });

  // Track which room a socket is in and user info (single room per socket)
  const socketRoom = new Map(); // socket.id -> roomName
  const users = new Map(); // socket.id -> { name: string, beats: number, lastAction: number }

  const getRoomSize = (room) => (io.sockets.adapter.rooms.get(room)?.size || 0);
  const getUsersInRoom = (room) => {
    const roomSet = io.sockets.adapter.rooms.get(room) || new Set();
    const list = [];
    for (const id of roomSet) {
      const u = users.get(id) || { name: `Anon-${id.slice(0,4)}`, beats: 0, lastAction: 0 };
      list.push({ id, name: u.name, beats: u.beats || 0, lastAction: u.lastAction || 0 });
    }
    return list;
  };
  const broadcastRoomUsers = (room) => {
    io.to(room).emit('room-users', { room, users: getUsersInRoom(room) });
  };

  io.on('connection', (socket) => {
    console.log('🎵 User connected:', socket.id);

    // Init user entry
    users.set(socket.id, { name: `Anon-${socket.id.slice(0,4)}`, beats: 0, lastAction: Date.now() });

    // Auto-join default room 'lobby'
    const defaultRoom = 'lobby';
    socket.join(defaultRoom);
    socketRoom.set(socket.id, defaultRoom);
    io.to(defaultRoom).emit('user-count', getRoomSize(defaultRoom));
    socket.emit('room-joined', { room: defaultRoom });
    broadcastRoomUsers(defaultRoom);

    socket.on('join-room', ({ room }) => {
      try {
        const target = (room || '').trim() || 'lobby';
        const prev = socketRoom.get(socket.id);
        if (prev && prev !== target) {
          socket.leave(prev);
          // update old room count
          io.to(prev).emit('user-count', getRoomSize(prev));
          broadcastRoomUsers(prev);
        }
        socket.join(target);
        socketRoom.set(socket.id, target);
        // ack and update new room count
        socket.emit('room-joined', { room: target });
        io.to(target).emit('user-count', getRoomSize(target));
        console.log(`� ${socket.id} joined room: ${target}`);
        broadcastRoomUsers(target);
      } catch (e) {
        console.error('join-room error', e);
      }
    });

    socket.on('set-name', ({ name }) => {
      const trimmed = String(name || '').trim().slice(0, 32) || `Anon-${socket.id.slice(0,4)}`;
      const info = users.get(socket.id) || {};
      users.set(socket.id, { ...info, name: trimmed });
      const room = socketRoom.get(socket.id) || 'lobby';
      broadcastRoomUsers(room);
    });

    socket.on('trigger-beat', (payload) => {
      const room = socketRoom.get(socket.id) || 'lobby';
      const info = users.get(socket.id) || { name: `Anon-${socket.id.slice(0,4)}`, beats: 0, lastAction: 0 };
      users.set(socket.id, { ...info, beats: (info.beats || 0) + 1, lastAction: Date.now() });
      const enriched = { ...payload, userName: info.name };
      console.log('🎹 Beat triggered in', room, enriched);
      io.to(room).emit('receive-beat', enriched);
      broadcastRoomUsers(room);
    });

    // Allow clients to request the current user count explicitly
    socket.on('get-user-count', () => {
      const room = socketRoom.get(socket.id) || 'lobby';
      const count = getRoomSize(room);
      socket.emit('user-count', count);
    });

    socket.on('disconnect', () => {
      const room = socketRoom.get(socket.id) || 'lobby';
      socketRoom.delete(socket.id);
      users.delete(socket.id);
      console.log('👋 User disconnected:', socket.id);
      setTimeout(() => {
        io.to(room).emit('user-count', getRoomSize(room));
        console.log(`👥 Users in ${room}: ${getRoomSize(room)}`);
        broadcastRoomUsers(room);
      }, 100);
    });
  });

  const listen = () => new Promise((resolve) => {
    httpServer.listen(port, () => {
      console.log(`🚀 Sonic Canvas server listening on port ${port}`);
      console.log(`🔗 Socket.io ready for connections from ${Array.isArray(corsOrigin) ? corsOrigin.join(', ') : corsOrigin}`);
      resolve();
    });
  });

  const close = () => new Promise((resolve) => {
    io.close(() => {
      httpServer.close(() => resolve());
    });
  });

  return { app, io, httpServer, listen, close };
}
