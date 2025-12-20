import { render, screen, fireEvent } from '@testing-library/react';
import React, { useState } from 'react';
import { vi } from 'vitest';

// Mock useSynth to keep audio ready state irrelevant for panel rendering
vi.mock('../hooks/useSynth', () => ({
  useSynth: () => ({
    playNote: vi.fn(),
    playNoteName: vi.fn(),
    startAudio: vi.fn(),
    isAudioReady: false, // UsersPanel is gated by isMobile, not audio
    mapYToNote: vi.fn(),
    updateFilter: vi.fn(),
    setSynthPreset: vi.fn(),
    setReverbWet: vi.fn(),
  })
}));

// Create a stateful mock socket and hook
vi.mock('../hooks/useSocket', () => {
  const handlers = {};
  const fakeSocket = {
    on: (event, handler) => { handlers[event] = handler; },
    off: vi.fn(),
    emit: vi.fn(),
    id: 'abc'
  };
  return {
    useSocket: () => {
      const [users, setUsers] = useState([
        { id: 'a', name: '', beats: 0 },
        { id: 'b', name: 'Jammer', beats: 1 }
      ]);
      const [room] = useState('lobby');
      const setName = (name) => {
        // Simulate server applying name and broadcasting roster
        const trimmed = String(name || '').trim();
        const next = users.map(u => (u.id === 'a' ? { ...u, name: trimmed || `Anon-${u.id}` } : u));
        setUsers(next);
        handlers['room-users']?.({ room: 'lobby', users: next });
      };
      return {
        socket: fakeSocket,
        isConnected: true,
        room,
        users,
        userName: users.find(u => u.id === 'a')?.name || '',
        setName,
        joinRoom: vi.fn(),
        contest: { active: false, remaining: 0, winner: null },
        startContest: vi.fn(),
        messages: [],
        sendMessage: vi.fn()
      };
    }
  };
});

import App from '../App.jsx';

describe('Name reflects in Jammers Online', () => {
  it('updates roster when setting name', async () => {
    // Force desktop mode
    try {
      Object.defineProperty(navigator, 'maxTouchPoints', { value: 0, configurable: true });
      if ('ontouchstart' in window) delete window.ontouchstart;
    } catch {}

    render(<App />);

    // Initially UsersPanel shows Anonymous for first user
    // We rely on fallback 'Anonymous' text when name is empty
    expect(await screen.findByText(/JAMMERS ONLINE/i)).toBeInTheDocument();
    expect(screen.getByText(/#lobby/i)).toBeInTheDocument();
    expect(screen.getByText('Anonymous')).toBeInTheDocument();

    // Use RoomPanel to set name
    const nameInput = screen.getByPlaceholderText('Anonymous');
    fireEvent.change(nameInput, { target: { value: 'Priyanshu' } });
    const setBtn = screen.getByRole('button', { name: /Set/i });
    fireEvent.click(setBtn);

    // UsersPanel should reflect new name
    expect(await screen.findByText('Priyanshu')).toBeInTheDocument();
  });
});
