// File: Panel.jsx
import React, { useState, useRef } from 'react';

/**
 * Draggable/Resizable Panel wrapper.
 * Props:
 * - title: string
 * - initialX, initialY: number (px)
 * - initialWidth, initialHeight: number (px)
 * - zIndex: number
 * - mobile: boolean
 * - children: ReactNode
 */
export const Panel = ({
  title = '',
  initialX = 20,
  initialY = 80,
  initialWidth = 320,
  initialHeight = 260,
  zIndex = 26,
  mobile = false,
  children
}) => {
  const [pos, setPos] = useState({ x: initialX, y: initialY });
  const [size, setSize] = useState({ w: initialWidth, h: initialHeight });
  const dragging = useRef(false);
  const resizing = useRef(false);
  const last = useRef({ x: 0, y: 0 });

  const onMouseDownContainer = (e) => {
    if (mobile) return; // avoid accidental drags on mobile
    // Skip drag for interactive elements
    const tag = (e.target?.tagName || '').toLowerCase();
    const interactive = ['input','textarea','select','button','a','label'];
    if (interactive.includes(tag)) return;
    dragging.current = true;
    last.current = { x: e.clientX, y: e.clientY };
    e.preventDefault();
  };
  const onMouseDownResize = (e) => {
    if (mobile) return;
    resizing.current = true;
    last.current = { x: e.clientX, y: e.clientY };
    e.preventDefault();
  };
  const onMouseMove = (e) => {
    if (dragging.current) {
      const dx = e.clientX - last.current.x;
      const dy = e.clientY - last.current.y;
      last.current = { x: e.clientX, y: e.clientY };
      setPos((p) => ({ x: Math.max(0, p.x + dx), y: Math.max(0, p.y + dy) }));
    } else if (resizing.current) {
      const dx = e.clientX - last.current.x;
      const dy = e.clientY - last.current.y;
      last.current = { x: e.clientX, y: e.clientY };
      setSize((s) => ({ w: Math.max(240, s.w + dx), h: Math.max(160, s.h + dy) }));
    }
  };
  const onMouseUp = () => {
    dragging.current = false;
    resizing.current = false;
  };

  const containerStyle = mobile ? {
    position: 'fixed',
    left: '1rem',
    right: '1rem',
    top: `${pos.y}px`,
    width: 'auto',
    maxWidth: 'calc(100% - 2rem)',
    maxHeight: '50vh',
    overflow: 'auto',
    backdropFilter: 'blur(16px)',
    background: 'rgba(0, 0, 0, 0.35)',
    border: '1px solid rgba(255, 255, 255, 0.25)',
    borderRadius: '0.75rem',
    padding: '0.75rem',
    zIndex,
    color: '#fff'
  } : {
    position: 'absolute',
    left: `${pos.x}px`,
    top: `${pos.y}px`,
    width: `${size.w}px`,
    height: `${size.h}px`,
    overflow: 'auto',
    backdropFilter: 'blur(16px)',
    background: 'rgba(255, 255, 255, 0.08)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '0.75rem',
    padding: '0.75rem',
    zIndex,
    color: '#fff'
  };

  return (
    <div style={containerStyle} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseDown={onMouseDownContainer}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <div style={{ fontSize: mobile ? '0.85rem' : '0.9rem', fontWeight: 600, letterSpacing: '0.08em', cursor: mobile ? 'default' : 'move' }}>{title}</div>
        {!mobile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>drag to move</span>
            <div
              onMouseDown={onMouseDownResize}
              title="Resize"
              style={{ width: 16, height: 16, borderBottom: '2px solid rgba(255,255,255,0.6)', borderRight: '2px solid rgba(255,255,255,0.6)', cursor: 'nwse-resize' }}
            />
          </div>
        )}
      </div>
      <div>
        {children}
      </div>
    </div>
  );
};
