import { useState, useEffect, useRef } from 'react';

export const useParticles = () => {
  const [particles, setParticles] = useState([]);
  const particleIdRef = useRef(0);
  const timeoutsRef = useRef([]);
  const mountedRef = useRef(true);

  const addParticle = (x, y, color = '#64c8ff') => {
    const id = particleIdRef.current++;
    setParticles(prev => [...prev, {
      id, x, y,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4 - 2,
      life: 1, color, size: Math.random() * 4 + 2
    }]);
    const t = setTimeout(() => {
      if (!mountedRef.current) return;
      setParticles(prev => prev.filter(p => p.id !== id));
    }, 1000);
    timeoutsRef.current.push(t);
  };

  const addExplosion = (x, y, color = '#64c8ff', count = 20) => {
    for (let i = 0; i < count; i++) {
      const t = setTimeout(() => { if (mountedRef.current) addParticle(x, y, color); }, i * 10);
      timeoutsRef.current.push(t);
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    const interval = setInterval(() => {
      if (!mountedRef.current) return;
      setParticles(prev => prev.map(p => ({
        ...p, x: p.x + p.vx, y: p.y + p.vy, vy: p.vy + 0.2, life: p.life - 0.02
      })).filter(p => p.life > 0));
    }, 16);
    return () => {
      mountedRef.current = false;
      clearInterval(interval);
      // Clear pending timeouts to avoid setState after unmount and jsdom teardown
      for (const t of timeoutsRef.current) clearTimeout(t);
      timeoutsRef.current = [];
    };
  }, []);

  return { particles, addParticle, addExplosion };
};