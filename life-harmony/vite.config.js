import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-404-spa-fallback',
      closeBundle() {
        try {
          const distDir = path.resolve(__dirname, 'dist');
          const indexPath = path.join(distDir, 'index.html');
          const notFoundPath = path.join(distDir, '404.html');
          if (fs.existsSync(indexPath)) {
            fs.copyFileSync(indexPath, notFoundPath);
            console.log('✅ Created dist/404.html for SPA client routing');
          }
        } catch (e) {
          console.warn('Could not copy 404.html:', e.message);
        }
      }
    }
  ],
  server: {
    port: 5174,
  }
});