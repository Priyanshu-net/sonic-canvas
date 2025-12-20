import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { MobileToolbar } from '../MobileToolbar';

describe('MobileToolbar', () => {
  it('renders initialize button when audio not ready', () => {
    const startAudio = vi.fn();
    render(<MobileToolbar isAudioReady={false} startAudio={startAudio} theme="dark" toggleTheme={vi.fn()} graphicsEnabled={false} setGraphicsEnabled={vi.fn()} hapticsEnabled={true} setHapticsEnabled={vi.fn()} contest={{ active: false }} startContest={vi.fn()} userName="" setName={vi.fn()} />);
    const init = screen.getByRole('button', { name: /Initialize/i });
    fireEvent.click(init);
    expect(startAudio).toHaveBeenCalled();
  });

  it('toggles theme and sets name when audio ready', () => {
    const toggleTheme = vi.fn();
    const setName = vi.fn();
    render(<MobileToolbar isAudioReady={true} startAudio={vi.fn()} theme="dark" toggleTheme={toggleTheme} graphicsEnabled={false} setGraphicsEnabled={vi.fn()} hapticsEnabled={true} setHapticsEnabled={vi.fn()} contest={{ active: false }} startContest={vi.fn()} userName="" setName={setName} />);
    // Toggle theme
    const themeBtn = screen.getByRole('button', { name: /Toggle Theme/i });
    fireEvent.click(themeBtn);
    expect(toggleTheme).toHaveBeenCalled();
    // Edit name
    const editBtn = screen.getByRole('button', { name: /Edit Name/i });
    fireEvent.click(editBtn);
    const nameInput = screen.getByPlaceholderText('Your name');
    fireEvent.change(nameInput, { target: { value: 'Pri' } });
    const saveBtn = screen.getByRole('button', { name: /Save/i });
    fireEvent.click(saveBtn);
    expect(setName).toHaveBeenCalledWith('Pri');
  });
});
