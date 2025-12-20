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
  // Optional mobile-only utilities
  room,
  joinRoom,
  messages,
  sendMessage,
  bloomIntensity,
  setBloomIntensity,
}) => {
  const [nameEditing, setNameEditing] = useState(false);
  const [nameInput, setNameInput] = useState(userName || '');
  const [roomEditing, setRoomEditing] = useState(false);
  const [roomInput, setRoomInput] = useState(room || '');
  const [showChat, setShowChat] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [showGlow, setShowGlow] = useState(false);

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
            {/* Glow (Bloom) intensity control */}
            {typeof bloomIntensity === 'number' && typeof setBloomIntensity === 'function' && (
              <button className="glass-button" onClick={() => setShowGlow(s => !s)} style={buttonStyle} aria-label="Glow">
                <span>🌟</span>
                <span>Glow</span>
              </button>
            )}

            {/* Chat toggle */}
            {Array.isArray(messages) && typeof sendMessage === 'function' && (
              <button className="glass-button" onClick={() => setShowChat(s => !s)} style={buttonStyle} aria-label="Chat">
                <span>💬</span>
                <span>Chat</span>
              </button>
            )}

            {/* Room quick edit */}
            {typeof joinRoom === 'function' && (
              <button className="glass-button" onClick={() => setRoomEditing(s => !s)} style={buttonStyle} aria-label="Room">
                <span>🏟️</span>
                <span>{room || 'Room'}</span>
              </button>
            )}


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

          {/* Overlays */}
          {roomEditing && (
            <div style={{ position: 'fixed', bottom: 70, left: 10, right: 10, zIndex: 1200, padding: 12, borderRadius: 10, background: 'var(--color-bg-glass)', backdropFilter: 'blur(10px)', border: '1px solid var(--color-border)' }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  value={roomInput}
                  onChange={(e) => setRoomInput(e.target.value)}
                  placeholder="Room Name"
                  className="glass-input"
                  style={{ flex: 1 }}
                />
                <button className="glass-button" onClick={() => { joinRoom?.(roomInput); setRoomEditing(false); }}>Join</button>
              </div>
            </div>
          )}

          {showGlow && (
            <div style={{ position: 'fixed', bottom: 70, left: 10, right: 10, zIndex: 1200, padding: 12, borderRadius: 10, background: 'var(--color-bg-glass)', backdropFilter: 'blur(10px)', border: '1px solid var(--color-border)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label className="label-text">Glow Intensity</label>
                <input
                  type="range"
                  min={0}
                  max={4}
                  step={0.1}
                  value={bloomIntensity}
                  onChange={(e) => setBloomIntensity?.(parseFloat(e.target.value))}
                />
                <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Current: {bloomIntensity?.toFixed?.(1) ?? bloomIntensity}</div>
              </div>
            </div>
          )}

          {showChat && (
            <div style={{ position: 'fixed', bottom: 70, left: 10, right: 10, zIndex: 1200, padding: 12, borderRadius: 10, background: 'var(--color-bg-glass)', backdropFilter: 'blur(10px)', border: '1px solid var(--color-border)' }}>
              <div className="custom-scrollbar" style={{ maxHeight: 150, overflowY: 'auto', marginBottom: 8 }}>
                {(messages || []).slice(-20).map((m, idx) => (
                  <div key={idx} style={{ fontSize: '0.8rem', marginBottom: 4 }}>
                    <strong style={{ opacity: 0.8 }}>{m.userName || 'Anon'}:</strong> <span>{m.text || m.message || ''}</span>
                  </div>
                ))}
                {(messages?.length ?? 0) === 0 && (
                  <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>No messages yet</div>
                )}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Message..."
                  className="glass-input"
                  style={{ flex: 1 }}
                />
                <button
                  className="glass-button"
                  onClick={() => {
                    const text = (chatInput || '').trim();
                    if (!text) return;
                    sendMessage?.(text);
                    setChatInput('');
                  }}
                >Send</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
