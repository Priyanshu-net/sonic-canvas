import { useState, useEffect, useRef } from 'react';

export const useParticles = () => {
  const [particles, setParticles] = useState([]);
  const particleIdRef = useRef(0);

  const addParticle = (x, y, color = '#64c8ff') => {
    const id = particleIdRef.current++;
    const newParticle = {
      id,
      x,
      y,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4 - 2,
      life: 1,
      color,
      size: Math.random() * 4 + 2
    };

    setParticles(prev => [...prev, newParticle]);

    setTimeout(() => {
      setParticles(prev => prev.filter(p => p.id !== id));
    }, 1000);
  };

  const addExplosion = (x, y, color = '#64c8ff', count = 20) => {
    for (let i = 0; i < count; i++) {
      setTimeout(() => addParticle(x, y, color), i * 10);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setParticles(prev => prev.map(p => ({
        ...p,
        x: p.x + p.vx,
        y: p.y + p.vy,
        vy: p.vy + 0.2, // gravity
        life: p.life - 0.02
      })).filter(p => p.life > 0));
    }, 16);

    return () => clearInterval(interval);
  }, []);

  return { particles, addParticle, addExplosion };
};
