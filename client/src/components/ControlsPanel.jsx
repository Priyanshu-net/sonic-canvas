import React from 'react';
import { Panel } from './Panel';

export const ControlsPanel = ({ theme, toggleTheme, currentPalette, setCurrentPalette, bloomIntensity, setBloomIntensity, reverbWet, setReverbWet, initialX, initialY }) => {
  return (
    <Panel title="System Controls" initialX={initialX} initialY={initialY}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <span style={{ fontSize: '0.8rem' }}>Interface Theme</span>
        <button onClick={toggleTheme} className="glass-button">{theme === 'dark' ? '☀️ Light' : '🌙 Dark'}</button>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label className="label-text">AUDIO PALETTE</label>
        <select value={currentPalette} onChange={(e) => setCurrentPalette(e.target.value)} className="glass-select">
          <option value="neon">Neon Pentatonic</option>
          <option value="sunset">Sunset Major</option>
          <option value="ocean">Ocean Minor</option>
          <option value="galaxy">Galaxy Blues</option>
        </select>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', marginBottom: '4px' }}>
          <label className="label-text">REVERB WET</label>
          <span>{Math.round(reverbWet * 100)}%</span>
        </div>
        <input type="range" min="0" max="1" step="0.01" value={reverbWet} onChange={(e) => setReverbWet(parseFloat(e.target.value))} style={{ width: '100%' }} />
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', marginBottom: '4px' }}>
          <label className="label-text">GLOW INTENSITY</label>
          <span>{Number.isFinite(bloomIntensity) ? bloomIntensity.toFixed(1) : (2.0).toFixed(1)}</span>
        </div>
        <input type="range" min="0" max="4" step="0.1" value={Number.isFinite(bloomIntensity) ? bloomIntensity : 2.0} onChange={(e) => setBloomIntensity(parseFloat(e.target.value))} style={{ width: '100%' }} />
      </div>
    </Panel>
  );
};