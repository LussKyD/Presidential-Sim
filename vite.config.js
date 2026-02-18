import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Base path for GitHub Pages: https://lusskyd.github.io/Presidential-Sim/
export default defineConfig({
  plugins: [react()],
  base: '/Presidential-Sim/',
})
