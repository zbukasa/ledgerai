import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      // NOTE: The Gemini API key is intentionally NOT injected into the client bundle.
      // All Gemini calls go through the server-side proxy at /api/ai/* so the key stays
      // on the server only. Do not re-add a `define` for GEMINI_API_KEY / API_KEY here.
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
