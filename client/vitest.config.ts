import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    // dependency inlining: using virtual mocks instead
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: [
        'src/hooks/**/*.{js,jsx,ts,tsx}',
        'src/components/HUD.jsx',
        'src/components/ControlsPanel.jsx'
      ],
      exclude: [
        'src/main.jsx',
        'src/**/__tests__/**',
        'src/test/**',
        'src/test/mocks/**',
        'src/components/PhysicsScene.jsx',
        'src/components/CanvasScene.jsx',
        'src/components/Beat.jsx'
      ],
      reportOnFailure: true,
      thresholds: {
        statements: 70,
        lines: 60,
        functions: 60,
        branches: 37
      }
    }
  },
  resolve: {
    alias: {
      '@react-three/fiber': resolve(__dirname, 'src/test/mocks/reactThreeFiber.js'),
      '@react-three/cannon': resolve(__dirname, 'src/test/mocks/reactThreeCannon.js'),
      '@react-three/postprocessing': resolve(__dirname, 'src/test/mocks/postprocessing.js')
    }
  }
});
