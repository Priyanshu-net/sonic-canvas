import React from 'react';

export const HUD = ({ isAudioReady, isConnected, energyLevel, cps, combo, userCount, contest, isDarkMode = true }) => {
  const isHighEnergy = energyLevel > 15;
  
  const textColor = isDarkMode ? '#fff' : '#222';
  
  return (
    <>
      {/* Top Left Stats */}
      <div style={{
        position: 'absolute', top: '2rem', left: '2rem',
        backdropFilter: 'blur(20px)', borderRadius: '12px', padding: '1rem',
        background: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.6)',
        border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`,
        zIndex: 10, minWidth: '220px',
        boxShadow: isHighEnergy ? '0 0 20px rgba(0,255,255,0.2)' : 'none',
        transition: 'box-shadow 0.3s'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: isConnected ? '#4ade80' : '#ff4444', boxShadow: isConnected ? '0 0 8px #4ade80' : 'none' }} />
          <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', color: textColor }}>
            {isConnected ? 'LIVE' : 'OFFLINE'} • {userCount} PILOTS
          </span>
        </div>

        <div style={{ fontSize: '0.65rem', color: textColor, opacity: 0.6, marginBottom: '6px', fontWeight: 600 }}>ENERGY OUTPUT</div>
        <div style={{ 
          height: '6px', background: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', borderRadius: '3px', overflow: 'hidden'
        }}>
          <div style={{
            width: `${Math.min(100, (energyLevel / 20) * 100)}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #00ffff, #0099ff)',
            transition: 'width 0.1s linear'
          }} />
        </div>
        
        {combo > 5 && (
          <div style={{ 
            marginTop: '12px', fontSize: '1.5rem', fontWeight: '900', color: '#ffcc00', fontStyle: 'italic',
            textShadow: '0 2px 10px rgba(255,204,0,0.5)', animation: 'bounce 0.3s infinite alternate'
          }}>
            {combo}x
          </div>
        )}
      </div>

      {/* Contest Banner */}
      {contest?.active && (
        <div style={{
          position: 'absolute', top: '2rem', left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(255, 50, 50, 0.9)', color: 'white',
          padding: '0.5rem 1.5rem', borderRadius: '30px', 
          fontWeight: 'bold', fontSize: '1rem',
          boxShadow: '0 4px 20px rgba(255,0,0,0.4)', zIndex: 11
        }}>
          ⏱ {contest.remaining}s REMAINING
        </div>
      )}
    </>
  );
};