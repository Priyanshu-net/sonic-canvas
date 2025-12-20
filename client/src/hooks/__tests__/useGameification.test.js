import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import { useGameification } from '../useGameification';

vi.useFakeTimers();

describe('useGameification', () => {
  it('increments combo and score, tracks CPS and energy', () => {
    const { result } = renderHook(() => useGameification());

    // Initially
    expect(result.current.combo).toBe(0);
    expect(result.current.score).toBe(0);
    expect(result.current.cps).toBe(0);
    expect(result.current.energyLevel).toBe(0);

    // Click rapidly 6 times within a second
    act(() => {
      for (let i = 0; i < 6; i++) {
        result.current.incrementCombo();
      }
      // advance timers to allow CPS interval to compute
      vi.advanceTimersByTime(150);
    });

    expect(result.current.combo).toBe(6);
    expect(result.current.score).toBeGreaterThan(0);
    // CPS should reflect recent clicks
    expect(result.current.cps).toBeGreaterThanOrEqual(1);
    expect(result.current.energyLevel).toBeGreaterThan(0);

    // After >1s, CPS should decay
    act(() => {
      vi.advanceTimersByTime(1200);
    });
    expect(result.current.cps).toBe(0);
  });

  it('resets combo', () => {
    const { result } = renderHook(() => useGameification());
    act(() => {
      result.current.incrementCombo();
      result.current.incrementCombo();
    });
    expect(result.current.combo).toBe(2);

    act(() => {
      result.current.resetCombo();
    });
    expect(result.current.combo).toBe(0);
  });
});
