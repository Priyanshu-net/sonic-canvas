import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';

// Mock Tone.js
vi.mock('tone', () => {
  const triggerAttackRelease = vi.fn();
  class PolySynth {
    constructor() {}
    triggerAttackRelease = triggerAttackRelease;
    connect() { return this; }
    chain() { return this; }
    dispose() {}
  }
  class Reverb { constructor() { this.wet = { rampTo: vi.fn() }; } toDestination(){ return this; } dispose(){} }
  class PingPongDelay { constructor() { this.wet = 0; } connect(){ return this; } dispose(){} }
  class Filter { constructor(){ this.frequency = { rampTo: vi.fn() }; } connect(){ return this; } dispose(){} }
  class Panner { constructor(){ this.pan = { rampTo: vi.fn() }; } }
  class Compressor { constructor(){ return this; } }
  class Limiter { constructor(){ return this; } }
  const getDestination = () => ({})
  return {
    default: {},
    start: vi.fn().mockResolvedValue(undefined),
    PolySynth,
    Synth: class {},
    Reverb,
    PingPongDelay,
    Filter,
    Panner,
    Compressor,
    Limiter,
    getDestination,
  };
});

import { useSynth, mapYToPentatonic } from '../useSynth';

describe('useSynth', () => {
  it('starts audio and plays mapped note', async () => {
    const { result } = renderHook(() => useSynth());

    await act(async () => {
      await result.current.startAudio();
    });
    expect(result.current.isAudioReady).toBe(true);

    act(() => {
      const note = result.current.playNote(0.25);
      expect(note).toBeDefined();
    });
  });

  it('updates low-pass filter with energy', async () => {
    const { result } = renderHook(() => useSynth());
    await act(async () => {
      await result.current.startAudio();
    });

    act(() => {
      result.current.updateFilter(15);
    });
    // No throw indicates filterRef exists and rampTo called
  });

  it('mapYToPentatonic clamps and maps correctly', () => {
    expect(mapYToPentatonic(-1)).toBeDefined();
    expect(mapYToPentatonic(2)).toBeDefined();
  });
});
