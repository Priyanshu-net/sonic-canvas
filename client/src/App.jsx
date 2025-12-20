// File: App.jsx
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

// Enhanced color palettes
const COLOR_PALETTES = {
  neon: ['#00FFFF', '#FF00FF', '#00FF00', '#FFD700', '#FF1493'],
  sunset: ['#FF6B6B', '#FFA500', '#FFD700', '#FF69B4', '#FF4500'],
  ocean: ['#00CED1', '#1E90FF', '#4169E1', '#00BFFF', '#87CEEB'],
  galaxy: ['#9D00FF', '#FF00FF', '#00FFFF', '#FF1493', '#DA70D6']
};

function App() {
  const { playNote, playNoteName, startAudio, isAudioReady, mapYToNote, updateFilter, setSynthPreset, setReverbWet } = useSynth();
  const { socket, isConnected, room, joinRoom, users, userName, setName, contest, startContest, messages, sendMessage } = useSocket('lobby');
  const { particles, addExplosion } = useParticles();
  const { combo, score, cps, energyLevel, incrementCombo, resetCombo, getComboMultiplier, getEnergyState } = useGameification();
  const [clicks, setClicks] = useState([]);
  const [physicsBalls, setPhysicsBalls] = useState([]); // Physics balls for 3D scene
  const [userCount, setUserCount] = useState(0);
  const [currentPalette, setCurrentPalette] = useState('neon');
  const isTouchDevice = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
  const [bloomIntensity, setBloomIntensity] = useState(isTouchDevice ? 1.2 : 2.0);
  const [graphicsEnabled, setGraphicsEnabled] = useState(() => {
    // Default: disable graphics on touch devices to avoid initial hangs
    return !isTouchDevice;
  });
  // Mobile popups for Room & Chat
  const [showRoomPopup, setShowRoomPopup] = useState(false);
  const [showChatPopup, setShowChatPopup] = useState(false);
  const [showAchievement, setShowAchievement] = useState(null);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [reverbWet, setReverbWetUI] = useState(isTouchDevice ? 0.3 : 0.4);
  const [showOnboarding, setShowOnboarding] = useState(() => {
    try {
      return localStorage.getItem('sc_onboarded') !== '1';
    } catch { return true; }
  });
  const lastClickTime = useRef(Date.now());
  const konamiCode = useRef([]);
  const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

  const NEON_COLORS = COLOR_PALETTES[currentPalette];

  // Update synth preset when palette changes
  useEffect(() => {
    if (setSynthPreset && isAudioReady) {
      setSynthPreset(currentPalette);
    }
  }, [currentPalette, setSynthPreset, isAudioReady]);

  // Update audio filter based on energy level
  useEffect(() => {
    if (updateFilter && isAudioReady) {
      updateFilter(energyLevel);
    }
  }, [energyLevel, updateFilter, isAudioReady]);

  // Apply reverb wet (safe before/after audio start)
  useEffect(() => {
    setReverbWet(reverbWet);
  }, [reverbWet, setReverbWet]);

  // Listen for user count updates
  useEffect(() => {
    if (!socket) return;

    const handleUserCount = (count) => {
      setUserCount(count);
      console.log('👥 User count updated:', count);
    };

    socket.on('user-count', handleUserCount);

    return () => {
      socket.off('user-count', handleUserCount);
    };
  }, [socket]);

  // Listen for receive-beat events from server
  useEffect(() => {
    if (!socket) return;

    const handleReceiveBeat = (payload) => {
      try {
        console.log('🎵 Received beat:', payload);
        // Pass normalized coords; PhysicsScene will map to world via raycaster
        setPhysicsBalls(prev => [...prev, {
          id: payload.id,
          nx: payload.x,
          ny: payload.y,
          note: payload.note,
          color: payload.color
        }]);
        // Cleanup: Remove ball reference after 12 seconds
        setTimeout(() => {
          setPhysicsBalls(prev => prev.filter(b => b.id !== payload.id));
        }, 12000);
      } catch (e) {
        console.warn('receive-beat handler error', e);
      }
    };

    socket.on('receive-beat', handleReceiveBeat);
    return () => socket.off('receive-beat', handleReceiveBeat);
  }, [socket]);

  // Handle ball collision with floor
  const handleBallCollision = (point, note, color, velocity) => {
    if (!isAudioReady) return;

    // Play the specific note assigned to this ball
    if (note) {
      // Map X position to stereo pan (-1 .. 1), use velocity for note intensity
      const pan = Math.max(-1, Math.min(1, point[0] / 5));
      const vel = Math.max(0.3, Math.min(1, (velocity ?? 1)));
      playNoteName(note, { pan, velocity: vel });
    }

    // Create particle explosion at collision point
    // Convert 3D point to 2D screen space (approximate)
    const screenX = window.innerWidth / 2 + point[0] * 50;
    const screenY = window.innerHeight / 2 - point[1] * 50;
    const particleCount = energyLevel > 10 ? 60 : 30;
    addExplosion(screenX, screenY, color, particleCount);

    console.log('💥 Ball collision:', { note, velocity: velocity.toFixed(2) });
    // Stronger haptics on collision
    if (hapticsEnabled && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try { navigator.vibrate([5, 15, 5]); } catch {}
    }
    // Analytics
    socket?.emit?.('analytics', { type: 'collision', meta: { note, velocity, color } });
  };
  // Keyboard controls: map keys to notes via normalized Y positions
  useEffect(() => {
    const keyMap = {
      a: 0.15, s: 0.30, d: 0.45, f: 0.60, g: 0.75, h: 0.90
    };
    const onKey = (ev) => {
      const k = ev.key.toLowerCase();
      if (!(k in keyMap) || !isAudioReady) return;
      const y = keyMap[k];
      const note = mapYToNote(y);
      const color = NEON_COLORS[Math.floor(Math.random() * NEON_COLORS.length)];
      // Play directly with center pan
      playNoteName(note, { pan: 0, velocity: 0.85 });
      // Also emit a synthetic beat so other clients see it
      const beatId = `${socket.id}-${Date.now()}`;
      socket?.emit?.('trigger-beat', { id: beatId, x: 0.5, y, color, note });
      socket?.emit?.('analytics', { type: 'key', meta: { key: k, note } });
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isAudioReady, mapYToNote, NEON_COLORS, playNoteName, socket]);

  const handleCanvasClick = (e) => {
    if (!isAudioReady) {
      alert('Please start audio first! 🎵');
      return;
    }

    if (!socket || !isConnected) {
      console.warn('⚠️ Socket not connected');
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Combo system - reset if too slow
    const now = Date.now();
    if (now - lastClickTime.current > 2000) {
      resetCombo();
    }
    lastClickTime.current = now;
    incrementCombo();

    // Get note based on Y position
    const note = mapYToNote(y);

    // Random neon color
    const colorBase = NEON_COLORS[Math.floor(Math.random() * NEON_COLORS.length)];
    const varyColor = (hex) => {
      try {
        const clean = hex.replace('#','');
        const bigint = parseInt(clean.length===3?clean.split('').map(c=>c+c).join(''):clean,16);
        let r=(bigint>>16)&255,g=(bigint>>8)&255,b=bigint&255;
        const factor = (Math.random()-0.5)*0.3; // +/-30%
        r=Math.max(0,Math.min(255, Math.round(r*(1+factor))));
        g=Math.max(0,Math.min(255, Math.round(g*(1+factor))));
        b=Math.max(0,Math.min(255, Math.round(b*(1+factor))));
        return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
      } catch { return hex; }
    };
    const color = varyColor(colorBase);

  // No explosion on click — only on collision

    // Create unique beat ID
    const beatId = `${socket.id}-${Date.now()}`;

    // Emit trigger-beat to server (will be broadcast to all clients including this one)
    socket.emit('trigger-beat', {
      id: beatId,
      x,
      y,
      color,
      note
    });

    // Send lightweight analytics
    socket.emit('analytics', { type: 'click', meta: { x, y, palette: currentPalette } });

    // Mobile haptics feedback
    if (hapticsEnabled && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try { navigator.vibrate(10); } catch {}
    }

    console.log('📤 Emitted trigger-beat:', { id: beatId, x, y, color, note });

    // Track click for 2D visual feedback
    setClicks(prev => [...prev, { 
      x: e.clientX - rect.left, 
      y: e.clientY - rect.top, 
      note, 
      color,
      id: beatId 
    }]);

    // Remove click marker after animation
    setTimeout(() => {
      setClicks(prev => prev.filter(c => c.id !== beatId));
    }, 1000);
  };

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: '#050505',
      color: '#fff',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: 'Inter, sans-serif'
    }}>
      {/* 3D Canvas Scene - Background Layer (deferred until audio starts) */}
      {((graphicsEnabled || import.meta.env.MODE === 'test') && (isAudioReady || import.meta.env.MODE === 'test')) && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          <Suspense fallback={<div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',color:'#888'}}>Loading 3D scene…</div>}>
            <PhysicsSceneLazy 
              balls={physicsBalls} 
              onBallCollision={handleBallCollision}
              energyLevel={energyLevel}
              cps={cps}
              bloomIntensity={bloomIntensity}
              mobile={isTouchDevice}
            />
          </Suspense>
        </div>
      )}

      {/* Floating Header - SONIC CANVAS */}
      <div style={{
        position: 'absolute',
        top: '2rem',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 10,
        pointerEvents: 'none'
      }}>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: 100,
          letterSpacing: '0.3em',
          color: 'rgba(255, 255, 255, 0.9)',
          textAlign: 'center',
          margin: 0
        }}>
          SONIC CANVAS
        </h1>
      </div>

      {/* HUD overlays */}
      <HUD 
        isAudioReady={isAudioReady}
        isConnected={isConnected}
        energyLevel={energyLevel}
        cps={cps}
        combo={combo}
        getComboMultiplier={getComboMultiplier}
        userCount={userCount}
        contest={contest}
        mobile={isTouchDevice}
      />


      {/* Left-side Panels: Room & Chat (adjustable) */}
      {isTouchDevice ? (
        <>
          {/* Mobile: small buttons to open popups */}
          <div style={{ position: 'absolute', top: '6rem', left: '2rem', zIndex: 16, display: 'flex', gap: '0.5rem' }}>
            <button onClick={() => setShowRoomPopup((v) => !v)} style={{ padding: '0.4rem 0.6rem', borderRadius: '0.5rem', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.25)', color: '#fff' }}>Room</button>
            <button onClick={() => setShowChatPopup((v) => !v)} style={{ padding: '0.4rem 0.6rem', borderRadius: '0.5rem', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.25)', color: '#fff' }}>Chat</button>
          </div>
          {showRoomPopup && (
            <RoomPanel
              room={room}
              joinRoom={joinRoom}
              userName={userName}
              setName={setName}
              onInviteCopy={() => {
                const url = new URL(window.location.href);
                if (room) url.searchParams.set('room', room);
                navigator.clipboard?.writeText(url.toString());
                alert('Invite link copied!');
              }}
              onStartContest={(d) => startContest?.(d)}
              mobile={true}
            />
          )}
          {showChatPopup && (
            <ChatPanel messages={messages} sendMessage={sendMessage} mobile={true} />
          )}
        </>
      ) : (
        <>
          <RoomPanel
            room={room}
            joinRoom={joinRoom}
            userName={userName}
            setName={setName}
            onInviteCopy={() => {
              const url = new URL(window.location.href);
              if (room) url.searchParams.set('room', room);
              navigator.clipboard?.writeText(url.toString());
              alert('Invite link copied!');
            }}
            onStartContest={(d) => startContest?.(d)}
            mobile={false}
          />
          <ChatPanel messages={messages} sendMessage={sendMessage} mobile={false} />
        </>
      )}

      {/* Controls Panel */}
      <ControlsPanel 
        currentPalette={currentPalette}
        setCurrentPalette={setCurrentPalette}
        bloomIntensity={bloomIntensity}
        setBloomIntensity={setBloomIntensity}
        room={room}
        joinRoom={joinRoom}
        userName={userName}
        setName={setName}
        hapticsEnabled={hapticsEnabled}
        setHapticsEnabled={setHapticsEnabled}
        reverbWet={reverbWet}
  setReverbWet={setReverbWetUI}
        mobile={isTouchDevice}
        graphicsEnabled={graphicsEnabled}
        setGraphicsEnabled={setGraphicsEnabled}
        onStartContest={(d) => startContest?.(d)}
        onInviteCopy={() => {}}
      />

      {/* Users Panel */}
  <UsersPanel users={users} room={room} mobile={isTouchDevice} />

      {/* Start Audio Screen */}
      {!isAudioReady && (
        <div style={{
          position: 'absolute',
          inset: 0,
          zIndex: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(5, 5, 5, 0.95)'
        }}>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{
              fontSize: '4rem',
              fontWeight: 100,
              letterSpacing: '0.3em',
              marginBottom: '2rem'
            }}>
              🎵 SONIC CANVAS
            </h1>
            <button
              onClick={startAudio}
              style={{
                padding: '1rem 3rem',
                fontSize: '1.25rem',
                backdropFilter: 'blur(16px)',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '9999px',
                color: '#fff',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                fontFamily: 'inherit'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                e.target.style.transform = 'scale(1.05)';
                e.target.style.boxShadow = '0 0 30px rgba(255, 255, 255, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = 'none';
              }}
            >
              🎹 Start Audio
            </button>
            {showOnboarding && (
              <div style={{ marginTop: '1rem' }}>
                <button onClick={() => { try { localStorage.setItem('sc_onboarded','1'); } catch {}; setShowOnboarding(false); }}
                  style={{ padding: '0.5rem 0.75rem', borderRadius: '0.5rem', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.25)', color: '#fff', cursor: 'pointer' }}>
                  Show Tips
                </button>
              </div>
            )}
            <p style={{
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '0.875rem',
              marginTop: '1.5rem'
            }}>
              Click anywhere to create sounds & visuals
            </p>
          </div>
        </div>
      )}

      {showOnboarding && (
        <Onboarding onClose={() => { try { localStorage.setItem('sc_onboarded','1'); } catch {}; setShowOnboarding(false); }} />
      )}

      {/* Interactive Canvas Area */}
      {isAudioReady && (
        <div
          onClick={handleCanvasClick}
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 5,
            cursor: 'crosshair'
          }}
        >
          {/* Visual feedback for clicks */}
          {clicks.map(click => (
            <div
              key={click.id}
              style={{
                position: 'absolute',
                left: click.x,
                top: click.y,
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: `radial-gradient(circle, ${(() => {
                  // convert hex to rgba with alpha
                  try {
                    const c = click.color?.replace('#','') ?? '64c8ff';
                    const bigint = parseInt(c.length===3?c.split('').map(x=>x+x).join(''):c,16);
                    const r=(bigint>>16)&255,g=(bigint>>8)&255,b=bigint&255;
                    return `rgba(${r}, ${g}, ${b}, 0.85)`;
                  } catch { return 'rgba(100,200,255,0.85)'; }
                })()} 0%, transparent 70%)`,
                transform: 'translate(-50%, -50%)',
                animation: 'pulse 1s ease-out forwards',
                pointerEvents: 'none',
                boxShadow: '0 0 30px rgba(100, 200, 255, 0.6)'
              }}
            >
              <div style={{
                position: 'absolute',
                top: '-30px',
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: '0.75rem',
                color: '#64c8ff',
                fontWeight: 'bold',
                whiteSpace: 'nowrap'
              }}>
                {click.note}
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) scale(3);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

export default App;
