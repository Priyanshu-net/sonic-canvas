// File: ChatPanel.jsx
import React, { useState } from 'react';
import { Panel } from './Panel';

export const ChatPanel = ({ messages = [], sendMessage = () => {}, mobile = false }) => {
  const [chatInput, setChatInput] = useState('');
  const [listHeight, setListHeight] = useState(mobile ? 100 : 160);

  return (
    <Panel title="💬 Room Chat" initialX={20} initialY={260} initialWidth={340} initialHeight={240} zIndex={34} mobile={mobile}>
      <div style={{ marginBottom: '0.5rem' }}>
        <div style={{ maxHeight: `${listHeight}px`, overflowY: 'auto', background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '0.5rem', padding: '0.5rem' }}>
          {(messages || []).slice(-20).map((m) => (
            <div key={m.id} style={{ fontSize: '0.8rem', marginBottom: '0.25rem' }}>
              <strong style={{ color: '#00ffff' }}>{m.from}</strong>: <span>{m.text}</span>
            </div>
          ))}
          {(!messages || messages.length === 0) && (
            <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>No messages yet — say hi!</div>
          )}
        </div>
        {mobile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>List size</span>
            <input type="range" min="60" max="240" step="10" value={listHeight} onChange={(e) => setListHeight(parseInt(e.target.value))} />
          </div>
        )}
      </div>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <input
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { sendMessage(chatInput); setChatInput(''); } }}
          placeholder="Type a message"
          style={{ flex: 1, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: '0.5rem', padding: '0.5rem' }}
        />
        <button
          onClick={() => { sendMessage(chatInput); setChatInput(''); }}
          style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.25)', color: '#fff', borderRadius: '0.5rem', padding: '0.5rem 0.75rem', cursor: 'pointer' }}
        >Send</button>
      </div>
    </Panel>
  );
};
