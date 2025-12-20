import { useState, useCallback, useEffect, useRef } from 'react';

export const useGameification = () => {
  // Game State
  const [combo, setCombo] = useState(0);
  const [score, setScore] = useState(0);
  const [achievements, setAchievements] = useState([]);
  
  // Stats
  const [cps, setCps] = useState(0); 
  const [energyLevel, setEnergyLevel] = useState(0);
  
  // Time State (This triggers the UI update)
  const [lastInteractionTime, setLastInteractionTime] = useState("No activity yet");

  // Refs (Mutable data that doesn't trigger re-renders)
  const clickTimestamps = useRef([]);
  const comboRef = useRef(0); 

  // --- 1. Sync Ref with State ---
  // We keep a ref of the combo so the Interval can read the live value
  // without needing to restart the interval every time 'combo' changes.
  useEffect(() => {
    comboRef.current = combo;
  }, [combo]);

  // --- 2. The Game Loop (100ms Tick) ---
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      
      // Filter out clicks older than 1 second to calculate CPS
      clickTimestamps.current = clickTimestamps.current.filter(
        timestamp => now - timestamp <= 1000
      );
      
      const currentCps = clickTimestamps.current.length;
      setCps(currentCps);
      
      // Calculate Energy: CPS + (Combo / 5)
      // We use comboRef.current here to get the latest value safely
      const energy = currentCps + Math.floor(comboRef.current / 5);
      setEnergyLevel(energy);
      
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // --- 3. Achievement System ---
  useEffect(() => {
    setAchievements(prev => {
      const newUnlocks = [];
      // Logic: If combo is high enough AND we don't have the badge yet -> Add it
      if (combo >= 10 && !prev.includes('combo10')) newUnlocks.push('combo10');
      if (combo >= 50 && !prev.includes('combo50')) newUnlocks.push('combo50');
      
      return newUnlocks.length > 0 ? [...prev, ...newUnlocks] : prev;
    });
  }, [combo]);

  // --- 4. Actions ---
  
  // Called internally whenever an action happens
  const recordClick = useCallback(() => {
    const now = new Date();
    
    // Track timestamp for CPS calculation
    clickTimestamps.current.push(now.getTime());
    
    // Update the UI state with readable time (e.g., "2:30:45 PM")
    setLastInteractionTime(now.toLocaleTimeString());
  }, []);

  // The main function you call from your button
  const incrementCombo = useCallback(() => {
    recordClick(); // <--- Update time and CPS
    
    setCombo(prevCombo => {
      const newCombo = prevCombo + 1;
      // Score = Old Score + (New Combo * 10)
      setScore(prevScore => prevScore + (newCombo * 10));
      return newCombo;
    });
  }, [recordClick]);

  const resetCombo = useCallback(() => {
    setCombo(0);
  }, []);

  // --- 5. Getters for UI Feedback ---
  
  const getComboMultiplier = useCallback(() => {
    if (combo >= 50) return '🔥 FIRE!';
    if (combo >= 20) return '⚡ LIGHTNING!';
    if (combo >= 10) return '✨ HOT!';
    return '';
  }, [combo]);

  const getEnergyState = useCallback(() => {
    if (energyLevel > 15) return 'EXTREME';
    if (energyLevel > 10) return 'HIGH';
    if (energyLevel > 5) return 'MEDIUM';
    return 'LOW';
  }, [energyLevel]);

  // --- 6. Return Values ---
  return {
    combo,
    score,
    achievements,
    cps,
    energyLevel,
    lastInteractionTime, // This string is now ready to use in your UI
    incrementCombo,
    resetCombo,
    getComboMultiplier,
    getEnergyState
  };
};