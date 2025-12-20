import { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { animated, useSpring } from '@react-spring/three';

// Neon color palette for beats
const NEON_COLORS = [
  '#00FFFF', // Cyan
  '#FF00FF', // Magenta
  '#00FF00', // Lime
];

/**
 * Beat Component - Animated 3D shape that spawns, pulses, and fades out
 * @param {Object} props
 * @param {Array} props.position - [x, y, z] position in 3D space
 * @param {string} props.color - Hex color code (optional, will use random if not provided)
 */
export const Beat = ({ position, color: propColor }) => {
  const meshRef = useRef();
  const [startTime] = useState(() => Date.now());
  const [color] = useState(() => propColor || NEON_COLORS[Math.floor(Math.random() * NEON_COLORS.length)]);
  
  // Animation lifecycle: spawn → pulse → fade out
  const ANIMATION_DURATION = 2000; // 2 seconds total

  // React Spring animation for scale and opacity
  const [springs, api] = useSpring(() => ({
    from: { scale: 0, opacity: 0 },
    to: async (next) => {
      // Phase 1: Quick spawn (scale up)
      await next({ scale: 1.5, opacity: 1, config: { tension: 280, friction: 60 } });
      // Phase 2: Slow shrink and fade
      await next({ 
        scale: 0.3, 
        opacity: 0, 
        config: { tension: 20, friction: 20, duration: 1500 } 
      });
    }
  }), []);

  // Additional rotation animation using useFrame
  useFrame((state) => {
    if (meshRef.current) {
      const elapsed = Date.now() - startTime;
      const t = elapsed / ANIMATION_DURATION;
      
      // Gentle rotation for visual interest
      meshRef.current.rotation.x = t * Math.PI * 2;
      meshRef.current.rotation.y = t * Math.PI * 1.5;
    }
  });

  return (
    <animated.mesh
      ref={meshRef}
      position={position}
      scale={springs.scale}
    >
      {/* Icosahedron for a complex, gem-like shape */}
      <icosahedronGeometry args={[0.5, 0]} />
      <animated.meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={2}
        opacity={springs.opacity}
        transparent
        roughness={0.2}
        metalness={0.8}
      />
    </animated.mesh>
  );
};
