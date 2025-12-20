import React, { useState } from 'react';
import { Panel } from './Panel';

export const RoomPanel = ({ room, joinRoom, userName, setName, onInviteCopy, onStartContest, isDarkMode, mobile }) => {
  const [roomInput, setRoomInput] = useState(room);
  const [nameInput, setNameInput] = useState(userName);

  const btnStyle = {
    padding: '8px 12px', borderRadius: '8px', fontWeight: '600', border: 'none', cursor: 'pointer', fontSize: '0.85rem'
  };

  return (
    <Panel title="🏷️ Profile" initialX={20} initialY={20} initialWidth={340} initialHeight={220} isDarkMode={isDarkMode} mobile={mobile}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          <input 
            value={nameInput} onChange={e => setNameInput(e.target.value)} placeholder="Your Name" 
            style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid rgba(120,120,120,0.3)', background: 'transparent', color: 'inherit' }}
          />
          <button onClick={() => setName(nameInput)} style={{ ...btnStyle, background: '#00ffff', color: '#000' }}>SET</button>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <input 
            value={roomInput} onChange={e => setRoomInput(e.target.value)} placeholder="Room ID" 
            style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid rgba(120,120,120,0.3)', background: 'transparent', color: 'inherit' }}
          />
          <button onClick={() => joinRoom(roomInput)} style={{ ...btnStyle, background: isDarkMode ? '#333' : '#eee', color: 'inherit' }}>JOIN</button>
        </div>

        <div style={{display:'flex', gap:'8px', marginTop: '4px'}}>
            <button onClick={onInviteCopy} style={{ ...btnStyle, flex:1, background: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', color: 'inherit' }}>
            🔗 Copy Link
            </button>
            <button onClick={() => onStartContest(30)} style={{ ...btnStyle, flex:1, background: 'linear-gradient(90deg, #ff00ff, #00ffff)', color: '#fff' }}>
            🏆 Contest
            </button>
        </div>

      </div>
    </Panel>
  );
};