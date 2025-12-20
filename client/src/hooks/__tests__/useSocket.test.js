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
});
