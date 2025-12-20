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

    // Cleanup on unmount
    return () => {
      if (socket) {
        socket.disconnect();
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

  return {
    socket: socketState,
    isConnected,
    room,
    joinRoom,
    users,
    userName,
    setName
  };
};
