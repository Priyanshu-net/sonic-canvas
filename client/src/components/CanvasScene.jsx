import { Canvas } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { Beat } from './Beat';

/**
 * CanvasScene - Full-screen React Three Fiber canvas with post-processing
 * @param {Object} props
 * @param {Array} props.beats - Array of beat objects { id, position: [x, y, z], note, color }
 */
export const CanvasScene = ({ beats = [] }) => {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 75 }}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: '#050505',
        pointerEvents: 'none' // Let clicks pass through to the parent
      }}
    >
      {/* Ambient lighting for visibility */}
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />

      {/* Render all active beats */}
      {beats.map((beat) => (
        <Beat
          key={beat.id}
          position={beat.position}
          color={beat.color}
        />
      ))}

      {/* Post-processing effects */}
      <EffectComposer>
        <Bloom
          intensity={2.5}        // Intense glow
          luminanceThreshold={0}  // Everything glows
          luminanceSmoothing={0.9}
          mipmapBlur
          radius={0.8}           // Spread of bloom
        />
      </EffectComposer>
    </Canvas>
  );
};
