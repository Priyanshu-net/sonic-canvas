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
    isAudioReady: false,
    mapYToNote: vi.fn(),
    updateFilter: vi.fn(),
    setSynthPreset: vi.fn(),
    setReverbWet: vi.fn(),
  })
}));

import App from '../App.jsx';

describe('Theme toggle integration', () => {
  it('toggles data-theme between dark and light', async () => {
    // Desktop mode
    try { Object.defineProperty(navigator, 'maxTouchPoints', { value: 0, configurable: true }); if ('ontouchstart' in window) delete window.ontouchstart; } catch {}

    render(<App />);
    // Initial theme is dark
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    // Click the theme toggle button in ControlsPanel
    const button = await screen.findByRole('button', { name: /Light|Dark/ });
    fireEvent.click(button);
    // Theme switches to light
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });
});
