import { render, screen } from '@testing-library/react';
import React from 'react';
import { HUD } from '../HUD';

describe('HUD', () => {
  it('shows connection and energy info', () => {
    render(
      <HUD
        isAudioReady={true}
        isConnected={true}
        energyLevel={12}
        cps={7}
        combo={3}
        getComboMultiplier={() => '✨ HOT!'}
        userCount={5}
      />
    );

    expect(screen.getByText(/Audio: Active/i)).toBeInTheDocument();
    expect(screen.getByText(/Connected/i)).toBeInTheDocument();
    expect(screen.getByText(/Energy/i)).toBeInTheDocument();
    expect(screen.getByText(/Combo/i)).toBeInTheDocument();
    expect(screen.getByText(/5 users/i)).toBeInTheDocument();
  });

  it('shows winner announcement briefly after contest ends', () => {
    const recentEnd = Date.now();
    const contest = {
      active: false,
      remaining: 0,
      leaderboard: [
        { id: '1', name: 'Alice', beats: 12, peakCps: 6 },
        { id: '2', name: 'Bob', beats: 9, peakCps: 5 },
        { id: '3', name: '', beats: 7, peakCps: 4 },
      ],
      winner: { id: '1', name: 'Alice', beats: 12, peakCps: 6 },
      endedAt: recentEnd,
      message: '🏆 Winner: Alice — 12 beats • peak 6 CPS 🎉'
    };

    render(
      <HUD
        isAudioReady={true}
        isConnected={true}
        energyLevel={10}
        cps={5}
        combo={0}
        getComboMultiplier={() => ''}
        userCount={2}
        contest={contest}
      />
    );

  // Two occurrences (title and message). Assert at least one exists
  expect(screen.getAllByText(/Winner/i)[0]).toBeInTheDocument();
  // Multiple Alice occurrences (message + row), assert at least one
    expect(screen.getAllByText(/Alice/i)[0]).toBeInTheDocument();
    // "12 beats" appears in message and leaderboard row; assert at least one
    expect(screen.getAllByText(/12 beats/i)[0]).toBeInTheDocument();
  });
});
