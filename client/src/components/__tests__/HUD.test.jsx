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

    expect(screen.getByText(/LIVE/i)).toBeInTheDocument();
    expect(screen.getByText(/SESSION STATUS/i)).toBeInTheDocument();
    expect(screen.getByText(/Energy/i)).toBeInTheDocument();
    expect(screen.getByText(/CPS/i)).toBeInTheDocument();
  });

  it('shows active contest banner with remaining time', () => {
    const contest = { active: true, remaining: 42 };

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

    expect(screen.getByText(/CONTEST/i)).toBeInTheDocument();
    expect(screen.getByText(/42/)).toBeInTheDocument();
  });

  it('shows combo multiplier when combo is high and OFFLINE state', () => {
    render(
      <HUD
        isAudioReady={true}
        isConnected={false}
        energyLevel={18}
        cps={9}
        combo={6}
        getComboMultiplier={() => 'x6'}
        userCount={0}
      />
    );

    expect(screen.getByText(/OFFLINE/i)).toBeInTheDocument();
    // Combo text shows "6x"
    expect(screen.getByText(/6x/i)).toBeInTheDocument();
  });
});
