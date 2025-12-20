import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { vi } from 'vitest';

// Mock PhysicsScene to avoid WebGL and simulate collisions
vi.mock('../components/PhysicsScene', () => ({
  PhysicsScene: ({ onBallCollision }) =>
    React.createElement('div', {
      'data-testid': 'physics-scene',
      onClick: () => onBallCollision([0, -5, 0], 'C4', '#fff', 1)
    })
}));

// Mock socket
vi.mock('../hooks/useSocket', () => ({
  useSocket: () => ({ socket: { on: vi.fn(), off: vi.fn(), emit: vi.fn(), id: 'abc' }, isConnected: true })
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
  })
}));

import App from '../App.jsx';

describe('App integration', () => {
  it('plays note and emits particles on physics collision', () => {
    render(<App />);

    // Clicking the scene triggers mocked onBallCollision
    const scene = screen.getByTestId('physics-scene');
    fireEvent.click(scene);

    expect(playNoteName).toHaveBeenCalledWith('C4');
    expect(addExplosion).toHaveBeenCalled();
  });
});
