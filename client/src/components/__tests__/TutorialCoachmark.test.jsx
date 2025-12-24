import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { TutorialCoachmark } from '../TutorialCoachmark';

const mkTutorial = (over = {}) => ({
  current: { id: 'theme-toggle', anchor: '[data-tutorial-id="controls-theme"]', title: 'Try theme', description: 'Toggle theme' },
  variant: 'checkpoint',
  done: false,
  started: true,
  next: () => {},
  back: () => {},
  skip: () => {},
  ...over,
});

describe('TutorialCoachmark', () => {
  it('renders when anchor exists', () => {
    const t = mkTutorial();
    const { container } = render(
      <div>
        <button data-tutorial-id="controls-theme">X</button>
        <TutorialCoachmark tutorial={t} isAudioReady={true} />
      </div>
    );
    // Highlight overlay should exist (absolute positioned div)
    const overlays = container.querySelectorAll('[role="dialog"]');
    expect(overlays.length).toBe(1);
  });

  it('does not render when done', () => {
    const t = mkTutorial({ done: true });
    const { container } = render(
      <div>
        <button data-tutorial-id="controls-theme">X</button>
        <TutorialCoachmark tutorial={t} />
      </div>
    );
    const overlays = container.querySelectorAll('[role="dialog"]');
    expect(overlays.length).toBe(0);
  });

  it('does not render when not started', () => {
    const t = mkTutorial({ started: false });
    const { container } = render(
      <div>
        <button data-tutorial-id="controls-theme">X</button>
        <TutorialCoachmark tutorial={t} />
      </div>
    );
    const overlays = container.querySelectorAll('[role="dialog"]');
    expect(overlays.length).toBe(0);
  });
});
