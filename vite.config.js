import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'BolKhata - Digital Voice Khata',
        short_name: 'BolKhata',
        description: 'Voice-first Hindi/Hinglish digital khata app for Indian kirana shopkeepers',
        theme_color: '#047857',
        background_color: '#f8fafc',
        display: 'standalone'
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      }
    })
  ],
  server: {
    port: 5173,
    host: true
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.js']
  }
});
