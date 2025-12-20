import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { ControlsPanel } from '../ControlsPanel';

describe('ControlsPanel', () => {
  it('changes palette and reverb, toggles graphics', () => {
    const setPalette = vi.fn();
    const setReverbWet = vi.fn();
    const setGraphicsEnabled = vi.fn();
    const setIsDarkMode = vi.fn();

    render(
      <ControlsPanel
        currentPalette="neon"
        setCurrentPalette={setPalette}
        isDarkMode={true}
        setIsDarkMode={setIsDarkMode}
        reverbWet={0.4}
        setReverbWet={setReverbWet}
        graphicsEnabled={true}
        setGraphicsEnabled={setGraphicsEnabled}
      />
    );

    // Palette select exists and can change
    const select = screen.getByDisplayValue('🌟 Neon (Pentatonic)');
    fireEvent.change(select, { target: { value: 'ocean' } });
    expect(setPalette).toHaveBeenCalledWith('ocean');

    // Reverb slider
    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '0.75' } });
    expect(setReverbWet).toHaveBeenCalledWith(0.75);

    // Graphics toggle
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    expect(setGraphicsEnabled).toHaveBeenCalledWith(false);
  });

  it('toggles theme between dark and light', () => {
    const setIsDarkMode = vi.fn();
    render(
      <ControlsPanel
        currentPalette="neon"
        setCurrentPalette={vi.fn()}
        isDarkMode={true}
        setIsDarkMode={setIsDarkMode}
        reverbWet={0.4}
        setReverbWet={vi.fn()}
        graphicsEnabled={true}
        setGraphicsEnabled={vi.fn()}
      />
    );

    const themeButton = screen.getByRole('button', { name: /Dark|Light/ });
    fireEvent.click(themeButton);
    expect(setIsDarkMode).toHaveBeenCalledWith(false);
  });
});
