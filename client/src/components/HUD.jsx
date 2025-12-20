// File: HUD.jsx
import React from 'react';

export const HUD = ({ isAudioReady, isConnected, energyLevel, cps, combo, getComboMultiplier, userCount, contest, mobile = false }) => {
  return (
    <>
      {/* User Count Indicator - Bottom Right */}
      <div style={{
        position: 'absolute',
        bottom: '2rem',
        right: mobile ? 'auto' : '2rem',
        left: mobile ? '2rem' : 'auto',
        backdropFilter: 'blur(16px)',
        background: 'rgba(255, 255, 255, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '9999px',
        padding: mobile ? '0.5rem 1rem' : '0.75rem 1.5rem',
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: mobile ? '0.8rem' : '0.875rem' }}>
          <span style={{ color: isConnected ? '#4ade80' : '#ef4444' }}>●</span>
          <span style={{ fontWeight: 500 }}>
            {userCount} {userCount === 1 ? 'user' : 'users'} jamming
          </span>
        </div>
      </div>

      {/* Status Indicator - Top Left */}
      {isAudioReady && (
        <div style={{
          position: 'absolute',
          top: '2rem',
          left: '2rem',
          backdropFilter: 'blur(16px)',
          background: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '0.5rem',
          padding: mobile ? '0.5rem 0.75rem' : '0.75rem 1rem',
          zIndex: 10,
          minWidth: '210px'
        }}>
          <div style={{ fontSize: mobile ? '0.8rem' : '0.875rem', fontWeight: 500 }}>🎵 Audio: Active</div>
          <div style={{ fontSize: mobile ? '0.7rem' : '0.75rem', color: 'rgba(255, 255, 255, 0.6)', marginTop: '0.25rem' }}>
            {isConnected ? '🟢 Connected' : '🔴 Connecting...'}
          </div>
          {/* Energy Bar */}
          <div style={{ marginTop: '0.5rem' }}>
            <div style={{ fontSize: mobile ? '0.7rem' : '0.75rem', marginBottom: '0.25rem' }}>⚡ Energy ({cps} CPS)</div>
            <div style={{ height: '8px', background: 'rgba(255,255,255,0.15)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{
                width: `${Math.min(100, (energyLevel / 20) * 100)}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #00ffff, #ff00ff)',
                boxShadow: '0 0 12px rgba(255,255,255,0.3)'
              }} />
            </div>
          </div>
          {combo > 0 && (
            <div style={{ fontSize: mobile ? '0.7rem' : '0.75rem', color: '#ffd700', marginTop: '0.5rem', fontWeight: 600 }}>
              🔥 Combo: {combo}x {getComboMultiplier()}
            </div>
          )}
        </div>
      )}

      {/* Contest Bar - Top Center */}
      {contest?.active && (
        <div style={{
          position: 'absolute',
          top: '2rem',
          left: '50%',
          transform: 'translateX(-50%)',
          backdropFilter: 'blur(16px)',
          background: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '0.5rem',
          padding: mobile ? '0.5rem 0.75rem' : '0.75rem 1rem',
          zIndex: 11,
          minWidth: mobile ? '240px' : '320px',
          color: '#fff'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <div style={{ fontSize: mobile ? '0.8rem' : '0.875rem', fontWeight: 600 }}>🎮 Contest</div>
            <div style={{ fontSize: mobile ? '0.8rem' : '0.875rem' }}>⏱ {contest.remaining}s</div>
          </div>
          <div style={{ marginTop: '0.5rem' }}>
            {(contest.leaderboard || []).slice(0, 3).map((p, idx) => (
              <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: mobile ? '0.75rem' : '0.8rem' }}>
                <span>#{idx + 1} {p.name}</span>
                <span>{p.beats} beats • peak {p.peakCps} CPS</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};
