import React from 'react';

export const Onboarding = ({ onClose, onStartTutorial }) => {
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="glass-panel" style={{ width: 'min(600px, 90vw)', padding: '30px' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 200, marginBottom: '20px', color: 'var(--color-text)' }}>WELCOME TO <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>SONIC CANVAS</span></h2>
        
        <div style={{ display: 'grid', gap: '15px', marginBottom: '30px' }}>
          <div style={{ display: 'flex', gap: '15px' }}>
            <span style={{ fontSize: '1.5rem' }}>👆</span>
            <div>
              <strong style={{ color: 'var(--color-text)' }}>Click & Create</strong>
              <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Tap anywhere to drop physics-based notes. High energy = more visuals.</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '15px' }}>
            <span style={{ fontSize: '1.5rem' }}>🎛️</span>
            <div>
              <strong style={{ color: 'var(--color-text)' }}>Control Your Sound</strong>
              <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Use the right panel to switch scales (Neon, Ocean, Sunset) and adjust reverb.</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '15px' }}>
            <span style={{ fontSize: '1.5rem' }}>🌗</span>
            <div>
              <strong style={{ color: 'var(--color-text)' }}>Theme Switching</strong>
              <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Toggle between Cyber Dark and Studio Light modes.</div>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={onStartTutorial} className="glass-button-primary" style={{ flex: 1 }}>Start Tutorial</button>
          <button onClick={onClose} className="glass-button" style={{ flex: 1 }}>Skip</button>
        </div>
      </div>
    </div>
  );
};