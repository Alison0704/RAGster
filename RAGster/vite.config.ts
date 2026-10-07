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
    // Lint and simulation run in the sim container (<repo>/sim, started with `docker compose up sim`).
    proxy: { '/api/sim': 'http://localhost:8001' },
  },
})
