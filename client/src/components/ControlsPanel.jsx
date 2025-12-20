// File: ControlsPanel.jsx
import React, { useState } from 'react';

export const ControlsPanel = ({ currentPalette, setCurrentPalette, bloomIntensity, setBloomIntensity, room, joinRoom, userName = '', setName = () => {}, hapticsEnabled = true, setHapticsEnabled = () => {}, reverbWet = 0.4, setReverbWet = () => {}, onInviteCopy = () => {}, mobile = false, onStartContest = () => {}, messages = [], sendMessage = () => {}, graphicsEnabled = true, setGraphicsEnabled = () => {} }) => {
  const [roomInput, setRoomInput] = useState(room || 'lobby');
  const [nameInput, setNameInput] = useState(userName || '');
  const [chatInput, setChatInput] = useState('');
  const containerStyle = mobile ? {
    position: 'fixed',
    bottom: '1rem',
    left: '1rem',
    right: '1rem',
    width: 'auto',
    maxWidth: 'calc(100% - 2rem)',
    backdropFilter: 'blur(16px)',
    background: 'rgba(0, 0, 0, 0.35)',
    border: '1px solid rgba(255, 255, 255, 0.25)',
    borderRadius: '0.75rem',
    padding: '0.75rem',
  zIndex: 40,
    color: '#fff'
  } : {
    position: 'absolute',
    top: '2rem',
    right: '2rem',
    width: '260px',
    backdropFilter: 'blur(16px)',
    background: 'rgba(255, 255, 255, 0.08)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '0.75rem',
    padding: '1rem',
    zIndex: 30,
    color: '#fff'
  };

  return (
    <div style={containerStyle}>
  <div style={{ fontSize: mobile ? '0.85rem' : '0.9rem', fontWeight: 600, marginBottom: '0.5rem', letterSpacing: '0.08em' }}>Controls</div>

      {/* Palette Selector */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.75rem', opacity: 0.7, marginBottom: '0.25rem' }}>Color & Sound Palette</div>
        <select
          value={currentPalette}
          onChange={(e) => setCurrentPalette(e.target.value)}
          style={{
            width: '100%',
            background: 'rgba(0,0,0,0.3)',
            border: '1px solid rgba(255,255,255,0.2)',
            color: '#fff',
            borderRadius: '0.5rem',
            padding: '0.5rem'
          }}
        >
          <option value="neon">🌟 Neon - Pentatonic (Bright)</option>
          <option value="sunset">🌅 Sunset - Major (Uplifting)</option>
          <option value="ocean">🌊 Ocean - Minor (Moody)</option>
          <option value="galaxy">✨ Galaxy - Blues (Soulful)</option>
        </select>
        <div style={{ fontSize: '0.65rem', opacity: 0.6, marginTop: '0.25rem', fontStyle: 'italic' }}>
          Each palette has unique sounds & scales
        </div>
      </div>

      {/* Bloom Intensity */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.75rem', opacity: 0.7, marginBottom: '0.25rem' }}>Glow (Bloom)</div>
        <input
          type="range"
          min="0"
          max="4"
          step="0.1"
          aria-label="Bloom Intensity"
          value={bloomIntensity}
          onChange={(e) => setBloomIntensity(parseFloat(e.target.value))}
          style={{ width: '100%' }}
        />
        <div style={{ fontSize: mobile ? '0.7rem' : '0.75rem', opacity: 0.7 }}>Intensity: {bloomIntensity.toFixed(1)}</div>
      </div>

      {/* Audio Reverb */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.75rem', opacity: 0.7, marginBottom: '0.25rem' }}>Reverb Wet</div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          aria-label="Reverb Wet"
          value={reverbWet}
          onChange={(e) => setReverbWet(parseFloat(e.target.value))}
          style={{ width: '100%' }}
        />
        <div style={{ fontSize: mobile ? '0.7rem' : '0.75rem', opacity: 0.7 }}>Wet: {reverbWet.toFixed(2)}</div>
        <div style={{ fontSize: mobile ? '0.7rem' : '0.75rem', opacity: 0.75, marginTop: '0.25rem', lineHeight: 1.4 }}>
          Tip: Wet controls how much of the echo/reverb you hear — 0 is dry, 1 is cavernous.
          {mobile ? ' On mobile, keep it at or below ~0.4 for smoother performance.' : ' Higher wet values add ambience but may cost some performance.'}
        </div>
      </div>

      {/* Haptics Toggle */}
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input
            type="checkbox"
            checked={hapticsEnabled}
            onChange={(e) => setHapticsEnabled(e.target.checked)}
          />
          <span style={{ fontSize: '0.85rem' }}>Haptics (vibrate on mobile)</span>
        </label>
      </div>

      {/* Graphics Toggle (Perf) */}
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input
            type="checkbox"
            checked={!!graphicsEnabled}
            onChange={(e) => setGraphicsEnabled(e.target.checked)}
          />
          <span style={{ fontSize: '0.85rem' }}>Graphics (3D) Enabled</span>
        </label>
        <div style={{ fontSize: mobile ? '0.7rem' : '0.75rem', opacity: 0.7, marginTop: '0.25rem' }}>
          Turn off if your device hangs. Audio still works.
        </div>
      </div>

      {/* Room & Chat moved to left-side panels */}

      {/* Help */}
      <div style={{ fontSize: mobile ? '0.7rem' : '0.75rem', opacity: 0.8, lineHeight: 1.4 }}>
        Tip: Click anywhere to drop a marble. Notes play when it hits the glass. Faster clicks raise energy → more shake, brighter glow, and spikier shapes.
      </div>
    </div>
  );
};
