# 🎵 Sound Palette System

## Overview
Each color palette now has its own unique sound characteristics, including different musical scales, synth types, and audio effects!

## Palette Presets

### 🌟 Neon - Pentatonic (Bright & Cheerful)
- **Scale**: Pentatonic (C, D, E, G, A, C)
- **Synth**: Triangle wave
- **Character**: Classic, bright, and cheerful
- **Reverb**: 5s decay, 40% wet
- **Delay**: 8th note, moderate feedback
- **Best For**: Upbeat, energetic sessions

### 🌅 Sunset - Major (Uplifting & Happy)
- **Scale**: Major (C, D, E, F, G, A, B, C)
- **Synth**: Sine wave (pure, warm)
- **Character**: Happy and uplifting
- **Reverb**: 3s decay, 50% wet (bright & airy)
- **Delay**: 16th note (faster echoes), higher feedback
- **Attack**: Fast (0.05s) for responsive feel
- **Release**: Long (2.0s) for smooth sustain
- **Best For**: Melodic, positive vibes

### 🌊 Ocean - Minor (Moody & Emotional)
- **Scale**: Natural Minor (C, D, Eb, F, G, Ab, Bb, C)
- **Synth**: Sine wave (smooth, deep)
- **Character**: Moody and contemplative
- **Reverb**: 8s decay, 60% wet (very spacious)
- **Delay**: Quarter note (slow, dreamy)
- **Attack**: Slow (0.2s) for gentle onset
- **Release**: Very long (3.0s) for atmospheric trails
- **Best For**: Ambient, emotional soundscapes

### ✨ Galaxy - Blues (Soulful & Expressive)
- **Scale**: Blues (C, Eb, F, F#, G, Bb, C)
- **Synth**: Sawtooth wave (edgy, bright harmonics)
- **Character**: Soulful with that blues feeling
- **Reverb**: 6s decay, 45% wet
- **Delay**: Dotted 8th note (syncopated feel)
- **Envelope**: Punchy (0.08 attack, 0.3 sustain)
- **Best For**: Expressive, bluesy jams

## Technical Details

### Musical Scales Explained
- **Pentatonic**: 5-note scale, can't play wrong notes - great for improvisation
- **Major**: Full 7-note happy scale - familiar and consonant
- **Minor**: 7-note melancholic scale - deeper emotions
- **Blues**: 6-note scale with characteristic "blue notes" (F#) - soulful and expressive

### Synth Types
- **Triangle**: Mellow, warm tone (softer than square wave)
- **Sine**: Purest tone, smooth and fundamental
- **Sawtooth**: Bright, rich in harmonics, cutting through the mix

### Audio Effects Chain
Each preset uses:
1. **Synth** → Generates the note
2. **PingPongDelay** → Creates stereo echo/space
3. **Low-Pass Filter** → Opens based on energy (500Hz → 20kHz)
4. **Reverb** → Adds atmospheric depth
5. **Output** → Your speakers!

## Usage

Simply select a palette from the Controls panel. The sound will automatically switch to match!

- Try **Neon** for fast-paced fun
- Switch to **Ocean** for chill ambient vibes
- Use **Sunset** for happy melodies
- Jam with **Galaxy** for that bluesy feel

## Energy System Integration

The low-pass filter still responds to your energy level:
- **Low energy**: Muffled (500Hz) - encourages you to keep clicking!
- **High energy**: Crisp & open (20kHz) - reward for active play

Combined with palette-specific reverb/delay, each palette has its own "feel" at different energy levels!
