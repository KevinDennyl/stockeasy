import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// O "base" depende de ONDE o site é publicado:
//  - GitHub Pages: o site fica em https://usuario.github.io/stockeasy/  -> base '/stockeasy/'
//  - Nuvem (build com --mode cloud): o site fica na raiz do domínio     -> base '/'
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: mode === 'cloud' ? '/' : '/stockeasy/',
  server: {
    port: 5173,
  },
}));
