import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-spa-routes',
      closeBundle() {
        try {
          const distDir = path.resolve(__dirname, 'dist');
          const indexPath = path.join(distDir, 'index.html');
          if (fs.existsSync(indexPath)) {
            const routes = [
              '404', 'shop', 'wishlist', 'admin', 'checkout', 'login',
              'register', 'blog', 'profile', 'order-success'
            ];
            routes.forEach((route) => {
              const target = path.join(distDir, `${route}.html`);
              fs.copyFileSync(indexPath, target);
            });
            console.log('✅ Generated static HTML files for all client-side routes');
          }
        } catch (e) {
          console.warn('Could not copy route HTML files:', e.message);
        }
      }
    }
  ],
  server: {
    port: 5174,
  }
});