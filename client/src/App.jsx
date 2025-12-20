import { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { useSynth } from './hooks/useSynth';
import { useSocket } from './hooks/useSocket';
import { useParticles } from './hooks/useParticles';
import { useGameification } from './hooks/useGameification';
const PhysicsSceneLazy = lazy(() => import('./components/PhysicsScene').then(m => ({ default: m.PhysicsScene })));
import { HUD } from './components/HUD';
import { ControlsPanel } from './components/ControlsPanel';
import { UsersPanel } from './components/UsersPanel';
import { ChatPanel } from './components/ChatPanel';
import { RoomPanel } from './components/RoomPanel';
import { Onboarding } from './components/Onboarding';
import { Beat } from './components/Beat';
import { CanvasScene } from './components/CanvasScene';

const COLOR_PALETTES = {
  neon: ['#00FFFF', '#FF00FF', '#00FF00', '#FFD700', '#FF1493'],
  sunset: ['#FF6B6B', '#FFA500', '#FFD700', '#FF69B4', '#FF4500'],
  ocean: ['#00CED1', '#1E90FF', '#4169E1', '#00BFFF', '#87CEEB'],
  galaxy: ['#9D00FF', '#FF00FF', '#00FFFF', '#FF1493', '#DA70D6']
};

function App({ PhysicsSceneComponent }) {
  const { playNoteName, startAudio, isAudioReady, mapYToNote, updateFilter, setSynthPreset, setReverbWet } = useSynth();
  const { socket, isConnected, room, joinRoom, users, userName, setName, contest, startContest, messages, sendMessage } = useSocket('lobby');
  const { addExplosion } = useParticles();
  const { combo, cps, energyLevel, incrementCombo, resetCombo } = useGameification();
  
  // State
  const [clicks, setClicks] = useState([]);
  const [physicsBalls, setPhysicsBalls] = useState([]);
  const [userCount, setUserCount] = useState(0);
  const [currentPalette, setCurrentPalette] = useState('neon');
  const [isDarkMode, setIsDarkMode] = useState(true); // New Theme State
  const isTouchDevice = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
  const [bloomIntensity, setBloomIntensity] = useState(isTouchDevice ? 1.0 : 2.0);
  const [graphicsEnabled, setGraphicsEnabled] = useState(!isTouchDevice);
  const [showRoomPopup, setShowRoomPopup] = useState(false);
  const [showChatPopup, setShowChatPopup] = useState(false);
  const [reverbWet, setReverbWetUI] = useState(0.4);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const lastClickTime = useRef(Date.now());

  const NEON_COLORS = COLOR_PALETTES[currentPalette];

  // Effects
  useEffect(() => { if (isAudioReady) setSynthPreset(currentPalette); }, [currentPalette, isAudioReady, setSynthPreset]);
  useEffect(() => { if (isAudioReady) updateFilter(energyLevel); }, [energyLevel, updateFilter, isAudioReady]);
  useEffect(() => { setReverbWet(reverbWet); }, [reverbWet, setReverbWet]);

  useEffect(() => {
    if (!socket) return;
    socket.on('user-count', setUserCount);
    socket.on('receive-beat', (payload) => {
      setPhysicsBalls(prev => [...prev, { ...payload, id: payload.id }]);
      setTimeout(() => setPhysicsBalls(prev => prev.filter(b => b.id !== payload.id)), 8000);
    });
    return () => { socket.off('user-count'); socket.off('receive-beat'); };
  }, [socket]);

  const handleBallCollision = (point, note, color) => {
    if (!isAudioReady) return;
    const pan = Math.max(-1, Math.min(1, point[0] / 5));
    playNoteName(note, { pan, velocity: 0.8 });
    const screenX = window.innerWidth / 2 + point[0] * 50;
    const screenY = window.innerHeight / 2 - point[1] * 50;
    addExplosion(screenX, screenY, color, 30);
  };

  const handleCanvasClick = (e) => {
    if (!isAudioReady) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    const now = Date.now();
    if (now - lastClickTime.current > 2000) resetCombo();
    lastClickTime.current = now;
    incrementCombo();

    const note = mapYToNote(y);
    const color = NEON_COLORS[Math.floor(Math.random() * NEON_COLORS.length)];
    const beatId = `${socket?.id || 'local'}-${Date.now()}`;

    if (socket) {
      socket.emit('trigger-beat', { id: beatId, x, y, color, note });
      socket.emit('analytics', { type: 'click', meta: { x, y } });
    }

    setClicks(prev => [...prev, { x: e.clientX, y: e.clientY, note, color, id: beatId }]);
    setTimeout(() => setClicks(prev => prev.filter(c => c.id !== beatId)), 800);
  };

  return (
    <div style={{
      width: '100vw', height: '100vh',
      background: isDarkMode ? '#050505' : '#eef2f5', // Main app background
      color: isDarkMode ? '#fff' : '#111',
      position: 'relative', overflow: 'hidden', fontFamily: 'Inter, sans-serif',
      transition: 'background 0.5s ease'
    }}>
      
      {/* Background Ambience Layer */}
      <CanvasScene beats={[]} isDarkMode={isDarkMode} />

      {/* 3D Physics Layer */}
      {graphicsEnabled && isAudioReady && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
          {PhysicsSceneComponent ? (
            <PhysicsSceneComponent
              balls={physicsBalls}
              onBallCollision={handleBallCollision}
              isDarkMode={isDarkMode}
              mobile={isTouchDevice}
            />
          ) : (
            <Suspense fallback={null}>
              <PhysicsSceneLazy
                balls={physicsBalls}
                onBallCollision={handleBallCollision}
                isDarkMode={isDarkMode}
                mobile={isTouchDevice}
              />
            </Suspense>
          )}
        </div>
      )}

      {/* Game UI Layer */}
      <div style={{ position: 'relative', zIndex: 10, height: '100%', pointerEvents: 'none' }}>
        
        {/* Clickable Area (Pointer Events enabled here) */}
        {isAudioReady && (
          <div data-testid="click-layer" onMouseDown={handleCanvasClick} style={{ position: 'absolute', inset: 0, zIndex: 5, pointerEvents: 'auto', cursor: 'crosshair' }}>
             {clicks.map(click => (
              <div key={click.id} style={{
                position: 'absolute', left: click.x, top: click.y,
                width: 40, height: 40, borderRadius: '50%',
                border: `2px solid ${click.color}`,
                transform: 'translate(-50%, -50%)',
                animation: 'pulse 0.6s ease-out forwards'
              }} />
            ))}
          </div>
        )}

        {/* HUD Elements (Pointer Events auto for buttons) */}
        <div style={{ pointerEvents: 'auto' }}>
          
          <HUD 
            isAudioReady={isAudioReady} isConnected={isConnected}
            energyLevel={energyLevel} cps={cps} combo={combo}
            userCount={userCount} contest={contest} isDarkMode={isDarkMode}
          />

          <ControlsPanel 
            currentPalette={currentPalette} setCurrentPalette={setCurrentPalette}
            isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode}
            reverbWet={reverbWet} setReverbWet={setReverbWetUI}
            graphicsEnabled={graphicsEnabled} setGraphicsEnabled={setGraphicsEnabled}
            mobile={isTouchDevice}
          />

          {!isTouchDevice && (
            <>
              <RoomPanel 
                room={room} joinRoom={joinRoom} userName={userName} setName={setName}
                onInviteCopy={() => navigator.clipboard.writeText(window.location.href)}
                onStartContest={startContest} isDarkMode={isDarkMode}
              />
              <ChatPanel messages={messages} sendMessage={sendMessage} isDarkMode={isDarkMode} />
              <UsersPanel users={users} room={room} isDarkMode={isDarkMode} />
            </>
          )}

          {isTouchDevice && (
            <div style={{position:'absolute', bottom:'2rem', left:'1rem', display:'flex', gap:'10px'}}>
               <button onClick={()=>setShowRoomPopup(!showRoomPopup)} style={{background:'rgba(0,0,0,0.5)', color:'white', border:'none', padding:'8px 12px', borderRadius:'8px'}}>MENU</button>
               {showRoomPopup && <RoomPanel room={room} joinRoom={joinRoom} userName={userName} setName={setName} onInviteCopy={()=>{}} onStartContest={startContest} isDarkMode={isDarkMode} mobile={true} />}
            </div>
          )}

        </div>
      </div>

      {/* Start Screen */}
      {!isAudioReady && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: isDarkMode?'rgba(0,0,0,0.6)':'rgba(255,255,255,0.6)', backdropFilter:'blur(10px)' }}>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: '4rem', fontWeight: 100, letterSpacing: '0.2em', color: isDarkMode?'#fff':'#111' }}>SONIC CANVAS</h1>
            <button onClick={startAudio} style={{
              padding: '1rem 3rem', fontSize: '1.2rem', borderRadius: '50px', border:'none',
              background: isDarkMode ? '#fff' : '#111', color: isDarkMode ? '#000' : '#fff',
              cursor: 'pointer', fontWeight: 'bold', marginTop: '2rem', boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
            }}>INITIALIZE ENGINE</button>
          </div>
        </div>
      )}

      {showOnboarding && <Onboarding onClose={() => setShowOnboarding(false)} isDarkMode={isDarkMode} />}

      <style>{`
        @keyframes pulse { 0% { transform: translate(-50%, -50%) scale(0.5); opacity: 1; } 100% { transform: translate(-50%, -50%) scale(2.5); opacity: 0; } }
        @keyframes bounce { 0% { transform: scale(1); } 100% { transform: scale(1.1); } }
      `}</style>
    </div>
  );
}

export default App;