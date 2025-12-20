import { useState, useCallback, useEffect, useRef } from 'react';

export const useGameification = () => {
  const [combo, setCombo] = useState(0);
  const [score, setScore] = useState(0);
  const [cps, setCps] = useState(0); 
  const [energyLevel, setEnergyLevel] = useState(0);
  const clickTimestamps = useRef([]);
  const comboRef = useRef(0); 

  useEffect(() => { comboRef.current = combo; }, [combo]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      clickTimestamps.current = clickTimestamps.current.filter(ts => now - ts <= 1000);
      const currentCps = clickTimestamps.current.length;
      setCps(currentCps);
      setEnergyLevel(currentCps + Math.floor(comboRef.current / 5));
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const incrementCombo = useCallback(() => {
    const now = Date.now();
    clickTimestamps.current.push(now);
    setCombo(p => {
      const n = p + 1;
      setScore(s => s + (n * 10));
      return n;
    });
  }, []);

  const resetCombo = useCallback(() => setCombo(0), []);

  const getComboMultiplier = useCallback(() => {
    if (combo >= 50) return '🔥 FIRE!';
    if (combo >= 20) return '⚡ LIGHTNING!';
    if (combo >= 10) return '✨ HOT!';
    return '';
  }, [combo]);

  return { combo, score, cps, energyLevel, incrementCombo, resetCombo, getComboMultiplier };
};