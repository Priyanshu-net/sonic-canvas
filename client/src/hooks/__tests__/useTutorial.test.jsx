import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useTutorial, DEFAULT_STEPS } from '../useTutorial';

function HookHarness({ onReady }) {
  const tutorial = useTutorial({ socket: { emit: vi.fn() }, steps: DEFAULT_STEPS, defaultVariant: 'checkpoint' });
  React.useEffect(() => { onReady?.(tutorial); }, [tutorial, onReady]);
  return (
    <div>
      <div data-testid="current-step">{tutorial.current?.id || 'none'}</div>
      <button onClick={() => tutorial.start('checkpoint')}>start</button>
      <button onClick={() => tutorial.next()}>next</button>
      <button onClick={() => tutorial.skip()}>skip</button>
      <button onClick={() => tutorial.complete(tutorial.current?.id)}>complete</button>
    </div>
  );
}

describe('useTutorial hook', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('starts with checkpoint variant and progresses steps', async () => {
    let tut;
    render(<HookHarness onReady={(t) => { tut = t; }} />);
    expect(screen.getByTestId('current-step').textContent).toBe('audio-init');

    // start explicitly ensures state is initialized
    await userEvent.click(screen.getByText('start'));
    expect(tut.variant).toBe('checkpoint');
    expect(tut.current.id).toBe('audio-init');

    // complete should auto-advance
    await userEvent.click(screen.getByText('complete'));
    expect(tut.current.id).toBe('first-beat');

    // advance to the end quickly
    for (let i = 0; i < 10 && tut.current.id !== 'complete'; i++) {
      await userEvent.click(screen.getByText('next'));
    }
    expect(tut.current.id).toBe('complete');
    expect(tut.done).toBe(true);
  });

  it('skip marks tutorial as done', async () => {
    let tut;
    render(<HookHarness onReady={(t) => { tut = t; }} />);
    await userEvent.click(screen.getByText('skip'));
    expect(tut.done).toBe(true);
  });
});
