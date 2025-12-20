# 🎵 SONIC CANVAS

**A real-time multiplayer audio-visual experience where every click creates music and particles!**

[![Deploy](https://img.shields.io/badge/Deploy-Ready-success)](./DEPLOYMENT.md)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## ✨ Features

- � **Interactive Music Creation** - Click anywhere to generate musical notes
- 🎨 **4 Unique Sound Palettes** - Each with distinct visual colors and musical characteristics
- 🌈 **3D Physics Simulation** - Bouncing spheres with realistic physics
- ✨ **Visual Effects** - Bloom, particles, and dynamic lighting
- 👥 **Real-time Multiplayer** - See and hear other players in the same room
- 🎮 **Gamification** - Combo system, energy levels, and click-per-second tracking
- 🎵 **Adaptive Audio** - Dynamic filter that responds to your energy level

---

## 🚀 Quick Start

### Option 1: Quick Launch (Both servers at once)
```bash
./start.sh
```

### Option 2: Manual Launch

**Terminal 1 - Backend:**
```bash
npm install
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm install
npm run dev
```

Then open **http://localhost:5173** in your browser!

---

## 🎮 How to Play

1. Click **"Start Audio"** (required for browser audio policy)
2. **Click anywhere** on the canvas to create sounds and visuals
3. **Switch palettes** in the Controls panel to change colors and sounds
4. **Join rooms** to play with friends in real-time
5. **Build combos** by clicking rapidly (2-second window)
6. Watch your **energy level** grow - it opens the audio filter for crisper sound!

---

## 🎨 Sound Palettes

| Palette | Scale | Character | Synth Type |
|---------|-------|-----------|------------|
| 🌟 **Neon** | Pentatonic | Bright & Cheerful | Triangle Wave |
| 🌅 **Sunset** | Major | Uplifting & Happy | Sine Wave |
| 🌊 **Ocean** | Minor | Moody & Emotional | Sine Wave (Deep) |
| ✨ **Galaxy** | Blues | Soulful & Expressive | Sawtooth Wave |

Each palette has unique:
- Musical scales
- Synth envelopes (attack/decay/sustain/release)
- Reverb depths
- Delay timings

[Learn more about sound palettes →](./SOUND_PALETTES.md)

---

## 🌐 Deploy Online

Ready to share with the world? Check out our comprehensive deployment guide!

**[📖 Full Deployment Guide](./DEPLOYMENT.md)**

Quick deploy options:
- **Render.com** (Recommended - Free tier for both frontend & backend)
- **Vercel + Railway** (Better performance)
- **Netlify + Render** (Alternative)

---

## 📁 Project Structure

```
sonic-canvas/
├── server.js                 # Backend Socket.io server
├── package.json              # Backend dependencies
├── client/
│   ├── src/
│   │   ├── App.jsx           # Main application component
│   │   ├── hooks/
│   │   │   ├── useSynth.js   # Tone.js audio engine hook
│   │   │   └── useSocket.js  # Socket.io client hook
│   │   ├── components/
│   │   │   ├── CanvasScene.jsx  # React Three Fiber canvas
│   │   │   └── Beat.jsx         # 3D animated beat component
│   │   └── index.css         # Tailwind CSS setup
│   ├── tailwind.config.js    # Tailwind configuration
│   ├── postcss.config.js     # PostCSS configuration
│   └── package.json          # Frontend dependencies
```

---

## 🎨 Features Implemented

### ✅ Backend (server.js)
- Express server on port 3001
- Socket.io with CORS enabled for localhost:5173
- **Events**:
  - `trigger-beat`: Receives beat data from clients
  - `receive-beat`: Broadcasts beats to all connected clients
  - `user-count`: Broadcasts current connected user count
- Real-time user count tracking

### ✅ Frontend Audio Engine (useSynth.js)
- Tone.js PolySynth with triangle oscillator
- 5-second Reverb effect for atmospheric depth
- PingPongDelay for spatial stereo width
- Pentatonic scale mapping: C4, D4, E4, G4, A4, C5
- Y-axis position → note mapping (top = higher notes)
- Browser audio context activation via user interaction

### ✅ Visual Layer (React Three Fiber)
- **CanvasScene.jsx**: Full-screen 3D canvas with bloom post-processing
- **Beat.jsx**: Animated icosahedron meshes
  - React Spring animations (spawn → pulse → fade)
  - Random neon colors (Cyan, Magenta, Lime)
  - Rotation animations
  - High emissive intensity for glow
- Bloom effect with intensity 2.5 for intense glow

### ✅ Multiplayer Networking (useSocket.js)
- Auto-connect to backend server
- Real-time beat synchronization across all clients
- User count tracking
- Auto-reconnection logic
- Proper cleanup on unmount

### ✅ UI/UX (Tailwind CSS)
- **Glassmorphism**: backdrop-blur-md, bg-white/10, border-white/20
- **"SONIC CANVAS" Header**: Floating, thin font, ultra-wide letter spacing
- **Start Audio Button**: Glass pill design with hover effects
- **User Count Indicator**: Bottom right corner, shows active users
- **Status Indicator**: Top left, shows audio and connection status
- **Z-index Layering**: Canvas (z-0), Interactive area (z-5), UI (z-10)
- **Pointer Events**: Proper event handling for clickable vs non-clickable elements

---

## 🎮 User Flow

1. **User opens http://localhost:5173**
2. **Sees "Start Audio" screen** (browser audio context requires user interaction)
3. **Clicks "Start Audio"** → Initializes Tone.js
4. **UI Updates**:
   - "SONIC CANVAS" header appears at top
   - User count shows in bottom right
   - Status indicator in top left
5. **User clicks anywhere on screen**:
   - Note plays (based on Y position)
   - 3D glowing shape spawns at click location
   - Event broadcast to all connected users via Socket.io
6. **All users see and hear the same beat** (multiplayer sync)
7. **Beats auto-cleanup after 2 seconds** (memory management)

---

## 🎹 Technical Details

### Audio Engine
- **Synth**: Tone.PolySynth with triangle oscillator
- **Effects Chain**: Synth → PingPongDelay → Reverb → Output
- **Scale**: Pentatonic (C4, D4, E4, G4, A4, C5)
- **Mapping**: Screen Y-position (0-1) → Note selection (inverted: top = high)

### Visual Engine
- **Shapes**: Icosahedron geometry
- **Animation Duration**: 2 seconds (spawn + fade)
- **Colors**: Randomized from [Cyan, Magenta, Lime]
- **Bloom**: Intensity 2.5, radius 0.8, mipmapBlur enabled

### Network Protocol
**Client → Server**: `trigger-beat`
```json
{
  "id": "socket-id-timestamp",
  "x": 0.5,        // Normalized X (0-1)
  "y": 0.3,        // Normalized Y (0-1)
  "color": "#00FFFF",
  "note": "E4"
}
```

**Server → All Clients**: `receive-beat` (same payload)

**Server → All Clients**: `user-count`
```json
4  // Integer: number of connected users
```

---

## 🎨 Design System

### Colors
- Background: `#050505` (nearly black)
- Neon Palette: `#00FFFF` (Cyan), `#FF00FF` (Magenta), `#00FF00` (Lime)
- UI Glass: `rgba(255, 255, 255, 0.1)` with `backdrop-blur-md`

### Typography
- Font: Inter (thin weight for headers)
- Letter Spacing: Ultra-wide (0.3em) for "SONIC CANVAS"

### Effects
- Bloom: Intense glow on all 3D objects
- Glassmorphism: Blur + translucent backgrounds on UI
- Animations: React Spring for beats, CSS keyframes for click feedback

---

## 🧪 Testing Multiplayer

1. Open **multiple browser tabs** to http://localhost:5173
2. Start audio in each tab
3. Click in any tab
4. **Verify**: All tabs play the same note and show the same glowing shape
5. **User count** updates in real-time as tabs connect/disconnect

---

## 🔧 Dependencies

### Backend
- `express`: ^4.18.2
- `socket.io`: ^4.7.2
- `cors`: ^2.8.5

### Frontend
- `react`: ^18.3.1
- `react-dom`: ^18.3.1
- `tone`: ^15.0.4
- `socket.io-client`: ^4.7.2
- `three`: Latest
- `@react-three/fiber`: Latest
- `@react-three/drei`: Latest
- `@react-three/postprocessing`: Latest
- `@react-spring/three`: Latest
- `tailwindcss`: Latest
- `postcss`: Latest
- `autoprefixer`: Latest

---

## 🎯 Key Achievements

✅ Real-time multiplayer audio-visual synchronization
✅ Professional glassmorphic UI with Tailwind CSS
✅ Deep Space Synthwave aesthetic with bloom effects
✅ Pentatonic scale audio engine with atmospheric effects
✅ 3D animated beats with React Three Fiber
✅ Proper memory management (auto-cleanup)
✅ User count tracking
✅ Responsive z-index layering
✅ Contest-ready polish and user experience

---

## 🚀 Next Steps (Optional Enhancements)

- [ ] Mobile touch support
- [ ] More instruments/sounds
- [ ] Recording/playback functionality
- [ ] User avatars or cursors
- [ ] Beat history visualization
- [ ] Performance optimizations for 100+ concurrent users
- [ ] Deploy to production (Vercel/Railway/Render)

---

**Built with ❤️ for the Vibe Code Contest**

🎵 Click. Create. Collaborate. 🌌
