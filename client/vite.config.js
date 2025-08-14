import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/ai-resume-hr/', // ✅ required for GitHub Pages
  server: {
    proxy: {
      '/api': 'http://localhost:5000'
    }
  }
});
