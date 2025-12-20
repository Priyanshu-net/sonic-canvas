import React, { useState, useEffect, useRef } from 'react';
import { Panel } from './Panel';

export const ChatPanel = ({ messages = [], sendMessage, initialX, initialY }) => {
  const [input, setInput] = useState('');
  const scrollRef = useRef();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input);
    setInput('');
  };

  return (
    <Panel title="Studio Chat" initialX={initialX} initialY={initialY} initialHeight={240}>
      <div 
        ref={scrollRef}
        style={{ 
          height: '120px', 
          overflowY: 'auto', 
          background: 'var(--color-bg-inset)', 
          borderRadius: '8px',
          padding: '10px',
          marginBottom: '12px'
        }}
        className="custom-scrollbar"
      >
        {messages.map((m, i) => (
          <div key={i} style={{ fontSize: '0.8rem', marginBottom: '6px' }}>
            <span style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>{m.from}</span>: 
            <span style={{ color: 'var(--color-text)', marginLeft: '5px' }}>{m.text}</span>
          </div>
        ))}
      </div>
      
      <div style={{ display: 'flex', gap: '8px' }}>
        <input 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Message..."
          className="glass-input"
          style={{ flex: 1 }}
        />
        <button onClick={handleSend} className="glass-button">Send</button>
      </div>
    </Panel>
  );
};