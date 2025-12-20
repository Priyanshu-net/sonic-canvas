import React from 'react';

export const HUD = ({ isAudioReady, isConnected, energyLevel, cps, combo, getComboMultiplier, userCount, contest }) => {
  if (!isAudioReady) return null;

  return (
    <div style={{ position: 'absolute', top: '25px', left: '25px', zIndex: 100, width: '260px' }} className="glass-panel">
      <div style={{ padding: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--color-text-muted)' }}>SESSION STATUS</span>
          <span style={{ fontSize: '0.7rem', color: isConnected ? 'var(--color-success)' : 'var(--color-danger)' }}>● {isConnected ? 'LIVE' : 'OFFLINE'}</span>
        </div>

        <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
          <span>Energy</span>
          <span style={{ fontFamily: 'monospace' }}>{cps} CPS</span>
        </div>
        <div style={{ height: '4px', background: 'var(--color-bg-inset)', borderRadius: '2px', overflow: 'hidden' }}>
          <div style={{ width: `${Math.min(100, (energyLevel/20)*100)}%`, height: '100%', background: 'linear-gradient(90deg, var(--color-primary), var(--color-accent))', transition: 'width 0.3s ease' }} />
        </div>

        {combo > 0 && (
          <div style={{ marginTop: '12px', fontSize: '1.2rem', fontWeight: 900, color: 'var(--color-accent)' }}>
            {combo}x <span style={{ fontSize: '0.7rem' }}>{getComboMultiplier()}</span>
          </div>
        )}
        
        {contest?.active && (
           <div style={{ marginTop: '12px', borderTop:'1px solid var(--color-border)', paddingTop:'8px' }}>
              <div style={{fontSize:'0.8rem', fontWeight:'bold', color:'var(--color-warning)'}}>🏆 CONTEST: {contest.remaining}s</div>
              <div style={{fontSize:'0.7rem', opacity:0.8}}>{contest.message || 'Most beats wins!'}</div>
           </div>
        )}
      </div>
    </div>
  );
};