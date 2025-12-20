import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Physics, usePlane, useSphere } from '@react-three/cannon';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';

const PhysicsBall = ({ initialPosition, color, note, onCollide, energyLevel = 0, id, lowPerf = false, theme = 'dark' }) => {
  const hasImpulseRef = useRef(false);
  const [ref, api] = useSphere(() => ({
    mass: 1, position: initialPosition, restitution: 0.8, linearDamping: 0.01, angularDamping: 0.02, args: [0.3],
    onCollide: (e) => {
      if (!hasImpulseRef.current && e?.body && e.body.mass === 0) {
        api?.applyImpulse?.([(Math.random()-0.5)*1.2, Math.random()*0.3, (Math.random()-0.5)*1.2], [0, 0, 0]);
        hasImpulseRef.current = true;
      }
      if (!onCollide || !ref.current) return;
      const p = ref.current.position;
      onCollide([p.x, p.y, p.z], note, color, 1);
    }
  }));

  const [isVisible, setIsVisible] = useState(true);
  const spawnTime = useRef(Date.now());

  useEffect(() => {
    api?.velocity?.set?.((Math.random()-0.5)*2.0, Math.random()*1.5+0.5, (Math.random()-0.5)*2.0);
    api?.angularVelocity?.set?.((Math.random()-0.5)*3.0, (Math.random()-0.5)*3.0, (Math.random()-0.5)*3.0);
  }, [api]);

  useFrame(() => {
    if (ref.current) {
      const pos = ref.current.position;
      const elapsed = Date.now() - spawnTime.current;
      if (elapsed > 10000 || pos.y < -15 || Math.abs(pos.x) > 20 || Math.abs(pos.z) > 20) setIsVisible(false);
    }
  });

  const isHighEnergy = energyLevel > 10;
  const isDark = theme === 'dark';
  
  if (!isVisible) return null;

  return (
    <mesh ref={ref} castShadow={!lowPerf} receiveShadow>
      {isHighEnergy ? <icosahedronGeometry args={[0.3, 0]} /> : <sphereGeometry args={[0.3, 16, 16]} />}
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={isDark ? (isHighEnergy ? 3 : 2) : 0.2} 
        roughness={isDark ? 0.2 : 0.05}
        metalness={isDark ? 0.8 : 0.1}
        transparent
        opacity={isDark ? 1 : 0.9}
      />
      {isHighEnergy && !lowPerf && isDark && (
        <pointLight position={[0, 0, 0]} color={color} intensity={2} distance={3} />
      )}
    </mesh>
  );
};

const PhysicsFloor = ({ theme }) => {
  const [ref] = usePlane(() => ({ rotation: [-Math.PI / 2, 0, 0], position: [0, -5, 0], type: 'Static' }));
  const isDark = theme === 'dark';

  return (
    <mesh ref={ref} receiveShadow>
      <planeGeometry args={[50, 50]} />
      <meshStandardMaterial color={isDark ? "#050505" : "#f0f2f5"} transparent opacity={0.5} roughness={1} />
      <gridHelper args={[50, 50, isDark ? '#444' : '#ccc', isDark ? '#222' : '#ddd']} position={[0, 0.01, 0]} />
    </mesh>
  );
};

const ImpactParticles = ({ position, color, theme }) => {
  const particlesRef = useRef();
  const [particles] = useState(() => {
    const count = 15;
    const positions = new Float32Array(count * 3);
    const velocities = [];
    for (let i = 0; i < count; i++) {
      positions[i * 3] = position[0]; positions[i * 3 + 1] = position[1]; positions[i * 3 + 2] = position[2];
      velocities.push([(Math.random()-0.5)*0.2, Math.random()*0.3, (Math.random()-0.5)*0.2]);
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
        <bufferAttribute attach="attributes-position" count={particles.count} array={particles.positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={theme === 'dark' ? 0.15 : 0.1} color={color} transparent opacity={opacity} sizeAttenuation />
    </points>
  );
};

const World = ({ balls, onBallCollision, energyLevel, cps, bloomIntensity, theme }) => {
  const [impacts, setImpacts] = useState([]);
  const [lowPerf, setLowPerf] = useState(false);
  const { camera } = useThree();
  const raycasterRef = useRef(new THREE.Raycaster());
  const floorPlaneRef = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 5));

  const handleCollision = (point, note, color, velocity) => {
    const impactId = `impact-${Date.now()}-${Math.random()}`;
    setImpacts(prev => [...prev, { id: impactId, position: point, color }]);
    onBallCollision?.(point, note, color, velocity);
    setTimeout(() => setImpacts(prev => prev.filter(i => i.id !== impactId)), 2000);
  };

  const screenToFloorSpawn = (nx, ny) => {
    const xNdc = nx * 2 - 1; const yNdc = -(ny * 2 - 1);
    raycasterRef.current.setFromCamera({ x: xNdc, y: yNdc }, camera);
    const hit = raycasterRef.current.ray.intersectPlane(floorPlaneRef.current, new THREE.Vector3());
    return hit ? [hit.x, 3, hit.z] : [0, 3, 0];
  };

  const fpsSamplesRef = useRef([]);
  useFrame((state, delta) => {
    const fps = 1 / Math.max(delta, 0.0001);
    fpsSamplesRef.current.push(fps);
    if (fpsSamplesRef.current.length > 60) fpsSamplesRef.current.shift();
    const avg = fpsSamplesRef.current.reduce((a, b) => a + b, 0) / fpsSamplesRef.current.length;
    if (!lowPerf && avg < 40) setLowPerf(true);
    if (lowPerf && avg > 55) setLowPerf(false);
    
    if (cps > 5) {
       state.camera.position.x += (Math.random()-0.5) * 0.02;
       state.camera.position.y += (Math.random()-0.5) * 0.02;
       state.camera.position.x *= 0.98;
       state.camera.position.y *= 0.98;
    }
  });

  const isDark = theme === 'dark';

  return (
    <>
      <Physics gravity={[0, -9.8, 0]} allowSleep broadphase="SAP" defaultContactMaterial={{ friction: 0.02, restitution: 0.8 }}>
        <PhysicsFloor theme={theme} />
        {(lowPerf ? balls.slice(-20) : balls.slice(-40)).map((ball) => {
           const pos = ball.position || screenToFloorSpawn(ball.nx ?? 0.5, ball.ny ?? 0.5);
           pos[0] += (Math.random() - 0.5) * 0.2; pos[2] += (Math.random() - 0.5) * 0.2;
           return <PhysicsBall key={ball.id} {...ball} initialPosition={pos} onCollide={handleCollision} energyLevel={energyLevel} lowPerf={lowPerf} theme={theme} />;
        })}
      </Physics>

      {!lowPerf && impacts.map((impact) => (
        <ImpactParticles key={impact.id} position={impact.position} color={impact.color} theme={theme} />
      ))}

      <EffectComposer disableNormalPass>
        <Bloom 
          intensity={isDark ? (bloomIntensity ?? 2.0) : 0.4} 
          luminanceThreshold={isDark ? 0 : 0.65} 
          luminanceSmoothing={0.8} 
          mipmapBlur={isDark}
          radius={0.8} 
        />
      </EffectComposer>
    </>
  );
};

export const PhysicsScene = ({ balls = [], onBallCollision, energyLevel = 0, cps = 0, bloomIntensity, mobile = false, theme = 'dark' }) => {
  const isDark = theme === 'dark';
  return (
    <Canvas
      shadows={!mobile}
      camera={{ position: [0, 2, 10], fov: 75 }}
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
      data-testid="canvas"
    >
      <color attach="background" args={[isDark ? '#050505' : '#f1f5f9']} />
      <fog attach="fog" args={[isDark ? '#050505' : '#f1f5f9', 5, 30]} />
      <ambientLight intensity={isDark ? 0.3 : 0.7} />
      <directionalLight position={[10, 20, 10]} intensity={isDark ? 1 : 1.5} castShadow />
      <World balls={balls} onBallCollision={onBallCollision} energyLevel={energyLevel} cps={cps} bloomIntensity={bloomIntensity} theme={theme} />
    </Canvas>
  );
};