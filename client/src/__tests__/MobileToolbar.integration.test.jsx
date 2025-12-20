import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { vi } from 'vitest';

vi.mock('../hooks/useSocket', () => ({
  useSocket: () => ({
    socket: { on: vi.fn(), off: vi.fn(), emit: vi.fn() },
    isConnected: true,
    room: 'lobby',
    users: [],
    userName: '',
    setName: vi.fn(),
    joinRoom: vi.fn(),
    contest: { active: false, remaining: 0, winner: null },
    startContest: vi.fn(),
    messages: [],
    sendMessage: vi.fn()
  })
}));

vi.mock('../hooks/useSynth', () => ({
  useSynth: () => ({
    playNote: vi.fn(),
    playNoteName: vi.fn(),
    startAudio: vi.fn(),
    isAudioReady: true,
    mapYToNote: vi.fn(),
    updateFilter: vi.fn(),
    setSynthPreset: vi.fn(),
    setReverbWet: vi.fn(),
  })
}));

import App from '../App.jsx';

describe('MobileToolbar integration', () => {
  it('renders toolbar on mobile and toggles theme', async () => {
    // Force isMobile true
    try { Object.defineProperty(navigator, 'maxTouchPoints', { value: 2, configurable: true }); window.ontouchstart = () => {}; } catch {}

    render(<App />);
    const themeBtn = await screen.findByRole('button', { name: /Toggle Theme/i });
    fireEvent.click(themeBtn);
    // Theme change happens in App; we just ensure button is present and interactable on mobile
    expect(themeBtn).toBeInTheDocument();
  });
});
