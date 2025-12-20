// File: ControlsPanel.jsx
import React, { useState } from 'react';

export const ControlsPanel = ({ currentPalette, setCurrentPalette, bloomIntensity, setBloomIntensity, room, joinRoom, userName = '', setName = () => {}, hapticsEnabled = true, setHapticsEnabled = () => {}, reverbWet = 0.4, setReverbWet = () => {}, onInviteCopy = () => {} }) => {
  const [roomInput, setRoomInput] = useState(room || 'lobby');
  const [nameInput, setNameInput] = useState(userName || '');
  return (
    <div style={{
      position: 'absolute',
      top: '2rem',
      right: '2rem',
      width: '260px',
      backdropFilter: 'blur(16px)',
      background: 'rgba(255, 255, 255, 0.08)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '0.75rem',
      padding: '1rem',
      zIndex: 12,
      color: '#fff'
    }}>
      <div style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem', letterSpacing: '0.08em' }}>Controls</div>

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
        <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>Intensity: {bloomIntensity.toFixed(1)}</div>
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
        <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>Wet: {reverbWet.toFixed(2)}</div>
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

      {/* Rooms */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.75rem', opacity: 0.7, marginBottom: '0.25rem' }}>Room</div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            value={roomInput}
            onChange={(e) => setRoomInput(e.target.value)}
            placeholder="lobby"
            style={{
              flex: 1,
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#fff',
              borderRadius: '0.5rem',
              padding: '0.5rem'
            }}
          />
          <button
            onClick={() => joinRoom && joinRoom(roomInput)}
            style={{
              background: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.25)',
              color: '#fff',
              borderRadius: '0.5rem',
              padding: '0.5rem 0.75rem',
              cursor: 'pointer'
            }}
          >Join</button>
        </div>
        <div style={{ fontSize: '0.7rem', opacity: 0.7, marginTop: '0.25rem' }}>Current: <strong>{room || 'lobby'}</strong></div>
      </div>

      {/* User Name */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.75rem', opacity: 0.7, marginBottom: '0.25rem' }}>Your Name</div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="Anonymous"
            style={{
              flex: 1,
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#fff',
              borderRadius: '0.5rem',
              padding: '0.5rem'
            }}
          />
          <button
            onClick={() => setName && setName(nameInput)}
            style={{
              background: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.25)',
              color: '#fff',
              borderRadius: '0.5rem',
              padding: '0.5rem 0.75rem',
              cursor: 'pointer'
            }}
          >Set</button>
        </div>
      </div>

      {/* Invite Link */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button
          onClick={onInviteCopy}
          title="Copy an invite link to this room"
          style={{
            background: 'rgba(255,255,255,0.12)',
            border: '1px solid rgba(255,255,255,0.25)',
            color: '#fff',
            borderRadius: '0.5rem',
            padding: '0.5rem 0.75rem',
            cursor: 'pointer',
            flex: 1
          }}
        >Copy Invite Link</button>
      </div>

      {/* Help */}
      <div style={{ fontSize: '0.75rem', opacity: 0.8, lineHeight: 1.4 }}>
        Tip: Click anywhere to drop a marble. Notes play when it hits the glass. Faster clicks raise energy → more shake, brighter glow, and spikier shapes.
      </div>
    </div>
  );
};
