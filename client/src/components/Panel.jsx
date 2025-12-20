import React, { useState, useRef } from 'react';

export const Panel = ({ title, initialX, initialY, initialWidth, initialHeight, mobile, isDarkMode, children }) => {
  const [pos, setPos] = useState({ x: initialX, y: initialY });
  const dragging = useRef(false);
  const last = useRef({ x: 0, y: 0 });

  const theme = {
    bg: isDarkMode ? 'rgba(20, 20, 20, 0.7)' : 'rgba(255, 255, 255, 0.75)',
    border: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
    text: isDarkMode ? '#fff' : '#111',
    header: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'
  };

  const onMouseDown = (e) => {
    if (mobile || ['INPUT','BUTTON','SELECT'].includes(e.target.tagName)) return;
    dragging.current = true;
    last.current = { x: e.clientX, y: e.clientY };
  };

  const onMouseMove = (e) => {
    if (!dragging.current) return;
    const dx = e.clientX - last.current.x;
    const dy = e.clientY - last.current.y;
    last.current = { x: e.clientX, y: e.clientY };
    setPos(p => ({ x: p.x + dx, y: p.y + dy }));
  };

  return (
    <div 
      onMouseMove={onMouseMove} onMouseUp={() => dragging.current = false} onMouseLeave={() => dragging.current = false}
      style={{
        position: mobile ? 'fixed' : 'absolute', 
        left: mobile ? '1rem' : pos.x, top: mobile ? 'auto' : pos.y, 
        bottom: mobile ? '6rem' : 'auto',
        width: mobile ? 'calc(100% - 2rem)' : initialWidth, 
        height: mobile ? '40vh' : initialHeight,
        background: theme.bg, backdropFilter: 'blur(20px)', borderRadius: '16px',
        border: `1px solid ${theme.border}`, display: 'flex', flexDirection: 'column',
        overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.1)', zIndex: 20
      }}
    >
      <div onMouseDown={onMouseDown} style={{ 
        padding: '10px 16px', background: theme.header, cursor: mobile ? 'default' : 'grab',
        borderBottom: `1px solid ${theme.border}`, display: 'flex', alignItems:'center'
      }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ff5f57', marginRight: 6 }}></div>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', color: theme.text, opacity: 0.7 }}>{title}</span>
      </div>
      <div style={{ flex: 1, padding: '16px', overflowY: 'auto', color: theme.text }}>
        {children}
      </div>
    </div>
  );
};