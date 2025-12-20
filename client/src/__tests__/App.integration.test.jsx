import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { vi } from 'vitest';

// No need to mock PhysicsScene now; we'll click the app's overlay layer

// Mock socket with accessible spy
const mockSocket = { on: vi.fn(), off: vi.fn(), emit: vi.fn(), id: 'abc' };
vi.mock('../hooks/useSocket', () => ({
  useSocket: () => ({
    socket: mockSocket,
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

// Mock particles
const addExplosion = vi.fn();
vi.mock('../hooks/useParticles', () => ({
  useParticles: () => ({ particles: [], addExplosion })
}));

// Mock synth
const playNoteName = vi.fn();
const updateFilter = vi.fn();
vi.mock('../hooks/useSynth', () => ({
  useSynth: () => ({
    playNote: vi.fn(),
    playNoteName,
    startAudio: vi.fn(),
    isAudioReady: true,
    mapYToNote: vi.fn().mockReturnValue('C4'),
    updateFilter,
    setSynthPreset: vi.fn(),
    setReverbWet: vi.fn(),
  })
}));

import App from '../App.jsx';

// Test helper component to simulate physics collisions
const MockPhysicsScene = ({ onBallCollision }) =>
  React.createElement('div', {
    'data-testid': 'physics-scene',
    onClick: () => onBallCollision([0, -5, 0], 'C4', '#fff', 1)
  });

describe('App integration', () => {
  it('plays note and emits particles when a physics collision occurs', async () => {
    render(<App PhysicsSceneComponent={MockPhysicsScene} />);

    const scene = await screen.findByTestId('physics-scene');
    fireEvent.click(scene);

    expect(playNoteName).toHaveBeenCalledWith('C4', expect.any(Object));
    expect(addExplosion).toHaveBeenCalled();
  });
});
