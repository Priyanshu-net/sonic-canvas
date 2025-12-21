import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

export function createSonicCanvasServer({ port = 3001, corsOrigin = 'http://localhost:5173', roomCleanupMs = 120000 } = {}) {
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

  // Health endpoint for load balancers / monitoring
  app.get('/health', (req, res) => {
    res.status(200).send('ok');
  });

  // Track which room a socket is in and user info (single room per socket)
  const socketRoom = new Map(); // socket.id -> roomName
  const users = new Map(); // socket.id -> { name: string, beats: number, lastAction: number }
  // Contest state per room
  const contests = new Map(); // room -> { active: boolean, endTime: number, duration: number, scores: Map<socketId, { beats: number, peakCps: number }>, timer: NodeJS.Timeout }
  // Track last activity per room for cleanup (join, beat, contest start)
  const roomLastActive = new Map(); // room -> timestamp
  const touchRoom = (room) => { if (!room) return; roomLastActive.set(room, Date.now()); };
  // Helper: end contest early or on timer, emit result and cleanup
  const endContest = (room, { reason = 'timer' } = {}) => {
    const contest = contests.get(room);
    if (!contest) return;
    if (contest.timer) clearTimeout(contest.timer);
    const leaderboard = Array.from(contest.scores.entries())
      .map(([id, s]) => ({ id, name: users.get(id)?.name || `Anon-${id.slice(0,4)}`, beats: s.beats, peakCps: s.peakCps }))
      .sort((a, b) => b.beats - a.beats || b.peakCps - a.peakCps);
    const winner = reason === 'room-empty' ? null : (leaderboard[0] || null);
    // Peak CPS special mention (highest peakCps across entries)
    const peakChampion = leaderboard.reduce((acc, p) => {
      if (!acc || p.peakCps > acc.peakCps || (p.peakCps === acc.peakCps && p.beats > acc.beats)) return p;
      return acc;
    }, null);
    io.to(room).emit('contest-end', { room, winner, leaderboard, endedReason: reason, peakChampion });
    contests.delete(room);
  };

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
  touchRoom(defaultRoom);
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
          // If previous room becomes empty, end any active contest to cleanup
          if (getRoomSize(prev) === 0 && contests.has(prev)) {
            endContest(prev, { reason: 'room-empty' });
          }
        }
        socket.join(target);
        socketRoom.set(socket.id, target);
        // ack and update new room count
        socket.emit('room-joined', { room: target });
        io.to(target).emit('user-count', getRoomSize(target));
        console.log(`� ${socket.id} joined room: ${target}`);
        broadcastRoomUsers(target);
        touchRoom(target);
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

    // Room chat: broadcast messages within the current room
    socket.on('chat-message', ({ text }) => {
      try {
        const room = socketRoom.get(socket.id) || 'lobby';
        const info = users.get(socket.id) || { name: `Anon-${socket.id.slice(0,4)}` };
        const now = Date.now();
        // Simple rate limit: max 1 message per 800ms per user
        const last = info.lastMessageTime || 0;
        if (now - last < 800) return;
        users.set(socket.id, { ...info, lastMessageTime: now });
        const clean = String(text || '').trim().slice(0, 200);
        if (!clean) return;
        const payload = { id: `msg-${now}-${socket.id.slice(0,4)}`, room, from: info.name, text: clean, ts: now };
        io.to(room).emit('chat-message', payload);
        touchRoom(room);
      } catch (e) {
        console.warn('chat-message error', e);
      }
    });

    socket.on('trigger-beat', (payload) => {
      const room = socketRoom.get(socket.id) || 'lobby';
      const info = users.get(socket.id) || { name: `Anon-${socket.id.slice(0,4)}`, beats: 0, lastAction: 0 };
      users.set(socket.id, { ...info, beats: (info.beats || 0) + 1, lastAction: Date.now() });
  const enriched = { ...payload, userName: info.name };
      console.log('🎹 Beat triggered in', room, enriched);
      io.to(room).emit('receive-beat', enriched);
      broadcastRoomUsers(room);
  touchRoom(room);

      // Contest scoring
      const contest = contests.get(room);
      if (contest?.active) {
        const now = Date.now();
        let entry = contest.scores.get(socket.id);
        if (!entry) {
          entry = { beats: 0, peakCps: 0 };
        }
        entry.beats += 1;
        // Compute CPS per user from recent beats in last second; maintain a small array on users map
        const u = users.get(socket.id) || {};
        if (!u.beatTimes) u.beatTimes = [];
        u.beatTimes.push(now);
        // keep last 2s window
        u.beatTimes = u.beatTimes.filter((t) => now - t <= 2000);
        const cpsNow = u.beatTimes.filter((t) => now - t <= 1000).length;
        entry.peakCps = Math.max(entry.peakCps, cpsNow);
        contest.scores.set(socket.id, entry);
        // Broadcast contest update (lightweight)
        const remaining = Math.max(0, Math.floor((contest.endTime - now) / 1000));
        io.to(room).emit('contest-update', {
          room,
          remaining,
          leaderboard: Array.from(contest.scores.entries())
            .map(([id, s]) => ({ id, name: users.get(id)?.name || `Anon-${id.slice(0,4)}`, beats: s.beats, peakCps: s.peakCps }))
            .sort((a, b) => b.beats - a.beats || b.peakCps - a.peakCps)
          ,
          // current peak champion
          peakChampion: (() => {
            let champ = null;
            for (const [id, s] of contest.scores.entries()) {
              const name = users.get(id)?.name || `Anon-${id.slice(0,4)}`;
              const entry = { id, name, beats: s.beats, peakCps: s.peakCps };
              if (!champ || entry.peakCps > champ.peakCps || (entry.peakCps === champ.peakCps && entry.beats > champ.beats)) champ = entry;
            }
            return champ;
          })()
        });
      }
    });
    // Start a timed contest in the current room
    socket.on('start-contest', ({ duration = 30 } = {}) => {
      const room = socketRoom.get(socket.id) || 'lobby';
      try {
        // End existing contest if any
        const prev = contests.get(room);
        if (prev?.timer) clearTimeout(prev.timer);
        // Initialize contest state
        const endTime = Date.now() + Math.max(5, duration) * 1000;
        const scores = new Map();
        const timer = setTimeout(() => endContest(room, { reason: 'timer' }), Math.max(5, duration) * 1000);

        contests.set(room, { active: true, endTime, duration, scores, timer });
        io.to(room).emit('contest-start', { room, duration, endTime });
        touchRoom(room);
      } catch (e) {
        console.error('start-contest error', e);
      }
    });

    // Allow clients to query current contest state
    socket.on('get-contest', () => {
      const room = socketRoom.get(socket.id) || 'lobby';
      const c = contests.get(room);
      if (!c) {
        socket.emit('contest-none', { room });
        return;
      }
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((c.endTime - now) / 1000));
      socket.emit('contest-update', {
        room,
        remaining,
        leaderboard: Array.from(c.scores.entries())
          .map(([id, s]) => ({ id, name: users.get(id)?.name || `Anon-${id.slice(0,4)}`, beats: s.beats, peakCps: s.peakCps }))
          .sort((a, b) => b.beats - a.beats || b.peakCps - a.peakCps)
      });
    });

    // Lightweight analytics: client can send UX events for future dashboards
    // Example payload: { type: 'click', meta: { x, y, palette } }
    socket.on('analytics', (event) => {
      try {
        const room = socketRoom.get(socket.id) || 'lobby';
        const safe = {
          type: String(event?.type || 'unknown'),
          meta: event?.meta || {},
          ts: Date.now(),
          user: users.get(socket.id)?.name || `Anon-${socket.id.slice(0,4)}`,
          room
        };
        // For now, just log. Later we can persist to a DB or dashboard.
        console.log('📊 analytics', safe);
      } catch (e) {
        console.warn('analytics error', e);
      }
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
        // If room is now empty, end any active contest to free resources
        if (getRoomSize(room) === 0 && contests.has(room)) {
          endContest(room, { reason: 'room-empty' });
        }
        touchRoom(room);
      }, 100);
    });
  });

  // Periodic cleanup: clear stale room data after roomCleanupMs of inactivity
  // Check frequency adapts to configured cleanup time while avoiding overly tight loops
  const cleanupIntervalMs = Math.max(100, Math.min(30000, Math.floor(roomCleanupMs / 2)));
  const cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [room, last] of roomLastActive.entries()) {
      const size = getRoomSize(room);
      const idle = now - last;
      if (size === 0 && idle >= roomCleanupMs) {
        try {
          // End any contest if somehow still present
          if (contests.has(room)) {
            endContest(room, { reason: 'cleanup' });
          }
          roomLastActive.delete(room);
          io.emit('room-cleanup', { room, idleMs: idle });
          console.log(`🧹 Cleaned up room '${room}' after ${Math.round(idle/1000)}s idle`);
        } catch (e) {
          console.warn('room cleanup error', e);
        }
      }
    }
  }, cleanupIntervalMs);

  const listen = () => new Promise((resolve) => {
    httpServer.listen(port, () => {
      console.log(`🚀 Sonic Canvas server listening on port ${port}`);
      console.log(`🔗 Socket.io ready for connections from ${Array.isArray(corsOrigin) ? corsOrigin.join(', ') : corsOrigin}`);
      resolve();
    });
  });

  const close = () => new Promise((resolve) => {
    clearInterval(cleanupTimer);
    io.close(() => {
      httpServer.close(() => resolve());
    });
  });

  return { app, io, httpServer, listen, close };
}
