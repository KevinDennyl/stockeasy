import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/stockeasy/', // Nome exato do repositório no GitHub
  server: {
    port: 5173,
  },
});