// File: useSocket.js
import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

// Resolve Socket server URL with sensible production fallback
function resolveServerUrl() {
  const fromEnv = import.meta.env.VITE_SOCKET_URL;
  if (fromEnv && typeof fromEnv === 'string' && fromEnv.trim()) return fromEnv.trim();
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    // Heuristic: if deployed on Render and frontend host contains "frontend",
    // try a sibling backend host by replacing the segment.
    if (host.endsWith('onrender.com') && host.includes('frontend')) {
      return `https://${host.replace('frontend', 'backend')}`;
    }
    // If running locally over https (rare), still default to localhost:3001
  }
  return 'http://localhost:3001';
}

const SERVER_URL = resolveServerUrl();

/**
 * Custom hook for managing Socket.io connection
 * @returns {Object} { socket, isConnected }
 */
export const useSocket = (initialRoom = 'lobby') => {
  const socketRef = useRef(null);
  const [socketState, setSocketState] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [room, setRoom] = useState(initialRoom);
  const [users, setUsers] = useState([]); // roster for current room
  const [userName, setUserName] = useState('');
  const [contest, setContest] = useState({ active: false, remaining: 0, leaderboard: [], winner: null, endedAt: 0, message: '' });
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // Initialize Socket.io client
      socketRef.current = io(SERVER_URL, { 
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

  const socket = socketRef.current;
    setSocketState(socket); // ensure consumers re-render when socket becomes available

    // Connection event handlers
    socket.on('connect', () => {
      console.log('🔗 Connected to Sonic Canvas server:', socket.id);
      setIsConnected(true);
      // join initial room
      socket.emit('join-room', { room: room || initialRoom });
    });

    socket.on('disconnect', () => {
      console.log('❌ Disconnected from server');
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('🚨 Connection error:', error);
    });

    // Room join ack
    socket.on('room-joined', ({ room: joined }) => {
      setRoom(joined);
      console.log('🏷️ Joined room:', joined);
    });

    // Room users roster
    const handleRoomUsers = ({ room: r, users: roster }) => {
      // Only set if this is the current room
      if (r === (room || initialRoom)) {
        setUsers(roster || []);
      }
    };
    socket.on('room-users', handleRoomUsers);

    // Contest events
    socket.on('contest-start', ({ duration, endTime }) => {
      const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
      setContest({ active: true, remaining, leaderboard: [], winner: null, endedAt: 0, message: `🎮 Contest started! ${duration}s — more balls win, peak CPS gets a shoutout! 🔥`, peakChampion: null, peakMessage: '' });
    });
    socket.on('contest-update', ({ remaining, leaderboard, peakChampion }) => {
      const peakMessage = peakChampion ? `⚡ Highest CPS: ${peakChampion.name} at ${peakChampion.peakCps}` : '';
      setContest({ active: true, remaining, leaderboard, winner: null, endedAt: 0, message: '', peakChampion, peakMessage });
    });
    socket.on('contest-end', ({ winner, leaderboard, peakChampion }) => {
      const name = winner?.name || 'Anonymous';
      const beats = winner?.beats ?? 0;
      const peak = winner?.peakCps ?? 0;
      const peakMsg = peakChampion ? `⚡ Peak CPS: ${peakChampion.name} at ${peakChampion.peakCps}` : '';
      setContest({
        active: false,
        remaining: 0,
        leaderboard,
        winner,
        endedAt: Date.now(),
        message: `🏆 Winner: ${name} — ${beats} beats • peak ${peak} CPS 🎉`,
        peakChampion,
        peakMessage: peakMsg
      });
    });
    socket.on('contest-none', () => {
      setContest({ active: false, remaining: 0, leaderboard: [], winner: null, endedAt: 0, message: '' });
    });

    // Room chat messages
    const onChat = (payload) => {
      setMessages((prev) => {
        const next = [...prev, payload];
        return next.slice(-50); // cap history
      });
    };
    socket.on('chat-message', onChat);

    // Cleanup on unmount
    return () => {
      if (socket) {
        // In tests, socket may be a minimal fake without .off
        try { socket.off?.('chat-message', onChat); } catch {}
        try { socket.disconnect?.(); } catch {}
        console.log('👋 Socket disconnected');
      }
    };
  }, []);

  const joinRoom = useCallback((nextRoom) => {
    const r = (nextRoom || '').trim() || 'lobby';
    setRoom(r);
    if (socketRef.current) {
      socketRef.current.emit('join-room', { room: r });
    }
  }, []);

  const setName = useCallback((name) => {
    const n = (name || '').trim();
    setUserName(n);
    if (socketRef.current && n) {
      socketRef.current.emit('set-name', { name: n });
    }
  }, []);

  const startContest = useCallback((duration = 30) => {
    if (socketRef.current) {
      socketRef.current.emit('start-contest', { duration });
    }
  }, []);

  const sendMessage = useCallback((text) => {
    const t = (text || '').trim();
    if (!t || !socketRef.current) return;
    socketRef.current.emit('chat-message', { text: t });
  }, []);

  return {
    socket: socketState,
    isConnected,
    room,
    joinRoom,
    users,
    userName,
    setName,
    contest,
    startContest,
    messages,
    sendMessage
  };
};
