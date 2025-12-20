import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { ControlsPanel } from '../ControlsPanel';

describe('ControlsPanel', () => {
  it('changes palette, reverb, and bloom intensity', () => {
    const setPalette = vi.fn();
    const setReverbWet = vi.fn();
    const setBloomIntensity = vi.fn();
    const toggleTheme = vi.fn();

    render(
      <ControlsPanel
        currentPalette="neon"
        setCurrentPalette={setPalette}
        theme="dark"
        toggleTheme={toggleTheme}
        reverbWet={0.4}
        setReverbWet={setReverbWet}
        bloomIntensity={2.0}
        setBloomIntensity={setBloomIntensity}
      />
    );

    // Palette select exists and can change
    const select = screen.getByDisplayValue('Neon Pentatonic');
    fireEvent.change(select, { target: { value: 'ocean' } });
    expect(setPalette).toHaveBeenCalledWith('ocean');

    // Reverb slider
    const sliders = screen.getAllByRole('slider');
    fireEvent.change(sliders[0], { target: { value: '0.75' } });
    expect(setReverbWet).toHaveBeenCalledWith(0.75);

    // Bloom intensity slider
    fireEvent.change(sliders[1], { target: { value: '3.4' } });
    expect(setBloomIntensity).toHaveBeenCalledWith(3.4);

    // Theme toggle button
    const themeButton = screen.getByRole('button', { name: /Light|Dark/ });
    fireEvent.click(themeButton);
    expect(toggleTheme).toHaveBeenCalled();
  });
});
