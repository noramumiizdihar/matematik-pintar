import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import https from 'https';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'tts-proxy-middleware',
      configureServer(server) {
        server.middlewares.use('/api/tts', (req, res) => {
          const url = new URL(req.url || '', `http://${req.headers.host}`);
          const text = url.searchParams.get('text');
          const lang = url.searchParams.get('lang') || 'ms';

          if (!text) {
            res.statusCode = 400;
            res.end('Missing text query parameter');
            return;
          }

          const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${lang}&client=tw-ob&q=${encodeURIComponent(text)}`;

          https
            .get(ttsUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (upstream) => {
              res.writeHead(upstream.statusCode || 200, {
                'Content-Type': 'audio/mpeg',
                'Cache-Control': 'public, max-age=86400',
                'Access-Control-Allow-Origin': '*'
              });
              upstream.pipe(res);
            })
            .on('error', (err) => {
              res.statusCode = 500;
              res.end(err.message);
            });
        });
      }
    },
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'icons/*.svg', 'audio/**/*.mp3'],
      manifest: {
        name: 'Matematik Pintar (Kids Math PWA)',
        short_name: 'Matematik',
        description: 'Aplikasi Pembelajaran Matematik Kanak-kanak Interaktif Prasekolah hingga Tahun 6 (KPM KSSR)',
        theme_color: '#6366f1',
        background_color: '#f0fdf4',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: '/',
        icons: [
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,mp3}']
      }
    })
  ]
});
