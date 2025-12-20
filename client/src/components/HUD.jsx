// File: HUD.jsx
import React from 'react';

export const HUD = ({ isAudioReady, isConnected, energyLevel, cps, combo, getComboMultiplier, userCount }) => {
  return (
    <>
      {/* User Count Indicator - Bottom Right */}
      <div style={{
        position: 'absolute',
        bottom: '2rem',
        right: '2rem',
        backdropFilter: 'blur(16px)',
        background: 'rgba(255, 255, 255, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '9999px',
        padding: '0.75rem 1.5rem',
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
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
          padding: '0.75rem 1rem',
          zIndex: 10,
          minWidth: '210px'
        }}>
          <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>🎵 Audio: Active</div>
          <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)', marginTop: '0.25rem' }}>
            {isConnected ? '🟢 Connected' : '🔴 Connecting...'}
          </div>
          {/* Energy Bar */}
          <div style={{ marginTop: '0.5rem' }}>
            <div style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>⚡ Energy ({cps} CPS)</div>
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
            <div style={{ fontSize: '0.75rem', color: '#ffd700', marginTop: '0.5rem', fontWeight: 600 }}>
              🔥 Combo: {combo}x {getComboMultiplier()}
            </div>
          )}
        </div>
      )}
    </>
  );
};
