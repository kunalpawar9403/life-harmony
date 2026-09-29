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
          if (!fs.existsSync(indexPath)) return;

          const copyRoute = (relPath) => {
            const fullTarget = path.join(distDir, relPath);
            const parentDir = path.dirname(fullTarget);
            if (!fs.existsSync(parentDir)) {
              fs.mkdirSync(parentDir, { recursive: true });
            }
            fs.copyFileSync(indexPath, fullTarget);
          };

          // 1. Top-level routes
          const topRoutes = [
            '404', 'shop', 'wishlist', 'about', 'blog', 'contact', 'login',
            'register', 'profile', 'checkout', 'admin', 'order-success', 'orders'
          ];
          topRoutes.forEach((route) => {
            copyRoute(`${route}.html`);
            copyRoute(`${route}/index.html`);
          });

          // 2. Product routes (all catalog slugs)
          const productSlugs = [
            'vitamin-d3-k2', 'vitamin-c-zinc', 'b-complex', 'multivitamin-plus',
            'omega-3-fish-oil', 'marine-collagen-peptides', 'dietary-supplement-set',
            'organic-collagen-peptides', 'hydrate-electrolytes', 'energy-immunity',
            'omega-complex', 'turmeric-curcumin', 'magnesium-glycinate',
            'great-offer-set', 'sleep-deep-rest', 'vital-omega-3', 'daily-energy-boost'
          ];
          copyRoute('product.html');
          copyRoute('product/index.html');
          productSlugs.forEach((slug) => {
            copyRoute(`product/${slug}.html`);
            copyRoute(`product/${slug}/index.html`);
          });

          // 3. Blog routes
          const blogSlugs = [
            '1', '2', '3', 'vitamin-d3-k2-guide', 'morning-habits-energy', 'collagen-research'
          ];
          copyRoute('blog.html');
          copyRoute('blog/index.html');
          blogSlugs.forEach((slug) => {
            copyRoute(`blog/${slug}.html`);
            copyRoute(`blog/${slug}/index.html`);
          });

          console.log('✅ Generated static HTML files for all client-side and product routes');
        } catch (e) {
          console.warn('Could not copy route HTML files:', e.message);
        }
      }
    }
  ],
  server: {
    port: 5174,
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
    },
  },
});