import React, { useState, useRef } from 'react';

export const Panel = ({ title, initialX, initialY, initialWidth = 330, initialHeight = 220, children, zIndex = 10, mobile = false }) => {
  const [pos, setPos] = useState({ x: initialX, y: initialY });
  const dragging = useRef(false);
  const last = useRef({ x: 0, y: 0 });

  const onMouseDown = (e) => {
    if (e.target.closest('button') || e.target.closest('input')) return;
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

  const onMouseUp = () => { dragging.current = false; };

  const style = {
    position: 'absolute', left: pos.x, top: pos.y, width: initialWidth, zIndex,
    display: 'flex', flexDirection: 'column'
  };

  return (
    <div 
      className="glass-panel" style={style} 
      onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseDown={onMouseDown}
    >
      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border)', cursor: 'grab', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.1em', color: 'var(--color-text-muted)' }}>{title.toUpperCase()}</span>
        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-primary)' }} />
      </div>
      <div style={{ padding: '16px' }}>{children}</div>
    </div>
  );
};