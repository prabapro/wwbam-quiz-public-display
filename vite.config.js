// vite.config.js

import { defineConfig } from 'vite';
import { ViteMinifyPlugin } from 'vite-plugin-minify';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react(), tailwindcss(), ViteMinifyPlugin({})],

  // ── Path aliases ───────────────────────────────────────────────────────────
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@config': resolve(__dirname, './src/config'),
      '@hooks': resolve(__dirname, './src/hooks'),
      '@utils': resolve(__dirname, './src/utils'),
      '@screens': resolve(__dirname, './src/screens'),
      '@components': resolve(__dirname, './src/components'),
    },
  },

  // ── Dev server ─────────────────────────────────────────────────────────────
  server: {
    port: 3001,
    open: true,
  },

  // ── Build ──────────────────────────────────────────────────────────────────
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info'],
      },
      format: {
        comments: false,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'utils-vendor': ['framer-motion'],
          firebase: ['firebase/app', 'firebase/auth', 'firebase/database'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
});
