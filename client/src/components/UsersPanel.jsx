// File: UsersPanel.jsx
import React from 'react';
import { formatTimestamp } from '../utils/format';

export const UsersPanel = ({ users = [], room = 'lobby' }) => {
  return (
    <div style={{
      position: 'absolute',
      bottom: '2rem',
      right: '2rem',
      width: '320px',
      maxHeight: '40vh',
      overflowY: 'auto',
      backdropFilter: 'blur(16px)',
      background: 'rgba(255, 255, 255, 0.08)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '0.75rem',
      padding: '1rem',
      zIndex: 12,
      color: '#fff'
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <div style={{ fontSize: '0.9rem', fontWeight: 600, letterSpacing: '0.08em' }}>Room Users</div>
        <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>#{room}</div>
      </div>

      {users.length === 0 ? (
        <div style={{ fontSize: '0.85rem', opacity: 0.7 }}>No users yet. Share your room and jam!</div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ textAlign: 'left', opacity: 0.7 }}>
              <th style={{ padding: '0.25rem 0.25rem' }}>Name</th>
              <th style={{ padding: '0.25rem 0.25rem' }}>Beats</th>
              <th style={{ padding: '0.25rem 0.25rem' }}>Last</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td style={{ padding: '0.25rem 0.25rem' }}>{u.name || 'Anonymous'}</td>
                <td style={{ padding: '0.25rem 0.25rem' }}>{u.beats ?? 0}</td>
                <td style={{ padding: '0.25rem 0.25rem' }}>{formatTimestamp(u.lastAction)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};
