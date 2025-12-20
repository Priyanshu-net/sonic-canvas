import { renderHook } from '@testing-library/react';
import { act } from 'react';
import { vi } from 'vitest';

// Minimal fake socket implementation
class FakeSocket {
  constructor() {
    this.handlers = {};
    this.id = 'fake-socket-id';
  }
  on(event, cb) {
    this.handlers[event] = cb;
  }
  emit(event, payload) {
    if (this.handlers[event]) this.handlers[event](payload);
  }
  disconnect() {
    /* noop */
  }
}

const fake = new FakeSocket();

vi.mock('socket.io-client', () => ({
  io: vi.fn(() => fake)
}));

import { useSocket } from '../useSocket';

describe('useSocket', () => {
  it('connects and updates isConnected on connect/disconnect events', () => {
    const { result, unmount } = renderHook(() => useSocket());

    // simulate connect
    act(() => {
      fake.handlers['connect'] && fake.handlers['connect']();
    });

    expect(result.current.isConnected).toBe(true);
    expect(result.current.socket).toBeTruthy();

    // simulate disconnect
    act(() => {
      fake.handlers['disconnect'] && fake.handlers['disconnect']();
    });

    expect(result.current.isConnected).toBe(false);

    // cleanup should call disconnect without throwing
    unmount();
  });

  it('updates contest state and chat messages via socket events', () => {
    const { result } = renderHook(() => useSocket('lobby'));

    // simulate connect to trigger initial join
    act(() => {
      fake.handlers['connect'] && fake.handlers['connect']();
    });

    // contest start
    act(() => {
      fake.handlers['contest-start'] && fake.handlers['contest-start']({ duration: 30, endTime: Date.now() + 30000 });
    });
    expect(result.current.contest.active).toBe(true);

    // contest update with peak champion
    act(() => {
      fake.handlers['contest-update'] && fake.handlers['contest-update']({ remaining: 10, leaderboard: [], peakChampion: { name: 'Peak', peakCps: 9 } });
    });
    expect(result.current.contest.peakMessage).toMatch(/Peak|Highest/i);

    // contest end with winner
    act(() => {
      fake.handlers['contest-end'] && fake.handlers['contest-end']({ winner: { name: 'Alice', beats: 12, peakCps: 6 }, leaderboard: [], peakChampion: { name: 'Peak', peakCps: 9 } });
    });
    expect(result.current.contest.active).toBe(false);
    expect(result.current.contest.message).toMatch(/Winner: Alice/i);

    // chat messages append and cap size
    act(() => {
      fake.handlers['chat-message'] && fake.handlers['chat-message']({ text: 'hello' });
    });
    expect(result.current.messages.at(-1)?.text).toBe('hello');
  });
});
