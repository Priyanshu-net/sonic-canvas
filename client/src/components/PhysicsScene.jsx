// File: PhysicsScene.jsx
import { Canvas, useFrame } from '@react-three/fiber';
import { Physics, usePlane, useSphere } from '@react-three/cannon';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { useRef, useState, useEffect } from 'react';
import { animated, useSpring } from '@react-spring/three';
import * as THREE from 'three';

/**
 * PhysicsBall - A physics-enabled sphere that falls and bounces
 */
const PhysicsBall = ({
  initialPosition,
  color,
  note,
  onCollide,
  energyLevel = 0,
  id
}) => {
  const [ref] = useSphere(() => ({
    mass: 1,
    position: initialPosition,
    restitution: 0.8, // Bounciness
    args: [0.3], // Radius
    onCollide: () => {
      if (!onCollide || !ref.current) return;
      // Use current mesh world position as impact point
      const p = ref.current.position;
      const point = [p.x, p.y, p.z];
      onCollide(point, note, color, 1);
    }
  }));

  const [isVisible, setIsVisible] = useState(true);
  const spawnTime = useRef(Date.now());

  // Cleanup after 10 seconds or if ball falls off
  useFrame(() => {
    if (ref.current) {
      const pos = ref.current.position;
      const elapsed = Date.now() - spawnTime.current;

      // Remove if too old or fell off the edge
      if (elapsed > 10000 || pos.y < -15 || Math.abs(pos.x) > 20 || Math.abs(pos.z) > 20) {
        setIsVisible(false);
      }
    }
  });

  // Determine geometry based on energy level
  const isHighEnergy = energyLevel > 10;
  const emissiveIntensity = energyLevel > 10 ? 3 : 2;

  if (!isVisible) return null;

  return (
    <mesh ref={ref} castShadow receiveShadow>
      {isHighEnergy ? (
        <icosahedronGeometry args={[0.3, 1]} />
      ) : (
        <sphereGeometry args={[0.3, 32, 32]} />
      )}
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={emissiveIntensity}
        roughness={0.3}
        metalness={0.7}
      />
      {/* Particle trail for high energy */}
      {isHighEnergy && (
        <pointLight position={[0, 0, 0]} color={color} intensity={2} distance={3} />
      )}
    </mesh>
  );
};

/**
 * PhysicsFloor - Transparent collision plane at y = -5
 */
const PhysicsFloor = () => {
  const [ref] = usePlane(() => ({
    rotation: [-Math.PI / 2, 0, 0],
    position: [0, -5, 0],
    type: 'Static'
  }));

  return (
    <mesh ref={ref} receiveShadow>
      <planeGeometry args={[50, 50]} />
      <meshStandardMaterial
        color="#1a1a2e"
        transparent
        opacity={0.1}
        roughness={0.1}
        metalness={0.9}
      />
      {/* Grid helper for visual reference */}
      <gridHelper args={[50, 50, '#333344', '#222233']} position={[0, 0.01, 0]} />
    </mesh>
  );
};

/**
 * CameraShake - Applies camera shake based on energy level
 */
const CameraShake = ({ energyLevel, cps }) => {
  useFrame((state) => {
    if (cps > 5) {
      const intensity = Math.min(cps / 20, 1); // Scale intensity with CPS
      const shake = intensity * 0.1;
      
      state.camera.position.x += (Math.random() - 0.5) * shake;
      state.camera.position.y += (Math.random() - 0.5) * shake;
      
      // Smooth return to center
      state.camera.position.x *= 0.95;
      state.camera.position.y *= 0.95;
    }
  });

  return null;
};

/**
 * ImpactParticles - Visual explosion at collision point
 */
const ImpactParticles = ({ position, color }) => {
  const particlesRef = useRef();
  const [particles] = useState(() => {
    const count = 20;
    const positions = new Float32Array(count * 3);
    const velocities = [];
    
    for (let i = 0; i < count; i++) {
      positions[i * 3] = position[0];
      positions[i * 3 + 1] = position[1];
      positions[i * 3 + 2] = position[2];
      
      // Random velocity for each particle
      velocities.push([
        (Math.random() - 0.5) * 0.2,
        Math.random() * 0.3,
        (Math.random() - 0.5) * 0.2
      ]);
    }
    
    return { positions, velocities, count };
  });

  const [opacity, setOpacity] = useState(1);

  useFrame((state, delta) => {
    if (particlesRef.current && opacity > 0) {
      const positions = particlesRef.current.geometry.attributes.position.array;
      
      for (let i = 0; i < particles.count; i++) {
        positions[i * 3] += particles.velocities[i][0];
        positions[i * 3 + 1] += particles.velocities[i][1];
        positions[i * 3 + 2] += particles.velocities[i][2];
        
        // Apply gravity
        particles.velocities[i][1] -= 0.01;
      }
      
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
      setOpacity(prev => Math.max(0, prev - delta * 2));
    }
  });

  if (opacity <= 0) return null;

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particles.count}
          array={particles.positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.1}
        color={color}
        transparent
        opacity={opacity}
        sizeAttenuation
      />
    </points>
  );
};

/**
 * PhysicsScene - Main physics-enabled 3D scene
 */
export const PhysicsScene = ({
  balls = [],
  onBallCollision,
  energyLevel = 0,
  cps = 0,
  bloomIntensity
}) => {
  const [impacts, setImpacts] = useState([]);

  const handleCollision = (point, note, color, velocity) => {
    // Create impact particle effect
    const impactId = `impact-${Date.now()}-${Math.random()}`;
    setImpacts(prev => [...prev, {
      id: impactId,
      position: [point[0], point[1], point[2]],
      color
    }]);

    // Trigger the callback
    if (onBallCollision) {
      onBallCollision(point, note, color, velocity);
    }

    // Remove impact after 2 seconds
    setTimeout(() => {
      setImpacts(prev => prev.filter(i => i.id !== impactId));
    }, 2000);
  };

  return (
    <Canvas
      shadows
      camera={{ position: [0, 2, 10], fov: 75 }}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: '#050505',
        pointerEvents: 'none'
      }}
    >
      <color attach="background" args={[ '#050505' ]} />
      
      {/* Lighting */}
    <ambientLight intensity={0.3} />
    <pointLight position={[10, 10, 10]} intensity={1} castShadow />
      <pointLight position={[-10, 5, -10]} intensity={0.5} color="#4466ff" />
      
      {/* Physics World */}
      <Physics gravity={[0, -9.8, 0]}>
  <PhysicsFloor />
        
        {/* Render all balls */}
        {balls.map((ball) => (
          <PhysicsBall
            key={ball.id}
            id={ball.id}
            initialPosition={ball.position}
            color={ball.color}
            note={ball.note}
            onCollide={handleCollision}
            energyLevel={energyLevel}
          />
        ))}
      </Physics>

      {/* Impact particles */}
      {impacts.map((impact) => (
        <ImpactParticles
          key={impact.id}
          position={impact.position}
          color={impact.color}
        />
      ))}

      {/* Camera shake effect */}
      <CameraShake energyLevel={energyLevel} cps={cps} />

      {/* Post-processing */}
      <EffectComposer>
        <Bloom
          intensity={bloomIntensity ?? (energyLevel > 10 ? 3.5 : 2.0)}
          luminanceThreshold={0}
          luminanceSmoothing={0.9}
          mipmapBlur
          radius={0.8}
        />
      </EffectComposer>
    </Canvas>
  );
};
