import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { Panel } from '../Panel';

describe('Panel dragging', () => {
  it('moves when dragging anywhere on header', () => {
    render(<Panel title="Test Panel" initialX={10} initialY={10}><div>content</div></Panel>);
    const panel = screen.getByText(/TEST PANEL/).closest('.glass-panel');
    expect(panel).toBeInTheDocument();
    // Initial position
    expect(panel.style.left).toBe('10px');
    expect(panel.style.top).toBe('10px');

    const header = screen.getByText(/TEST PANEL/);
    fireEvent.mouseDown(header, { clientX: 0, clientY: 0 });
    fireEvent.mouseMove(panel, { clientX: 20, clientY: 30 });
    fireEvent.mouseUp(panel);

    // Position updated by delta (20,30)
    expect(panel.style.left).toBe('30px');
    expect(panel.style.top).toBe('40px');
  });
});
