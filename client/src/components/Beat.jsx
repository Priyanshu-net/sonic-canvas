import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { animated, useSpring } from '@react-spring/three';

export const Beat = ({ position, color: propColor, isDarkMode = true }) => {
  const meshRef = useRef();
  const [startTime] = useState(() => Date.now());
  
  // Dark mode = Neon; Light mode = Deep saturated colors for contrast
  const colors = isDarkMode 
    ? ['#00FFFF', '#FF00FF', '#00FF00'] 
    : ['#0088FF', '#D6007E', '#009B00'];
    
  const [color] = useState(() => propColor || colors[Math.floor(Math.random() * colors.length)]);
  
  const ANIMATION_DURATION = 2000;

  const [springs] = useSpring(() => ({
    from: { scale: 0, opacity: 0 },
    to: async (next) => {
      await next({ scale: 1.6, opacity: 1, config: { tension: 300, friction: 20 } });
      await next({ scale: 0.2, opacity: 0, config: { tension: 40, friction: 25, duration: 1600 } });
    }
  }), []);

  useFrame(() => {
    if (meshRef.current) {
      const t = (Date.now() - startTime) / ANIMATION_DURATION;
      meshRef.current.rotation.x = t * Math.PI * 4;
      meshRef.current.rotation.z = t * Math.PI * 2;
    }
  });

  return (
    <animated.mesh ref={meshRef} position={position} scale={springs.scale}>
      <icosahedronGeometry args={[0.5, 0]} />
      <animated.meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={isDarkMode ? 2.5 : 0.8}
        opacity={springs.opacity}
        transparent
        metalness={0.9}
        roughness={0.1}
      />
    </animated.mesh>
  );
};