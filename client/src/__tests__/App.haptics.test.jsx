import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { vi } from 'vitest';

// Mock synth to have audio ready
vi.mock('../hooks/useSynth', () => ({
  useSynth: () => ({
    playNote: vi.fn(),
    playNoteName: vi.fn(),
    startAudio: vi.fn(),
    isAudioReady: true,
    mapYToNote: vi.fn().mockReturnValue('C4'),
    updateFilter: vi.fn(),
    setSynthPreset: vi.fn(),
    setReverbWet: vi.fn(),
  })
}));

// Mock socket minimal
vi.mock('../hooks/useSocket', () => ({
  useSocket: () => ({
    socket: { on: vi.fn(), off: vi.fn(), emit: vi.fn() },
    isConnected: true,
    room: 'lobby',
    users: [],
    userName: '',
    setName: vi.fn(),
    joinRoom: vi.fn(),
    contest: null,
    startContest: vi.fn(),
    messages: [],
    sendMessage: vi.fn()
  })
}));

import App from '../App.jsx';

// Mock physics scene that triggers collision on click
const MockPhysicsScene = ({ onBallCollision }) =>
  React.createElement('div', { 'data-testid': 'physics-scene', onClick: () => onBallCollision([0, -5, 0], 'C4', '#fff', 1) });

describe('Haptics integration', () => {
  it('vibrates on physics collision when haptics enabled', async () => {
    // Desktop mode
    try { Object.defineProperty(navigator, 'maxTouchPoints', { value: 0, configurable: true }); if ('ontouchstart' in window) delete window.ontouchstart; } catch {}
    // Mock vibration
    const vibrate = vi.fn();
    Object.defineProperty(navigator, 'vibrate', { value: vibrate, configurable: true, writable: true });

    render(<App PhysicsSceneComponent={MockPhysicsScene} />);

    const scene = await screen.findByTestId('physics-scene');
    fireEvent.click(scene);

    expect(vibrate).toHaveBeenCalled();
  });
});
