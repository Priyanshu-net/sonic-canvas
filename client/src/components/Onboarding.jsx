// File: Onboarding.jsx
import React from 'react';

export const Onboarding = ({ onClose }) => {
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 30,
      background: 'rgba(5,5,5,0.88)', display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{
        width: 'min(680px, 90vw)', borderRadius: '1rem', padding: '1.5rem',
        background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.18)', color: '#fff'
      }}>
        <h2 style={{ margin: 0, fontWeight: 600, letterSpacing: '0.03em' }}>Welcome to Sonic Canvas</h2>
        <p style={{ opacity: 0.8, marginTop: '0.75rem' }}>
          Create music with clicks, see 3D collisions sparkle, and jam together in real-time.
        </p>
        <ul style={{ listStyle: 'none', padding: 0, marginTop: '1rem', display: 'grid', gap: '0.5rem' }}>
          <li>• Click “Start Audio”, then click anywhere on the canvas</li>
          <li>• Use keys A/S/D/F/G/H for quick notes</li>
          <li>• Pick a palette for different sounds (Neon, Sunset, Ocean, Galaxy)</li>
          <li>• Join a room and invite friends to play together</li>
        </ul>
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
          <button onClick={onClose} style={{
            padding: '0.75rem 1rem', borderRadius: '0.75rem', cursor: 'pointer',
            background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: '#fff'
          }}>Got it</button>
          <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>Tip: Enable haptics on mobile for tactile feedback</span>
        </div>
      </div>
    </div>
  );
};
