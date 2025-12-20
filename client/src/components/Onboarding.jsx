import React from 'react';

export const Onboarding = ({ onClose, isDarkMode = true }) => {
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 100,
      background: isDarkMode ? 'rgba(5,5,5,0.85)' : 'rgba(240,240,240,0.85)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(12px)'
    }}>
      <div style={{
        width: 'min(480px, 90vw)', textAlign: 'center', padding: '3rem',
        background: isDarkMode ? '#111' : '#fff',
        border: `1px solid ${isDarkMode ? '#333' : '#eee'}`,
        borderRadius: '24px', color: isDarkMode ? '#fff' : '#111',
        boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
      }}>
        <h1 style={{ fontSize: '2rem', margin: '0 0 1rem 0', fontWeight: 800, letterSpacing: '-0.02em' }}>SONIC CANVAS</h1>
        <p style={{ opacity: 0.7, lineHeight: 1.6, marginBottom: '2.5rem', fontSize: '1rem' }}>
          A multiplayer audiovisual instrument. <br/>
          Click to play. Collisions create notes. <br/>
          Sync with the world.
        </p>
        <button onClick={onClose} style={{
          background: 'linear-gradient(135deg, #00C6FF, #0072FF)', 
          color: 'white', border: 'none', padding: '1rem 3rem',
          borderRadius: '50px', fontSize: '1.1rem', fontWeight: 700, cursor: 'pointer',
          boxShadow: '0 10px 20px rgba(0,114,255,0.3)', transition: 'transform 0.2s',
          transform: 'scale(1)'
        }} 
        onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'} 
        onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}>
          ENTER
        </button>
      </div>
    </div>
  );
};