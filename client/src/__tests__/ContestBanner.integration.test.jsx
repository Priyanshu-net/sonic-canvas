import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { vi } from 'vitest';

// Shared mutable mock state to simulate contest lifecycle
const mockState = {
  socket: { on: vi.fn(), off: vi.fn(), emit: vi.fn() },
  isConnected: true,
  room: 'lobby',
  users: [],
  userName: '',
  setName: vi.fn(),
  joinRoom: vi.fn(),
  contest: { active: false, remaining: 0, winner: null, message: '' },
  startContest: vi.fn((duration = 30) => {
    // Simulate server emitting contest-start -> HUD should reflect remaining seconds
    mockState.contest.active = true;
    mockState.contest.remaining = duration;
    mockState.contest.message = '🎮 Contest started!';
  }),
  messages: [],
  sendMessage: vi.fn()
};

vi.mock('../hooks/useSocket', () => ({
  useSocket: () => mockState
}));

vi.mock('../hooks/useSynth', () => ({
  useSynth: () => ({
    playNote: vi.fn(),
    playNoteName: vi.fn(),
    startAudio: vi.fn(),
    isAudioReady: false,
    mapYToNote: vi.fn(),
    updateFilter: vi.fn(),
    setSynthPreset: vi.fn(),
    setReverbWet: vi.fn(),
  })
}));

import App from '../App.jsx';

describe('Contest banner integration', () => {
  it('shows HUD contest banner after starting a contest', async () => {
    // Force desktop mode
    try { Object.defineProperty(navigator, 'maxTouchPoints', { value: 0, configurable: true }); if ('ontouchstart' in window) delete window.ontouchstart; } catch {}

    const { rerender } = render(<App />);

    // Click "Start Contest" in ControlsPanel
    const startBtn = await screen.findByRole('button', { name: /Start Contest/i });
    fireEvent.click(startBtn);

    // Re-render to pick up mutated mock state
    rerender(<App />);

    // HUD should display active contest banner with remaining seconds
    const contestBanners = screen.getAllByText((content, node) => {
      const text = node?.textContent || '';
      return text.includes('CONTEST:') && text.includes('30s');
    });
    expect(contestBanners.length).toBeGreaterThan(0);
    // Optional: ensure the status in ControlsPanel updates as well
    expect(screen.getByText(/Contest running/i)).toBeInTheDocument();
  });
});
