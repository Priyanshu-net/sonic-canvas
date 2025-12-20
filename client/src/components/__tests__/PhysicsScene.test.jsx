import { render, screen } from '@testing-library/react';
import React from 'react';
import { PhysicsScene } from '../PhysicsScene';
import { lastPhysicsProps } from '@react-three/cannon';

describe('PhysicsScene', () => {
  it('renders canvas and sets low-friction contact material', () => {
    const balls = [
      { id: '1', nx: 0.5, ny: 0.5, color: '#ff00ff' },
      { id: '2', nx: 0.6, ny: 0.4, color: '#00ffff' }
    ];

    render(
      <PhysicsScene balls={balls} energyLevel={8} cps={3} bloomIntensity={2.2} />
    );

    expect(screen.getByTestId('canvas')).toBeInTheDocument();
    // Verify Physics received defaultContactMaterial settings to reduce stacking
    expect(lastPhysicsProps).toBeTruthy();
    expect(lastPhysicsProps.defaultContactMaterial).toBeTruthy();
    expect(lastPhysicsProps.defaultContactMaterial.friction).toBeCloseTo(0.02);
    expect(lastPhysicsProps.defaultContactMaterial.restitution).toBeCloseTo(0.8);
  });
});
