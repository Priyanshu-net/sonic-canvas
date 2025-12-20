import { useState, useEffect } from 'react';
import { useSynth } from './hooks/useSynth';
import { useSocket } from './hooks/useSocket';
import { CanvasScene } from './components/CanvasScene';

// Neon color palette (synced with Beat component)
const NEON_COLORS = ['#00FFFF', '#FF00FF', '#00FF00'];

function App() {
  const { playNote, startAudio, isAudioReady, mapYToNote } = useSynth();
  const { socket, isConnected } = useSocket();
  const [clicks, setClicks] = useState([]);
  const [beats, setBeats] = useState([]);
  const [userCount, setUserCount] = useState(0);

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
      console.log('🎵 Received beat:', payload);

      // Play the note (only if audio is ready)
      if (isAudioReady && payload.note) {
        // Calculate normalized Y from note for playback
        const normalizedY = payload.y;
        playNote(normalizedY);
      }

      // Add beat to 3D scene
      const x3d = (payload.x - 0.5) * 10;
      const y3d = (0.5 - payload.y) * 10;

      setBeats(prev => [...prev, {
        id: payload.id,
        position: [x3d, y3d, 0],
        note: payload.note,
        color: payload.color
      }]);

      // Cleanup: Remove beat after 2 seconds to prevent memory leaks
      setTimeout(() => {
        setBeats(prev => prev.filter(b => b.id !== payload.id));
      }, 2000);
    };

    socket.on('receive-beat', handleReceiveBeat);

    // Cleanup listener on unmount
    return () => {
      socket.off('receive-beat', handleReceiveBeat);
    };
  }, [socket, isAudioReady, playNote]);

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

    // Get note based on Y position
    const note = mapYToNote(y);

    // Random neon color
    const color = NEON_COLORS[Math.floor(Math.random() * NEON_COLORS.length)];

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

    console.log('📤 Emitted trigger-beat:', { id: beatId, x, y, color, note });

    // Track click for 2D visual feedback
    setClicks(prev => [...prev, { 
      x: e.clientX - rect.left, 
      y: e.clientY - rect.top, 
      note, 
      id: beatId 
    }]);

    // Remove click marker after animation
    setTimeout(() => {
      setClicks(prev => prev.filter(c => c.id !== beatId));
    }, 1000);
  };

  return (
    <div className="w-screen h-screen bg-[#050505] text-white relative overflow-hidden">
      {/* 3D Canvas Scene - Background Layer (z-0) */}
      <div className="absolute inset-0 z-0">
        <CanvasScene beats={beats} />
      </div>

      {/* UI Overlay Layer (z-10) */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {/* Floating Header - SONIC CANVAS */}
        <div className="absolute top-8 left-1/2 -translate-x-1/2 pointer-events-none">
          <h1 className="text-4xl md:text-5xl font-thin tracking-ultra-wide text-white/90">
            SONIC CANVAS
          </h1>
        </div>

        {/* User Count Indicator - Bottom Right */}
        <div className="absolute bottom-8 right-8 backdrop-blur-md bg-white/10 border border-white/20 rounded-full px-6 py-3">
          <div className="flex items-center gap-2 text-sm">
            <span className={isConnected ? 'text-green-400' : 'text-red-400'}>●</span>
            <span className="font-medium">
              {userCount} {userCount === 1 ? 'user' : 'users'} jamming
            </span>
          </div>
        </div>

        {/* Status Indicator - Top Left */}
        {isAudioReady && (
          <div className="absolute top-8 left-8 backdrop-blur-md bg-white/10 border border-white/20 rounded-lg px-4 py-3">
            <div className="text-sm font-medium">🎵 Audio: Active</div>
            <div className="text-xs text-white/60 mt-1">
              {isConnected ? '🟢 Connected' : '🔴 Connecting...'}
            </div>
          </div>
        )}
      </div>

      {/* Start Audio Screen */}
      {!isAudioReady && (
        <div className="absolute inset-0 z-20 flex items-center justify-center">
          <div className="text-center space-y-8">
            <h1 className="text-6xl md:text-7xl font-thin tracking-ultra-wide mb-4">
              🎵 SONIC CANVAS
            </h1>
            <button
              onClick={startAudio}
              className="pointer-events-auto px-12 py-4 text-xl backdrop-blur-md bg-white/10 border border-white/20 rounded-full text-white cursor-pointer transition-all duration-300 hover:bg-white/20 hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]"
            >
              � Start Audio
            </button>
            <p className="text-white/70 text-sm mt-6">
              Click anywhere to create sounds & visuals
            </p>
          </div>
        </div>
      )}

      {/* Interactive Canvas Area */}
      {isAudioReady && (
        <div
          onClick={handleCanvasClick}
          className="absolute inset-0 z-[5] cursor-crosshair pointer-events-auto"
        >
          {/* Visual feedback for clicks */}
          {clicks.map(click => (
            <div
              key={click.id}
              className="absolute w-10 h-10 rounded-full pointer-events-none"
              style={{
                left: click.x,
                top: click.y,
                background: 'radial-gradient(circle, rgba(100, 200, 255, 0.8) 0%, transparent 70%)',
                transform: 'translate(-50%, -50%)',
                animation: 'pulse 1s ease-out forwards',
                boxShadow: '0 0 30px rgba(100, 200, 255, 0.6)'
              }}
            >
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs text-cyan-400 font-bold">
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
