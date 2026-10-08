import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
  server: {
    proxy: {
      // Lint and simulation: the sim container (<repo>/sim).
      '/api/sim': 'http://localhost:8001',
      // Neural chat: the RAG service (<repo>/rag).
      '/api/chat': 'http://localhost:8002',
    },
  },
})
