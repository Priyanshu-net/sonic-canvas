import { Canvas } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { Beat } from './Beat';

export const CanvasScene = ({ beats = [], isDarkMode = true }) => {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 75 }}
      style={{
        position: 'absolute', inset: 0,
        // Smooth transition between Dark (Void) and Light (Cloud)
        background: isDarkMode ? '#050505' : '#e0e5ec',
        transition: 'background 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)',
        pointerEvents: 'none'
      }}
    >
      {/* Lighting adapts to theme */}
      <ambientLight intensity={isDarkMode ? 0.4 : 0.8} />
      <pointLight position={[10, 10, 10]} intensity={isDarkMode ? 1.5 : 0.8} />
      
      {beats.map((beat) => (
        <Beat key={beat.id} position={beat.position} color={beat.color} isDarkMode={isDarkMode} />
      ))}

      <EffectComposer>
        <Bloom 
          intensity={isDarkMode ? 2.0 : 0.6} // Lower bloom in light mode to prevent washout
          luminanceThreshold={isDarkMode ? 0.1 : 0.6} 
          mipmapBlur 
        />
      </EffectComposer>
    </Canvas>
  );
};