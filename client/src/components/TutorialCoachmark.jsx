import React, { useEffect, useMemo, useState } from 'react';

// Simple, lightweight coachmark/spotlight overlay to guide users
export const TutorialCoachmark = ({ tutorial, isAudioReady }) => {
  const { current, skip, next, back, variant, done, started } = tutorial || {};
  const [rect, setRect] = useState(null);

  const shouldShow = useMemo(() => {
    if (!tutorial || done) return false;
    if (!started) return false;
    if (variant === 'off' || variant === 'control') return false;
    // Gate all steps after audio-init until audio is ready
    if (current && current.id !== 'audio-init' && !isAudioReady) return false;
    if (!current || !current.anchor || current.id === 'complete') return false;
    return true;
  }, [tutorial, done, started, variant, current, isAudioReady]);

  useEffect(() => {
    if (!shouldShow) { setRect(null); return; }
    const el = document.querySelector(current.anchor);
    if (!el) { setRect(null); return; }
    const r = el.getBoundingClientRect();
    setRect({ x: r.left + window.scrollX, y: r.top + window.scrollY, w: r.width, h: r.height });
  }, [shouldShow, current?.anchor]);

  if (!shouldShow) return null;

  const nextDisabled = (current?.id === 'audio-init' && !isAudioReady);

  const padding = 8;
  const highlightStyle = rect ? {
    position: 'absolute',
    left: rect.x - padding,
    top: rect.y - padding,
    width: rect.w + padding * 2,
    height: rect.h + padding * 2,
    borderRadius: '10px',
    boxShadow: '0 0 0 9999px rgba(0,0,0,0.45)',
    outline: '2px solid var(--color-primary)',
    zIndex: 3000,
    pointerEvents: 'none',
    transition: 'all 0.2s ease'
  } : { display: 'none' };

  const cardStyle = {
    position: 'fixed',
    left: 16,
    right: 16,
    bottom: 24,
    zIndex: 3001,
    padding: '16px',
    background: 'var(--color-bg)',
    border: '1px solid var(--color-border)',
    borderRadius: '12px',
  };

  return (
    <>
  {rect && <div style={highlightStyle} aria-hidden="true" />}
      <div className="glass-panel" role="dialog" aria-live="polite" style={cardStyle}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: '0.9rem', marginBottom: 4 }}>{current.title}</div>
            <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>{current.description}</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="glass-button" onClick={back} aria-label="Back">◀</button>
            <button className="glass-button" disabled={nextDisabled} onClick={() => { if (!nextDisabled) next(); }} aria-label="Next">Next ▶</button>
            <button className="glass-button" onClick={skip} aria-label="Skip">Skip</button>
          </div>
        </div>
      </div>
    </>
  );
};
