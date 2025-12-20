import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { ControlsPanel } from '../ControlsPanel';

describe('ControlsPanel', () => {
  it('changes palette and bloom', () => {
    const setPalette = vi.fn();
    const setBloom = vi.fn();

    render(
      <ControlsPanel
        currentPalette="neon"
        setCurrentPalette={setPalette}
        bloomIntensity={2.0}
        setBloomIntensity={setBloom}
      />
    );

    const select = screen.getByDisplayValue('Neon');
    fireEvent.change(select, { target: { value: 'ocean' } });
    expect(setPalette).toHaveBeenCalledWith('ocean');

    const slider = screen.getByLabelText('Bloom Intensity');
    fireEvent.change(slider, { target: { value: '3.1' } });
    expect(setBloom).toHaveBeenCalledWith(3.1);
  });
});
