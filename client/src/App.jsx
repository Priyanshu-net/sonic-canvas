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
import { MobileToolbar } from './components/MobileToolbar';

const COLOR_PALETTES = {
  neon: ['#00FFFF', '#FF00FF', '#00FF00', '#FFD700', '#FF1493'],
  sunset: ['#FF6B6B', '#FFA500', '#FFD700', '#FF69B4', '#FF4500'],
  ocean: ['#00CED1', '#1E90FF', '#4169E1', '#00BFFF', '#87CEEB'],
  galaxy: ['#9D00FF', '#FF00FF', '#00FFFF', '#FF1493', '#DA70D6']
};

function App({ PhysicsSceneComponent = PhysicsSceneLazy }) {
  const { playNoteName, startAudio, isAudioReady, mapYToNote, updateFilter, setSynthPreset, setReverbWet } = useSynth();
  const { socket, isConnected, room, joinRoom, users, userName, setName, contest, startContest, messages, sendMessage } = useSocket('lobby');
  const { addExplosion } = useParticles();
  const { combo, cps, energyLevel, incrementCombo, resetCombo, getComboMultiplier } = useGameification();
  
  const [clicks, setClicks] = useState([]);
  const [physicsBalls, setPhysicsBalls] = useState([]);
  const [currentPalette, setCurrentPalette] = useState('neon');
  const [theme, setTheme] = useState('dark');
  const [graphicsEnabled, setGraphicsEnabled] = useState(true);
  const [bloomIntensity, setBloomIntensity] = useState(2.0);
  const [reverbWet, setReverbWetUI] = useState(0.4);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(true);

  // Robust mobile detection: coarse pointer OR mobile UA OR touch capability
  const isMobile = (() => {
    if (typeof window === 'undefined') return false;
    const hasCoarsePointer = typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches;
    const ua = navigator.userAgent || '';
    const isMobileUA = /Mobi|Android|iPhone|iPad|iPod/i.test(ua);
    const touchCapable = ('ontouchstart' in window) || (navigator.maxTouchPoints && navigator.maxTouchPoints > 0);
    return hasCoarsePointer || isMobileUA || touchCapable;
  })();
  const lastClickTime = useRef(Date.now());

  // Layout Anchors
  const sideMargin = 30;
  const topAnchor = 130; 
  const panelGap = 20;
  const roomPanelHeight = 220;

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    if (setSynthPreset && isAudioReady) setSynthPreset(currentPalette);
    if (updateFilter && isAudioReady) updateFilter(energyLevel);
    setReverbWet(reverbWet);
  }, [currentPalette, energyLevel, isAudioReady, reverbWet]);

  useEffect(() => {
    if (!socket) return;
    socket.on('receive-beat', (payload) => {
      setPhysicsBalls(prev => [...prev, { id: payload.id, nx: payload.x, ny: payload.y, note: payload.note, color: payload.color }]);
      setTimeout(() => setPhysicsBalls(prev => prev.filter(b => b.id !== payload.id)), 12000);
    });
    return () => socket.off('receive-beat');
  }, [socket]);

  const handleBallCollision = (point, note, color, velocity) => {
    if (!isAudioReady) return;
    playNoteName(note, { pan: Math.max(-1, Math.min(1, point[0] / 5)), velocity: 0.8 });
    const screenX = window.innerWidth / 2 + point[0] * 50;
    const screenY = window.innerHeight / 2 - point[1] * 50;
    addExplosion(screenX, screenY, color, 30);
    if (hapticsEnabled && navigator.vibrate) navigator.vibrate(10);
  };

  const handleCanvasClick = (e) => {
    if (!isAudioReady) return;
    if (e.target.closest('.glass-panel') || e.target.closest('button')) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    
    if (Date.now() - lastClickTime.current > 2000) resetCombo();
    lastClickTime.current = Date.now();
    incrementCombo();

    const note = mapYToNote(y);
    const color = COLOR_PALETTES[currentPalette][Math.floor(Math.random() * 5)];
    const beatId = `beat-${Date.now()}`;

    socket.emit('trigger-beat', { id: beatId, x, y, color, note });
    setClicks(prev => [...prev, { x: e.clientX, y: e.clientY, color, id: beatId }]);
    setTimeout(() => setClicks(prev => prev.filter(c => c.id !== beatId)), 1000);
  };

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      <Suspense fallback={null}>
        {isAudioReady && graphicsEnabled && (
          <PhysicsSceneComponent 
            balls={physicsBalls} onBallCollision={handleBallCollision} 
            energyLevel={energyLevel} cps={cps} theme={theme} bloomIntensity={bloomIntensity}
          />
        )}
      </Suspense>

      <HUD 
        isAudioReady={isAudioReady} isConnected={isConnected} 
        energyLevel={energyLevel} cps={cps} combo={combo} 
        getComboMultiplier={getComboMultiplier} userCount={users.length} contest={contest}
      />

      <div style={{ position: 'absolute', top: '2rem', left: '50%', transform: 'translateX(-50%)', pointerEvents: 'none' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 200, letterSpacing: '0.4em', color: 'var(--color-text)', opacity: 0.6 }}>SONIC CANVAS</h1>
      </div>

      {!isMobile && (
        <>
          {/* Left Column */}
          <RoomPanel 
            room={room} joinRoom={joinRoom} userName={userName} setName={setName} 
            initialX={sideMargin} initialY={topAnchor}
          />
          <ChatPanel 
            messages={messages} sendMessage={sendMessage} 
            initialX={sideMargin} initialY={topAnchor + roomPanelHeight + panelGap}
          />

          {/* Right Column */}
          <ControlsPanel 
            currentPalette={currentPalette} setCurrentPalette={setCurrentPalette} 
            bloomIntensity={bloomIntensity} setBloomIntensity={setBloomIntensity}
            reverbWet={reverbWet} setReverbWet={setReverbWetUI}
            hapticsEnabled={hapticsEnabled} setHapticsEnabled={setHapticsEnabled}
            graphicsEnabled={graphicsEnabled} setGraphicsEnabled={setGraphicsEnabled}
            theme={theme} toggleTheme={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
            contest={contest} startContest={startContest}
            initialX={window.innerWidth - 330 - sideMargin} initialY={topAnchor}
          />
          <UsersPanel users={users} room={room} />
        </>
      )}

      {isMobile && (
        <MobileToolbar
          isAudioReady={isAudioReady}
          startAudio={startAudio}
          theme={theme}
          toggleTheme={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
          graphicsEnabled={graphicsEnabled}
          setGraphicsEnabled={setGraphicsEnabled}
          hapticsEnabled={hapticsEnabled}
          setHapticsEnabled={setHapticsEnabled}
          contest={contest}
          startContest={startContest}
          userName={userName}
          setName={setName}
          room={room}
          joinRoom={joinRoom}
          messages={messages}
          sendMessage={sendMessage}
          bloomIntensity={bloomIntensity}
          setBloomIntensity={setBloomIntensity}
        />
      )}

      {!isAudioReady && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)' }}>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: '3.5rem', fontWeight: 100, letterSpacing: '0.5em', marginBottom: '3rem' }}>SONIC CANVAS</h1>
            <button onClick={startAudio} className="glass-button-hero">INITIALIZE STUDIO</button>
          </div>
        </div>
      )}

      {showOnboarding && <Onboarding onClose={() => setShowOnboarding(false)} />}

      <div data-testid="click-layer" onClick={handleCanvasClick} style={{ position: 'absolute', inset: 0, zIndex: 5, cursor: 'crosshair' }}>
        {clicks.map(click => (
          <div key={click.id} className="pulse-animate" style={{ position: 'absolute', left: click.x, top: click.y, width: '40px', height: '40px', borderRadius: '50%', background: `radial-gradient(circle, ${click.color} 0%, transparent 70%)` }} />
        ))}
      </div>
    </div>
  );
}

export default App;