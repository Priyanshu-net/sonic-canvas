import React, { useState, useEffect, useRef } from 'react';

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
  room,
  joinRoom,
  messages,
  sendMessage,
  bloomIntensity,
  setBloomIntensity,
}) => {
  const [activePopup, setActivePopup] = useState(null); // 'chat' | 'room' | 'settings' | null
  const [localInput, setLocalInput] = useState('');
  const [localName, setLocalName] = useState(userName || '');
  const chatEndRef = useRef(null);

  // Sync props to local state
  useEffect(() => { setLocalName(userName || ''); }, [userName]);

  // Auto-scroll chat
  useEffect(() => {
    if (activePopup === 'chat' && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activePopup]);

  const togglePopup = (view) => {
    setActivePopup(prev => prev === view ? null : view);
  };

  const closePopup = () => setActivePopup(null);

  // --- Styles ---
  const toolbarStyle = {
    position: 'fixed',
    bottom: '20px',
    right: '16px',
    zIndex: 1100,
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    alignItems: 'flex-end',
  };

  const fabStyle = {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.25rem',
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
    padding: 0,
  };

  // Bottom Sheet (Drawer) Style
  const drawerStyle = {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    height: activePopup === 'chat' ? '50vh' : 'auto', // Taller for chat
    maxHeight: '70vh',
    zIndex: 1200,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderTop: '1px solid var(--color-border)',
    display: 'flex',
    flexDirection: 'column',
    animation: 'slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
    paddingBottom: 'safe-area-inset-bottom', // For iPhone Home bar
  };

  return (
    <>
      {/* 1. The Floating Action Toolbar (Right Side) */}
      <div style={toolbarStyle}>
        {!isAudioReady ? (
          <button 
            className="glass-button-hero" 
            onClick={startAudio} 
            aria-label="Initialize"
            style={{ padding: '0.8rem 1.5rem', fontSize: '1rem', whiteSpace: 'nowrap' }}
          >
            🎧 Start
          </button>
        ) : (
          <>
            <button className="glass-button" style={fabStyle} onClick={() => togglePopup('settings')} aria-label="Settings">
              ⚙️
            </button>
            <button className="glass-button" style={fabStyle} onClick={() => togglePopup('room')} aria-label="Edit Name">
              🏷️
            </button>
            <button className="glass-button-primary" style={fabStyle} onClick={() => togglePopup('chat')} aria-label="Chat">
              💬
            </button>
            <button className="glass-button" style={fabStyle} onClick={toggleTheme} aria-label="Toggle Theme">
              🌗
            </button>
          </>
        )}
      </div>

      {/* 2. The Bottom Sheet / Drawer Overlay */}
      {activePopup && (
        <>
          {/* Click backdrop to close */}
          <div 
            style={{ position: 'fixed', inset: 0, zIndex: 1150, background: 'rgba(0,0,0,0.2)' }} 
            onClick={closePopup}
          />
          
          <div className="glass-panel" style={drawerStyle}>
            {/* Drawer Header */}
            <div style={{ 
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
              padding: '12px 16px', borderBottom: '1px solid var(--color-border)',
              background: 'rgba(0,0,0,0.1)' 
            }}>
              <span style={{ fontWeight: 700, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {activePopup === 'chat' && 'Live Chat'}
                {activePopup === 'room' && 'Room & Identity'}
                {activePopup === 'settings' && 'Controls'}
              </span>
              <button 
                onClick={closePopup} 
                style={{ background: 'transparent', border: 'none', color: 'var(--color-text)', fontSize: '1.2rem', padding: '4px' }}
              >
                ✕
              </button>
            </div>

            {/* Drawer Content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }} className="custom-scrollbar">
              
              {/* --- CHAT VIEW --- */}
              {activePopup === 'chat' && (
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <div style={{ flex: 1, overflowY: 'auto', marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {(messages || []).length === 0 && <div style={{ opacity: 0.5, textAlign: 'center', marginTop: '20px' }}>No messages yet.</div>}
                    {messages.map((m, i) => (
                      <div key={i} style={{ fontSize: '0.9rem', background: 'var(--color-bg-inset)', padding: '8px 12px', borderRadius: '8px' }}>
                        <span style={{ color: 'var(--color-primary)', fontWeight: 600, marginRight: '6px' }}>{m.from}:</span>
                        <span style={{color: 'var(--color-text)'}}>{m.text}</span>
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      className="glass-input"
                      value={localInput}
                      onChange={(e) => setLocalInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { sendMessage?.(localInput); setLocalInput(''); } }}
                      placeholder="Type a message..."
                      style={{ fontSize: '1rem', padding: '10px' }}
                      autoFocus
                    />
                    <button 
                      className="glass-button-primary" 
                      onClick={() => { sendMessage?.(localInput); setLocalInput(''); }}
                      style={{ padding: '0 20px' }}
                    >
                      ➤
                    </button>
                  </div>
                </div>
              )}

              {/* --- ROOM VIEW --- */}
              {activePopup === 'room' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label className="label-text">Your Name</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input 
                        className="glass-input" 
                        value={localName} 
                        onChange={(e) => setLocalName(e.target.value)} 
                        placeholder="Your name"
                      />
                      <button className="glass-button" onClick={() => setName?.(localName)}>Save</button>
                    </div>
                  </div>
                  <div>
                    <label className="label-text">Current Room</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input 
                        className="glass-input" 
                        defaultValue={room} 
                        onBlur={(e) => joinRoom?.(e.target.value)}
                        placeholder="Lobby"
                      />
                      <button className="glass-button" onClick={() => {}}>Join</button>
                    </div>
                  </div>
                </div>
              )}

              {/* --- SETTINGS VIEW --- */}
              {activePopup === 'settings' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <button className="glass-button" onClick={toggleTheme} aria-label="Toggle Theme" style={{ justifyContent: 'center', height: '60px', flexDirection: 'column', gap: '4px' }}>
                    <span style={{fontSize: '1.2rem'}}>{theme === 'dark' ? '☀️' : '🌙'}</span>
                    <span>Theme</span>
                  </button>
                  <button className="glass-button" onClick={() => setGraphicsEnabled(!graphicsEnabled)} style={{ justifyContent: 'center', height: '60px', flexDirection: 'column', gap: '4px' }}>
                    <span style={{fontSize: '1.2rem'}}>✨</span>
                    <span>{graphicsEnabled ? '3D On' : '3D Off'}</span>
                  </button>
                  <button className="glass-button" onClick={() => setHapticsEnabled(!hapticsEnabled)} style={{ justifyContent: 'center', height: '60px', flexDirection: 'column', gap: '4px' }}>
                    <span style={{fontSize: '1.2rem'}}>📳</span>
                    <span>{hapticsEnabled ? 'Haptics' : 'Silent'}</span>
                  </button>
                  <button className="glass-button" onClick={() => startContest?.(30)} style={{ justifyContent: 'center', height: '60px', flexDirection: 'column', gap: '4px', border: '1px solid var(--color-primary)' }}>
                    <span style={{fontSize: '1.2rem'}}>🏁</span>
                    <span>Contest</span>
                  </button>
                  
                  <div style={{ gridColumn: '1 / -1', marginTop: '12px' }}>
                    <label className="label-text">Glow Intensity</label>
                    <input 
                      type="range" min="0" max="3" step="0.1" 
                      value={bloomIntensity} 
                      onChange={(e) => setBloomIntensity?.(parseFloat(e.target.value))}
                      style={{ width: '100%', accentColor: 'var(--color-primary)' }}
                    />
                  </div>
                </div>
              )}

            </div>
          </div>
        </>
      )}
    </>
  );
};