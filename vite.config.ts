import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/tournaments/sarmientito/sorteo/',
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
