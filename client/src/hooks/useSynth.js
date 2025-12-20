import { useRef, useState, useCallback } from 'react';

let ToneModule = null;

const SCALES = {
  pentatonic: ['C4', 'D4', 'E4', 'G4', 'A4', 'C5'],
  minor: ['C4', 'D4', 'Eb4', 'F4', 'G4', 'Ab4', 'Bb4', 'C5'],
  major: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'],
  blues: ['C4', 'Eb4', 'F4', 'F#4', 'G4', 'Bb4', 'C5'],
};

const SYNTH_PRESETS = {
  neon: { scale: 'pentatonic', oscillator: { type: 'triangle' }, envelope: { attack: 0.1, decay: 0.3, sustain: 0.4, release: 1.5 }, reverb: { decay: 5, wet: 0.4 }, delay: { delayTime: '8n', feedback: 0.3, wet: 0.25 }, filter: { frequency: 500 } },
  sunset: { scale: 'major', oscillator: { type: 'sine' }, envelope: { attack: 0.05, decay: 0.2, sustain: 0.6, release: 2.0 }, reverb: { decay: 3, wet: 0.5 }, delay: { delayTime: '16n', feedback: 0.4, wet: 0.3 }, filter: { frequency: 800 } },
  ocean: { scale: 'minor', oscillator: { type: 'sine' }, envelope: { attack: 0.2, decay: 0.4, sustain: 0.5, release: 3.0 }, reverb: { decay: 8, wet: 0.6 }, delay: { delayTime: '4n', feedback: 0.5, wet: 0.35 }, filter: { frequency: 400 } },
  galaxy: { scale: 'blues', oscillator: { type: 'sawtooth' }, envelope: { attack: 0.08, decay: 0.25, sustain: 0.3, release: 1.2 }, reverb: { decay: 6, wet: 0.45 }, delay: { delayTime: '8n.', feedback: 0.35, wet: 0.28 }, filter: { frequency: 600 } }
};

export const useSynth = () => {
  const synthRef = useRef(null);
  const reverbRef = useRef(null);
  const delayRef = useRef(null);
  const filterRef = useRef(null);
  const pannerRef = useRef(null);
  const [isAudioReady, setIsAudioReady] = useState(false);
  const [currentPreset, setCurrentPreset] = useState('neon');
  const currentScaleRef = useRef(SCALES.pentatonic);
  const initialReverbWetRef = useRef(null);

  const initializeSynth = useCallback((presetName = 'neon') => {
    if (!ToneModule) return;
    const preset = SYNTH_PRESETS[presetName] || SYNTH_PRESETS.neon;
    
    if (synthRef.current) synthRef.current.dispose();
    if (reverbRef.current) reverbRef.current.dispose();
    if (delayRef.current) delayRef.current.dispose();
    if (filterRef.current) filterRef.current.dispose();
    if (pannerRef.current) pannerRef.current.dispose();

    synthRef.current = new ToneModule.PolySynth(ToneModule.Synth, { oscillator: preset.oscillator, envelope: preset.envelope });
    reverbRef.current = new ToneModule.Reverb(preset.reverb);
    filterRef.current = new ToneModule.Filter({ type: 'lowpass', frequency: preset.filter.frequency, rolloff: -24, Q: 1 });
    delayRef.current = new ToneModule.PingPongDelay(preset.delay);
    pannerRef.current = new ToneModule.Panner(0);
    const compressor = new ToneModule.Compressor({ threshold: -18, ratio: 3, attack: 0.02, release: 0.2 });
    const limiter = new ToneModule.Limiter(-1);

    synthRef.current.chain(pannerRef.current, delayRef.current, filterRef.current, reverbRef.current, compressor, limiter, ToneModule.getDestination());

    if (initialReverbWetRef.current != null) {
      try { reverbRef.current.wet.rampTo(initialReverbWetRef.current, 0.1); } catch {}
    }
    currentScaleRef.current = SCALES[preset.scale] || SCALES.pentatonic;
  }, []);

  const startAudio = useCallback(async () => {
    try {
      if (!ToneModule) ToneModule = await import('tone');
      await ToneModule.start();
      initializeSynth(currentPreset);
      setIsAudioReady(true);
    } catch (error) { console.error('Failed to start audio:', error); }
  }, [currentPreset, initializeSynth]);

  const mapYToNote = useCallback((normalizedY) => {
    const scale = currentScaleRef.current;
    const invertedY = 1 - Math.min(Math.max(normalizedY, 0), 1);
    const index = Math.floor(invertedY * scale.length);
    return scale[Math.min(index, scale.length - 1)];
  }, []);

  const playNote = useCallback((normalizedY) => {
    if (!synthRef.current || !isAudioReady) return null;
    const note = mapYToNote(normalizedY);
    synthRef.current.triggerAttackRelease(note, '8n');
    return note;
  }, [isAudioReady, mapYToNote]);

  const playNoteName = useCallback((noteName, opts = {}) => {
    if (!synthRef.current || !isAudioReady || !noteName) return;
    const { pan = 0, velocity = 0.8 } = opts;
    if (pannerRef.current) {
      try { pannerRef.current.pan.rampTo(Math.max(-1, Math.min(1, pan)), 0.02); } catch {}
    }
    synthRef.current.triggerAttackRelease(noteName, '8n', undefined, Math.max(0, Math.min(1, velocity)));
  }, [isAudioReady]);

  const updateFilter = useCallback((energyLevel) => {
    if (!filterRef.current || !isAudioReady) return;
    const targetFreq = 500 + (20000 - 500) * Math.min(energyLevel / 20, 1);
    filterRef.current.frequency.rampTo(targetFreq, 0.1);
  }, [isAudioReady]);

  const setSynthPreset = useCallback((presetName) => {
    if (!isAudioReady) { setCurrentPreset(presetName); return; }
    setCurrentPreset(presetName);
    initializeSynth(presetName);
  }, [isAudioReady, initializeSynth]);

  const setReverbWet = useCallback((wet) => {
    const clamped = Math.max(0, Math.min(1, wet));
    initialReverbWetRef.current = clamped;
    if (reverbRef.current) try { reverbRef.current.wet.rampTo(clamped, 0.1); } catch {}
  }, []);

  return { playNote, playNoteName, startAudio, isAudioReady, mapYToNote, updateFilter, setSynthPreset, setReverbWet };
};

// Back-compat helper for tests: map normalized Y to a pentatonic note directly
export const mapYToPentatonic = (normalizedY) => {
  const scale = SCALES.pentatonic;
  const invertedY = 1 - Math.min(Math.max(normalizedY, 0), 1);
  const index = Math.floor(invertedY * scale.length);
  return scale[Math.min(index, scale.length - 1)];
};