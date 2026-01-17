// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// vite.config.ts
export default defineConfig({
  plugins: [react()],
  // Elimina completamente la sección css.preprocessorOptions.scss
})
