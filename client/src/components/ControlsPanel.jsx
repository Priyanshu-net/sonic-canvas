import React from 'react';

export const ControlsPanel = ({ 
  currentPalette, setCurrentPalette, bloomIntensity, setBloomIntensity,
  isDarkMode, setIsDarkMode, reverbWet, setReverbWet, 
  graphicsEnabled, setGraphicsEnabled, mobile 
}) => {
  const theme = {
    panel: isDarkMode ? 'rgba(20, 20, 20, 0.75)' : 'rgba(255, 255, 255, 0.85)',
    text: isDarkMode ? '#fff' : '#111',
    inputBg: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
    border: isDarkMode ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'
  };

  const containerStyle = {
    position: 'absolute', top: '2rem', right: '2rem', width: '280px',
    backdropFilter: 'blur(24px)', background: theme.panel, border: `1px solid ${theme.border}`,
    borderRadius: '16px', padding: '1.25rem', zIndex: 30, color: theme.text,
    boxShadow: '0 8px 32px rgba(0,0,0,0.2)', transition: 'background 0.3s'
  };

  const labelStyle = { fontSize: '0.7rem', fontWeight: 700, opacity: 0.6, textTransform: 'uppercase', marginBottom: '6px', display: 'block' };

  return (
    <div style={containerStyle}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem'}}>
        <h3 style={{ margin: 0, fontSize: '0.9rem', letterSpacing: '0.1em' }}>SYSTEM</h3>
        <button 
          onClick={() => setIsDarkMode(!isDarkMode)}
          style={{ 
            background: 'transparent', border: `1px solid ${theme.border}`, borderRadius: '20px', 
            padding: '4px 10px', fontSize: '0.75rem', cursor: 'pointer', color: theme.text 
          }}
        >
          {isDarkMode ? '🌙 Dark' : '☀️ Light'}
        </button>
      </div>

      <div style={{ marginBottom: '1.25rem' }}>
        <label style={labelStyle}>Palette</label>
        <select 
          value={currentPalette} 
          onChange={(e) => setCurrentPalette(e.target.value)}
          style={{ width: '100%', padding: '10px', borderRadius: '8px', background: theme.inputBg, color: theme.text, border: 'none', outline:'none' }}
        >
          <option value="neon">🌟 Neon (Pentatonic)</option>
          <option value="sunset">🌅 Sunset (Major)</option>
          <option value="ocean">🌊 Ocean (Minor)</option>
          <option value="galaxy">✨ Galaxy (Blues)</option>
        </select>
      </div>

      <div style={{ marginBottom: '1.25rem' }}>
        <label style={labelStyle}>Reverb Atmosphere ({Math.round(reverbWet * 100)}%)</label>
        <input 
          type="range" min="0" max="1" step="0.01" 
          value={reverbWet} onChange={(e) => setReverbWet(parseFloat(e.target.value))}
          style={{ width: '100%', accentColor: '#00ffff', height: '4px', borderRadius: '2px' }}
        />
      </div>

      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <input 
          type="checkbox" checked={graphicsEnabled} onChange={(e) => setGraphicsEnabled(e.target.checked)} 
          style={{width: '16px', height: '16px'}}
        />
        <span style={{ fontSize: '0.8rem' }}>3D Graphics</span>
      </div>
    </div>
  );
};