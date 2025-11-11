import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // 👈 Fixed port so Vite always runs here
    open: true, // (optional) auto-opens browser when you run `npm run dev`
  },
})
