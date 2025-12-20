// File: RoomPanel.jsx
import React, { useState, useEffect } from 'react';
import { Panel } from './Panel';

export const RoomPanel = ({
  room,
  joinRoom = () => {},
  userName = '',
  setName = () => {},
  onInviteCopy = () => {},
  onStartContest = () => {},
  mobile = false
}) => {
  const [roomInput, setRoomInput] = useState(room || 'lobby');
  const [nameInput, setNameInput] = useState(userName || '');

  useEffect(() => setRoomInput(room || 'lobby'), [room]);
  useEffect(() => setNameInput(userName || ''), [userName]);

  return (
    <Panel title="🏷️ Room & Profile" initialX={20} initialY={20} initialWidth={340} initialHeight={220} zIndex={31} mobile={mobile}>
      {/* Room */}
      <div style={{ marginBottom: '0.75rem' }}>
        <div style={{ fontSize: '0.8rem', opacity: 0.7, marginBottom: '0.25rem' }}>Room</div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            value={roomInput}
            onChange={(e) => setRoomInput(e.target.value)}
            placeholder="lobby"
            style={{ flex: 1, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: '0.5rem', padding: '0.5rem' }}
          />
          <button
            onClick={() => joinRoom(roomInput)}
            style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.25)', color: '#fff', borderRadius: '0.5rem', padding: '0.5rem 0.75rem', cursor: 'pointer' }}
          >Join</button>
        </div>
        <div style={{ fontSize: '0.75rem', opacity: 0.7, marginTop: '0.25rem' }}>Current: <strong>{room || 'lobby'}</strong></div>
      </div>

      {/* Name */}
      <div style={{ marginBottom: '0.75rem' }}>
        <div style={{ fontSize: '0.8rem', opacity: 0.7, marginBottom: '0.25rem' }}>Your Name</div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="Anonymous"
            style={{ flex: 1, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: '0.5rem', padding: '0.5rem' }}
          />
          <button
            onClick={() => setName(nameInput)}
            style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.25)', color: '#fff', borderRadius: '0.5rem', padding: '0.5rem 0.75rem', cursor: 'pointer' }}
          >Set</button>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button
          onClick={onInviteCopy}
          title="Copy invite link"
          style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.25)', color: '#fff', borderRadius: '0.5rem', padding: mobile ? '0.5rem' : '0.5rem 0.75rem', cursor: 'pointer', flex: 1 }}
        >Copy Invite</button>
        <button
          onClick={() => onStartContest(30)}
          title="Start a 30s contest"
          style={{ background: 'rgba(0,255,255,0.15)', border: '1px solid rgba(0,255,255,0.35)', color: '#00ffff', borderRadius: '0.5rem', padding: mobile ? '0.5rem' : '0.5rem 0.75rem', cursor: 'pointer', flex: 1 }}
        >Start Contest</button>
      </div>
    </Panel>
  );
};
