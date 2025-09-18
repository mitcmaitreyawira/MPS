import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  // Load env strictly from the frontend app directory to avoid picking up root .env files
  const env = loadEnv(mode, __dirname, '');
  return {
    // Ensure Vite also treats this directory as the env dir for runtime replacements
    envDir: __dirname,
    define: {
      // Prefer VITE_API_URL, fall back to VITE_API_BASE_URL, then sensible dev default
      'import.meta.env.VITE_API_URL': JSON.stringify(
        env.VITE_API_URL || env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1'
      )
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    },
    server: {
      // Proxy removed - using direct API calls via VITE_API_URL
      // proxy: {
      //   '/api': {
      //     target: 'http://localhost:3005/api/v1',
      //     changeOrigin: true,
      //     secure: false,
      //     rewrite: (path) => path.replace(/^\/api/, '')
      //   }
      // }
    }
  };
});
