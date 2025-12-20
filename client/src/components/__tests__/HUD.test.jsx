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
});
