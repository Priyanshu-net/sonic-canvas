import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// v1 keys for localStorage persistence
const LS_KEYS = {
  variant: 'tutorial.v1.variant',
  step: 'tutorial.v1.step',
  completed: 'tutorial.v1.completed',
  done: 'tutorial.v1.done'
};

// Default steps for the checkpoint/full variants
export const DEFAULT_STEPS = [
  { id: 'audio-init', anchor: '#initialize-audio', title: 'Initialize Audio', description: 'Tap the button to enable sound.' },
  { id: 'first-beat', anchor: '[data-tutorial-id="canvas"]', title: 'Drop your first beat', description: 'Tap anywhere on the canvas to create a note.' },
  { id: 'palette-change', anchor: '[data-tutorial-id="controls-palette"]', title: 'Change the palette', description: 'Switch to a new sound palette.' },
  { id: 'theme-toggle', anchor: '[data-tutorial-id="controls-theme"]', title: 'Try light/dark', description: 'Toggle the interface theme.' },
  { id: 'set-name', anchor: '[data-tutorial-id="room-name"]', title: 'Set your name', description: 'Personalize your handle.' },
  { id: 'chat-send', anchor: '[data-tutorial-id="chat-send"]', title: 'Say hello', description: 'Send a message in chat.' },
  { id: 'contest', anchor: '[data-tutorial-id="contest-start"]', title: 'Mini contest', description: 'Start a 30s mini contest.' },
  { id: 'complete', anchor: null, title: 'All set!', description: 'You completed the tutorial.' }
];

function getQueryVariant() {
  if (typeof window === 'undefined') return null;
  const p = new URLSearchParams(window.location.search).get('tutorial');
  if (!p) return null;
  const v = p.toLowerCase();
  return ['off', 'control', 'checkpoint', 'full'].includes(v) ? v : null;
}

export function useTutorial({ socket, steps: stepsInput, defaultVariant = 'checkpoint' } = {}) {
  const initialVariant = useMemo(() => {
    const fromQuery = getQueryVariant();
    if (fromQuery) return fromQuery;
    try {
      const saved = localStorage.getItem(LS_KEYS.variant);
      return saved || defaultVariant;
    } catch (_) {
      return defaultVariant;
    }
  }, [defaultVariant]);

  const [variant, setVariant] = useState(initialVariant);
  const steps = useMemo(() => stepsInput || DEFAULT_STEPS, [stepsInput]);
  const [stepIndex, setStepIndex] = useState(() => {
    try {
      const savedIdx = localStorage.getItem(LS_KEYS.step);
      return savedIdx ? parseInt(savedIdx, 10) : 0;
    } catch (_) {
      return 0;
    }
  });
  const [completed, setCompleted] = useState(() => {
    try {
      const raw = localStorage.getItem(LS_KEYS.completed);
      return raw ? new Set(JSON.parse(raw)) : new Set();
    } catch (_) {
      return new Set();
    }
  });
  const [done, setDone] = useState(() => {
    try { return localStorage.getItem(LS_KEYS.done) === '1'; } catch (_) { return false; }
  });
  const startedRef = useRef(false);

  const current = steps[Math.min(stepIndex, steps.length - 1)] || steps[0];

  const persist = useCallback((idx, compSet, v, d) => {
    try {
      localStorage.setItem(LS_KEYS.step, String(idx));
      localStorage.setItem(LS_KEYS.completed, JSON.stringify(Array.from(compSet)));
      localStorage.setItem(LS_KEYS.variant, v);
      localStorage.setItem(LS_KEYS.done, d ? '1' : '0');
    } catch (_) {}
  }, []);

  // Analytics helper
  const emit = useCallback((type, meta = {}) => {
    try {
      if (socket?.emit) socket.emit('analytics', { type, meta });
    } catch (_) {}
  }, [socket]);

  const start = useCallback((v) => {
    const nextVariant = v || variant || defaultVariant;
    setVariant(nextVariant);
    startedRef.current = true;
    setDone(false);
    setStepIndex(0);
    setCompleted(new Set());
    emit('tutorial_start', { variant: nextVariant });
    persist(0, new Set(), nextVariant, false);
  }, [emit, persist, variant, defaultVariant]);

  const next = useCallback(() => {
    setStepIndex(i => {
      const n = Math.min(i + 1, steps.length - 1);
      const isDone = steps[n]?.id === 'complete';
      if (isDone) {
        setDone(true);
        emit('tutorial_complete', { stepsCompleted: Array.from(completed) });
        persist(n, completed, variant, true);
      } else {
        persist(n, completed, variant, false);
      }
      return n;
    });
  }, [completed, emit, persist, steps, variant]);

  const back = useCallback(() => setStepIndex(i => Math.max(0, i - 1)), []);

  const skip = useCallback(() => {
    setDone(true);
    emit('tutorial_skip', { stepId: current?.id, variant });
    persist(stepIndex, completed, variant, true);
  }, [completed, current?.id, emit, persist, stepIndex, variant]);

  const reset = useCallback(() => {
    setDone(false);
    setStepIndex(0);
    const empty = new Set();
    setCompleted(empty);
    startedRef.current = false;
    persist(0, empty, variant, false);
  }, [persist, variant]);

  const complete = useCallback((stepId) => {
    const id = stepId || current?.id;
    if (!id) return;
    if (completed.has(id)) return; // idempotent
    const nextSet = new Set(completed);
    nextSet.add(id);
    setCompleted(nextSet);
    emit('tutorial_step', { stepId: id, action: 'complete', variant });
    persist(stepIndex, nextSet, variant, done);
    // auto-advance if the current was completed
    if (id === current?.id) next();
  }, [completed, current?.id, done, emit, next, persist, stepIndex, variant]);

  // Record step show events only after tutorial started
  useEffect(() => {
    if (!current?.id) return;
    if (variant === 'off' || variant === 'control') return;
    if (!startedRef.current) return;
    emit('tutorial_step', { stepId: current.id, action: 'show', variant });
  }, [current?.id, emit, variant]);

  // If variant is control/off, mark done immediately
  useEffect(() => {
    if (variant === 'off' || variant === 'control') {
      setDone(true);
      persist(stepIndex, completed, variant, true);
    }
  }, [variant]);

  return {
    variant,
    setVariant: (v) => { setVariant(v); persist(stepIndex, completed, v, done); },
    steps,
    stepIndex,
    current,
    started: startedRef.current,
    done,
    start,
    next,
    back,
    skip,
    reset,
    complete,
  };
}
