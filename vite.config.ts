import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // relative paths so the build works at nweinberg97.github.io/bucketlist/ (routing is hash-based)
  base: './',
  plugins: [react(), tailwindcss()],
});
