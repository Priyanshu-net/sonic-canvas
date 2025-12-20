import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 2000, // suppress warning; we'll split vendor chunks
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          three: [
            'three',
            '@react-three/fiber',
            '@react-three/drei',
            '@react-three/postprocessing',
            '@react-three/cannon'
          ],
          tone: ['tone']
        }
      }
    }
  }
})
