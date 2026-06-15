import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.jsx',
            refresh: true,
        }),
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['favicon-32x32.png', 'apple-touch-icon.png'],
            manifest: {
                name: 'SwiftMoney',
                short_name: 'SwiftMoney',
                description: 'Tracker kewangan keluarga',
                theme_color: '#0B1120',
                background_color: '#0B1120',
                display: 'standalone',
                orientation: 'portrait',
                start_url: '/dashboard',
                scope: '/',
                icons: [
                    { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
                    { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
                    { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
                ],
            },
            workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
                importScripts: ['/push-sw.js'],
                runtimeCaching: [
                    {
                        urlPattern: /^https?:\/\/.*\/dashboard/,
                        handler: 'NetworkFirst',
                        options: { cacheName: 'dashboard-cache', expiration: { maxEntries: 10, maxAgeSeconds: 300 } },
                    },
                    {
                        urlPattern: /^https?:\/\/.*\/storage\/receipts\/.*/,
                        handler: 'CacheFirst',
                        options: { cacheName: 'receipt-cache', expiration: { maxEntries: 50, maxAgeSeconds: 604800 } },
                    },
                ],
            },
        }),
    ],
});
