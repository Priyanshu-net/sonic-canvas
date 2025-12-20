import React, { useState } from 'react';
import { Panel } from './Panel';

export const ChatPanel = ({ messages = [], sendMessage, mobile, isDarkMode = true }) => {
  const [chatInput, setChatInput] = useState('');
  
  const theme = {
    bg: isDarkMode ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.5)',
    input: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    text: isDarkMode ? '#eee' : '#333',
    accent: '#00ffff'
  };

  return (
    <Panel title="💬 Comms" initialX={20} initialY={300} initialWidth={340} initialHeight={240} mobile={mobile} isDarkMode={isDarkMode}>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '10px' }}>
        <div style={{ 
          flex: 1, overflowY: 'auto', background: theme.bg, 
          borderRadius: '12px', padding: '10px', 
          fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '6px'
        }}>
          {messages.length === 0 && <div style={{opacity:0.5, fontStyle:'italic'}}>Channel open...</div>}
          {messages.slice(-20).map((m, i) => (
            <div key={i} style={{ lineHeight: '1.3' }}>
              <span style={{ color: theme.accent, fontWeight: '700', fontSize: '0.75rem', marginRight: '6px' }}>{m.from}</span>
              <span style={{ color: theme.text, opacity: 0.9 }}>{m.text}</span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (sendMessage(chatInput), setChatInput(''))}
            placeholder="Transmit..."
            style={{ 
              flex: 1, padding: '10px 14px', borderRadius: '8px', 
              border: 'none', background: theme.input, color: theme.text,
              outline: 'none', fontSize: '0.9rem'
            }}
          />
        </div>
      </div>
    </Panel>
  );
};