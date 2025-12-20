import { Canvas } from '@react-three/fiber';
import { Physics, usePlane, useSphere } from '@react-three/cannon';
import { EffectComposer, Bloom } from '@react-three/postprocessing';

const PhysicsBall = ({ initialPosition, color, note, onCollide, isDarkMode }) => {
  const [ref] = useSphere(() => ({
    mass: 1, position: initialPosition, restitution: 0.85,
    onCollide: (e) => onCollide([ref.current.position.x, ref.current.position.y, ref.current.position.z], note, color)
  }));

  return (
    <mesh ref={ref} castShadow>
      <sphereGeometry args={[0.3, 16, 16]} />
      <meshStandardMaterial 
        color={color} 
        emissive={color} 
        // Lighter emissive in dark mode for glow, darker in light mode for visibility
        emissiveIntensity={isDarkMode ? 2.5 : 0.4} 
        metalness={0.6} 
        roughness={0.2} 
      />
    </mesh>
  );
};

// Static floor plane for physics; invisible receiver to keep balls in bounds
const Ground = () => {
  const [ref] = usePlane(() => ({ rotation: [-Math.PI / 2, 0, 0], position: [0, -4, 0] }));
  return (
    <mesh ref={ref} receiveShadow>
      <planeGeometry args={[200, 200]} />
      <meshStandardMaterial color="#000" visible={false} />
    </mesh>
  );
};

export const PhysicsScene = ({ balls = [], onBallCollision, isDarkMode, mobile }) => {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 5, 12], fov: 60 }}
      style={{ position: 'absolute', inset: 0, background: 'transparent', pointerEvents: 'none' }}
      data-testid="canvas"
    >
      <ambientLight intensity={isDarkMode ? 0.3 : 0.8} />
      <pointLight position={[10, 10, 10]} intensity={1} castShadow />
      
      <Physics gravity={[0, -9.8, 0]} defaultContactMaterial={{ friction: 0.02, restitution: 0.8 }}>
        <Ground />
        {balls.slice(-40).map(ball => (
          <PhysicsBall key={ball.id} {...ball} onCollide={onBallCollision} isDarkMode={isDarkMode} />
        ))}
      </Physics>
      
      <EffectComposer>
        <Bloom 
            intensity={isDarkMode ? 1.5 : 0.5} 
            luminanceThreshold={isDarkMode ? 0.1 : 0.8}
            mipmapBlur 
        />
      </EffectComposer>
    </Canvas>
  );
};