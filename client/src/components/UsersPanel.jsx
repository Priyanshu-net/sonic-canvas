import React from 'react';

export const UsersPanel = ({ users = [], room = 'lobby' }) => {
  return (
    <div 
      className="glass-panel"
      style={{ 
        position: 'absolute', 
        bottom: '25px', 
        right: '25px', 
        width: '280px',
        padding: '16px',
        zIndex: 20
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
        <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--color-text-muted)' }}>JAMMERS ONLINE</span>
        <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>#{room}</span>
      </div>
      
      <div style={{ maxHeight: '150px', overflowY: 'auto' }} className="custom-scrollbar">
        {users.map((u, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--color-border)' }}>
            <span style={{ fontSize: '0.85rem' }}>{u.name || 'Anonymous'}</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-primary)', fontFamily: 'monospace' }}>{u.beats || 0}</span>
          </div>
        ))}
      </div>
    </div>
  );
};