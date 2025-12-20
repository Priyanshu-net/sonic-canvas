import React, { useState } from 'react';

export const MobileToolbar = ({
  isAudioReady,
  startAudio,
  theme,
  toggleTheme,
  graphicsEnabled,
  setGraphicsEnabled,
  hapticsEnabled,
  setHapticsEnabled,
  contest,
  startContest,
  userName,
  setName,
}) => {
  const [nameEditing, setNameEditing] = useState(false);
  const [nameInput, setNameInput] = useState(userName || '');

  const barStyle = {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1100,
    padding: '10px',
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
    justifyContent: 'space-around',
    background: 'var(--color-bg-glass)',
    backdropFilter: 'blur(8px)',
    borderTop: '1px solid var(--color-border)',
  };

  const buttonStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    color: 'var(--color-text)',
    fontSize: '0.75rem',
  };

  return (
    <div style={barStyle}>
      {!isAudioReady ? (
        <button className="glass-button-hero" onClick={startAudio} style={{ flex: 1 }}>🎧 Initialize</button>
      ) : (
        <>
          <button className="glass-button" onClick={toggleTheme} style={buttonStyle} aria-label="Toggle Theme">
            <span>{theme === 'dark' ? '☀️' : '🌙'}</span>
            <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
          </button>

          <button className="glass-button" onClick={() => setGraphicsEnabled(!graphicsEnabled)} style={buttonStyle} aria-label="Toggle Graphics">
            <span>✨</span>
            <span>{graphicsEnabled ? 'Graphics' : 'Basic'}</span>
          </button>

          <button className="glass-button" onClick={() => setHapticsEnabled(!hapticsEnabled)} style={buttonStyle} aria-label="Toggle Haptics">
            <span>📳</span>
            <span>{hapticsEnabled ? 'Haptics' : 'Off'}</span>
          </button>

          <button className="glass-button" onClick={() => startContest?.(30)} style={buttonStyle} aria-label="Start Contest">
            <span>🏁</span>
            <span>Contest</span>
          </button>

          <div style={{ ...buttonStyle }}>
            {!nameEditing ? (
              <button className="glass-button" onClick={() => setNameEditing(true)} aria-label="Edit Name">
                <span>👤</span>
                <span>{userName?.trim() || 'Set Name'}</span>
              </button>
            ) : (
              <div style={{ display: 'flex', gap: 6 }}>
                <input
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="Your name"
                  className="glass-input"
                  style={{ width: 120 }}
                />
                <button className="glass-button-primary" onClick={() => { setName?.(nameInput); setNameEditing(false); }}>Save</button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
