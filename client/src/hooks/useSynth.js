// File: useSynth.js
import { useRef, useState, useCallback } from 'react';
import * as Tone from 'tone';

// Multiple musical scales for diversity
const SCALES = {
  pentatonic: ['C4', 'D4', 'E4', 'G4', 'A4', 'C5'], // Classic pentatonic - bright & cheerful
  minor: ['C4', 'D4', 'Eb4', 'F4', 'G4', 'Ab4', 'Bb4', 'C5'], // Natural minor - moody & emotional
  major: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'], // Major scale - happy & uplifting
  blues: ['C4', 'Eb4', 'F4', 'F#4', 'G4', 'Bb4', 'C5'], // Blues scale - soulful
  chromatic: ['C4', 'C#4', 'D4', 'D#4', 'E4', 'F4', 'F#4', 'G4', 'G#4', 'A4', 'A#4', 'B4', 'C5'] // All notes - experimental
};

// Synth presets for different palettes
const SYNTH_PRESETS = {
  neon: {
    scale: 'pentatonic',
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.1, decay: 0.3, sustain: 0.4, release: 1.5 },
    reverb: { decay: 5, wet: 0.4 },
    delay: { delayTime: '8n', feedback: 0.3, wet: 0.25 },
    filter: { frequency: 500 }
  },
  sunset: {
    scale: 'major',
    oscillator: { type: 'sine' },
    envelope: { attack: 0.05, decay: 0.2, sustain: 0.6, release: 2.0 },
    reverb: { decay: 3, wet: 0.5 },
    delay: { delayTime: '16n', feedback: 0.4, wet: 0.3 },
    filter: { frequency: 800 }
  },
  ocean: {
    scale: 'minor',
    oscillator: { type: 'sine' },
    envelope: { attack: 0.2, decay: 0.4, sustain: 0.5, release: 3.0 },
    reverb: { decay: 8, wet: 0.6 },
    delay: { delayTime: '4n', feedback: 0.5, wet: 0.35 },
    filter: { frequency: 400 }
  },
  galaxy: {
    scale: 'blues',
    oscillator: { type: 'sawtooth' },
    envelope: { attack: 0.08, decay: 0.25, sustain: 0.3, release: 1.2 },
    reverb: { decay: 6, wet: 0.45 },
    delay: { delayTime: '8n.', feedback: 0.35, wet: 0.28 },
    filter: { frequency: 600 }
  }
};

// Export a pure helper for testing (backward compatibility)
export const mapYToPentatonic = (normalizedY) => {
  const invertedY = 1 - Math.min(Math.max(normalizedY, 0), 1);
  const index = Math.floor(invertedY * SCALES.pentatonic.length);
  const clampedIndex = Math.min(index, SCALES.pentatonic.length - 1);
  return SCALES.pentatonic[clampedIndex];
};

/**
 * Custom hook for managing Tone.js synth with atmospheric effects
 * Supports multiple synth presets based on color palette selection
 * @returns {Object} { playNote, startAudio, isAudioReady, setSynthPreset }
 */
export const useSynth = () => {
  const synthRef = useRef(null);
  const reverbRef = useRef(null);
  const delayRef = useRef(null);
  const filterRef = useRef(null); // Low-pass filter
  const [isAudioReady, setIsAudioReady] = useState(false);
  const [currentPreset, setCurrentPreset] = useState('neon');
  const currentScaleRef = useRef(SCALES.pentatonic);

  /**
   * Initialize or update synth with a specific preset
   */
  const initializeSynth = useCallback((presetName = 'neon') => {
    const preset = SYNTH_PRESETS[presetName] || SYNTH_PRESETS.neon;
    
    // Dispose old synth if exists
    if (synthRef.current) {
      synthRef.current.dispose();
    }
    if (reverbRef.current) {
      reverbRef.current.dispose();
    }
    if (delayRef.current) {
      delayRef.current.dispose();
    }
    if (filterRef.current) {
      filterRef.current.dispose();
    }

    // Create new synth with preset settings
    synthRef.current = new Tone.PolySynth(Tone.Synth, {
      oscillator: preset.oscillator,
      envelope: preset.envelope
    });

    // Create effects chain
    reverbRef.current = new Tone.Reverb(preset.reverb).toDestination();
    
    filterRef.current = new Tone.Filter({
      type: 'lowpass',
      frequency: preset.filter.frequency,
      rolloff: -24,
      Q: 1
    }).connect(reverbRef.current);

    delayRef.current = new Tone.PingPongDelay(preset.delay).connect(filterRef.current);

    // Connect synth to effects chain
    synthRef.current.connect(delayRef.current);

    // Update scale
    currentScaleRef.current = SCALES[preset.scale] || SCALES.pentatonic;

    console.log(`✨ Synth preset loaded: ${presetName} (${preset.scale} scale)`);
  }, []);

  /**
   * Initialize audio context and synth (requires user interaction)
   */
  const startAudio = useCallback(async () => {
    try {
      // Start Tone.js audio context
      await Tone.start();
      console.log('🎵 Audio context started');

      // Initialize with default preset
      initializeSynth(currentPreset);

      setIsAudioReady(true);
      console.log('✨ Synth initialized with atmospheric effects');
    } catch (error) {
      console.error('Failed to start audio:', error);
    }
  }, [currentPreset, initializeSynth]);

  /**
   * Map Y-axis position (0-1) to current scale note
   * @param {number} normalizedY - Y position normalized from 0 (top) to 1 (bottom)
   * @returns {string} Note name from current scale
   */
  const mapYToNote = useCallback((normalizedY) => {
    const scale = currentScaleRef.current;
    const invertedY = 1 - Math.min(Math.max(normalizedY, 0), 1);
    const index = Math.floor(invertedY * scale.length);
    const clampedIndex = Math.min(index, scale.length - 1);
    return scale[clampedIndex];
  }, []);

  /**
   * Play a note based on normalized Y position
   * @param {number} normalizedY - Y position (0-1)
   */
  const playNote = useCallback((normalizedY) => {
    if (!synthRef.current || !isAudioReady) {
      console.warn('⚠️ Audio not initialized. Click "Start Audio" first.');
      return null;
    }

    const note = mapYToNote(normalizedY);
    
    // Trigger the note with attack and release
    synthRef.current.triggerAttackRelease(note, '8n');
    console.log(`🎹 Playing: ${note}`);
    
    return note;
  }, [isAudioReady, mapYToNote]);

  /**
   * Play a specific note name (e.g., 'C4') directly
   */
  const playNoteName = useCallback((noteName) => {
    if (!synthRef.current || !isAudioReady || !noteName) return;
    synthRef.current.triggerAttackRelease(noteName, '8n');
    console.log(`🎹 Playing (direct): ${noteName}`);
  }, [isAudioReady]);

  /**
   * Update filter frequency based on energy level
   * @param {number} energyLevel - Current energy level (0-20+)
   */
  const updateFilter = useCallback((energyLevel) => {
    if (!filterRef.current || !isAudioReady) return;

    // Map energy level to filter frequency
    // Low energy: 500Hz (muffled, underwater)
    // High energy: 20000Hz (wide open, crisp)
    const minFreq = 500;
    const maxFreq = 20000;
    const normalizedEnergy = Math.min(energyLevel / 20, 1);
    const targetFreq = minFreq + (maxFreq - minFreq) * normalizedEnergy;

    // Smooth transition
    filterRef.current.frequency.rampTo(targetFreq, 0.1);
  }, [isAudioReady]);

  /**
   * Change synth preset (e.g., when palette changes)
   * @param {string} presetName - Name of preset (neon, sunset, ocean, galaxy)
   */
  const setSynthPreset = useCallback((presetName) => {
    if (!isAudioReady) {
      setCurrentPreset(presetName);
      return;
    }
    
    setCurrentPreset(presetName);
    initializeSynth(presetName);
  }, [isAudioReady, initializeSynth]);

  /**
   * Cleanup on unmount
   */
  const cleanup = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.dispose();
    }
    if (reverbRef.current) {
      reverbRef.current.dispose();
    }
    if (delayRef.current) {
      delayRef.current.dispose();
    }
    if (filterRef.current) {
      filterRef.current.dispose();
    }
  }, []);

  return {
    playNote,
    playNoteName,
    startAudio,
    isAudioReady,
    cleanup,
    mapYToNote, // Export for external use if needed
    updateFilter, // Export filter control
    setSynthPreset // Export preset switcher
  };
};
