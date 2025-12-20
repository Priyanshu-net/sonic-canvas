import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import { useParticles } from '../useParticles';

vi.useFakeTimers();

describe('useParticles', () => {
  it('adds explosions and auto-cleans particles', () => {
    const { result } = renderHook(() => useParticles());

    act(() => {
      result.current.addExplosion(100, 200, '#abc', 5);
    });

    // particles are added over time (staggered 10ms)
    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(result.current.particles.length).toBeGreaterThanOrEqual(5);

    // update loop runs every 16ms; after >1000ms cleanup removes old particles
    act(() => {
      vi.advanceTimersByTime(1200);
    });

    expect(result.current.particles.length).toBe(0);
  });
});
