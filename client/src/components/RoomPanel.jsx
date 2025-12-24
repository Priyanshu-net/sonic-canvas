import React, { useState } from 'react';
import { Panel } from './Panel';

export const RoomPanel = ({ room, joinRoom, userName, setName, initialX, initialY }) => {
  const [roomInput, setRoomInput] = useState(room || 'lobby');
  const [nameInput, setNameInput] = useState(userName || '');

  return (
    <Panel title="Identity & Room" initialX={initialX} initialY={initialY}>
      <div style={{ marginBottom: '16px' }}>
        <label className="label-text">JAM ROOM</label>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input 
            data-tutorial-id="room-join-input"
            value={roomInput} 
            onChange={(e) => setRoomInput(e.target.value)}
            placeholder="Room Name"
            className="glass-input"
            style={{ flex: 1 }}
          />
          <button data-tutorial-id="room-join" onClick={() => joinRoom(roomInput)} className="glass-button">Join</button>
        </div>
      </div>

      <div>
        <label className="label-text">USER HANDLE</label>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input 
            data-tutorial-id="room-name"
            value={nameInput} 
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="Anonymous"
            className="glass-input"
            style={{ flex: 1 }}
          />
          <button data-tutorial-id="room-name-set" onClick={() => setName(nameInput)} className="glass-button-primary">Set</button>
        </div>
      </div>
    </Panel>
  );
};