import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

function resolveServerUrl() {
  const fromEnv = import.meta.env.VITE_SOCKET_URL;
  if (fromEnv && typeof fromEnv === 'string' && fromEnv.trim()) return fromEnv.trim();
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host.endsWith('onrender.com') && host.includes('frontend')) {
      return `https://${host.replace('frontend', 'backend')}`;
    }
  }
  return 'http://localhost:3001';
}

const SERVER_URL = resolveServerUrl();

export const useSocket = (initialRoom = 'lobby') => {
  const socketRef = useRef(null);
  const [socketState, setSocketState] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [room, setRoom] = useState(initialRoom);
  const [users, setUsers] = useState([]);
  const [userName, setUserName] = useState('');
  const [contest, setContest] = useState({ active: false, remaining: 0, leaderboard: [], winner: null, endedAt: 0, message: '' });
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    socketRef.current = io(SERVER_URL, { transports: ['websocket', 'polling'], reconnection: true });
    setSocketState(socketRef.current);
    const socket = socketRef.current;

    socket.on('connect', () => { setIsConnected(true); socket.emit('join-room', { room: room || initialRoom }); });
    socket.on('disconnect', () => setIsConnected(false));
    socket.on('room-joined', ({ room: joined }) => setRoom(joined));
    socket.on('room-users', ({ room: r, users: roster }) => { if (r === (room || initialRoom)) setUsers(roster || []); });
    
    socket.on('contest-start', ({ duration, endTime }) => {
      setContest({ active: true, remaining: Math.max(0, Math.floor((endTime - Date.now()) / 1000)), leaderboard: [], winner: null, endedAt: 0, message: `🎮 Contest started!`, peakChampion: null, peakMessage: '' });
    });
    socket.on('contest-update', ({ remaining, leaderboard, peakChampion }) => {
      setContest({ active: true, remaining, leaderboard, winner: null, endedAt: 0, message: '', peakChampion, peakMessage: peakChampion ? `⚡ Peak: ${peakChampion.name}` : '' });
    });
    socket.on('contest-end', ({ winner, leaderboard, peakChampion }) => {
      setContest({ active: false, remaining: 0, leaderboard, winner, endedAt: Date.now(), message: `🏆 Winner: ${winner?.name || 'Anon'}`, peakChampion, peakMessage: '' });
    });
    
    socket.on('chat-message', (payload) => setMessages(prev => [...prev, payload].slice(-50)));

    return () => { if (socket) socket.disconnect(); };
  }, []);

  const joinRoom = useCallback((nextRoom) => {
    const r = (nextRoom || '').trim() || 'lobby';
    setRoom(r);
    if (socketRef.current) socketRef.current.emit('join-room', { room: r });
  }, []);

  const setName = useCallback((name) => {
    const n = (name || '').trim();
    setUserName(n);
    if (socketRef.current && n) socketRef.current.emit('set-name', { name: n });
  }, []);

  const startContest = useCallback((duration = 30) => {
    if (socketRef.current) socketRef.current.emit('start-contest', { duration });
  }, []);

  const sendMessage = useCallback((text) => {
    if (text?.trim() && socketRef.current) socketRef.current.emit('chat-message', { text: text.trim() });
  }, []);

  return { socket: socketState, isConnected, room, joinRoom, users, userName, setName, contest, startContest, messages, sendMessage };
};