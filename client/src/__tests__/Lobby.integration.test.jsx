import { render, screen } from '@testing-library/react';
import React from 'react';
import { vi } from 'vitest';

// Mock socket to return multiple users
vi.mock('../hooks/useSocket', () => ({
  useSocket: () => ({
    socket: { on: vi.fn(), off: vi.fn(), emit: vi.fn() },
    isConnected: true,
    room: 'lobby',
    users: [
      { id: 'a', name: 'Alpha', beats: 5 },
      { id: 'b', name: '', beats: 0 },
      { id: 'c', name: 'Charlie', beats: 2 }
    ],
    userName: 'Alpha',
    setName: vi.fn(),
    joinRoom: vi.fn(),
    contest: { active: false, remaining: 0, winner: null },
    startContest: vi.fn(),
    messages: [],
    sendMessage: vi.fn()
  })
}));

import App from '../App.jsx';

describe('Lobby integration', () => {
  it('renders lobby and user roster', async () => {
    // Ensure desktop mode in JSDOM
    try {
      Object.defineProperty(navigator, 'maxTouchPoints', { value: 0, configurable: true });
      // Remove ontouchstart to make isMobile false
      if ('ontouchstart' in window) delete window.ontouchstart;
    } catch {}
    render(<App />);
    // UsersPanel shows lobby tag and users
    expect(await screen.findByText(/#lobby/i)).toBeInTheDocument();
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('Charlie')).toBeInTheDocument();
    // Anonymous fallback
    expect(screen.getByText('Anonymous')).toBeInTheDocument();
  });
});
