import React from 'react';

export const UsersPanel = ({ users = [], room = 'lobby', isDarkMode, mobile }) => {
  const theme = {
    bg: isDarkMode ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.6)',
    text: isDarkMode ? '#fff' : '#111'
  };

  return (
    <div style={{
      position: 'absolute', bottom: mobile ? 'auto' : '2rem', top: mobile ? '6rem' : 'auto', 
      right: mobile ? '1rem' : '2rem', width: '260px',
      background: theme.bg, backdropFilter: 'blur(16px)', borderRadius: '12px',
      padding: '1rem', border: '1px solid rgba(120,120,120,0.2)', color: theme.text,
      zIndex: 25, maxHeight: '30vh', overflowY: 'auto'
    }}>
      <div style={{ fontSize: '0.7rem', fontWeight: 800, opacity: 0.5, marginBottom: '10px', textTransform:'uppercase' }}>
        Squad in #{room}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {users.length === 0 && <span style={{opacity:0.5, fontSize:'0.8rem'}}>Scanning...</span>}
        {users.map(u => (
          <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
            <span style={{fontWeight:500}}>{u.name || 'Anonymous'}</span>
            <span style={{ fontWeight: 700, color: '#00ffff' }}>{u.beats || 0}</span>
          </div>
        ))}
      </div>
    </div>
  );
};