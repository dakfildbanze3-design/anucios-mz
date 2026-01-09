import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // <== 365 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // <== 365 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              },
            }
          },
          {
            // Cache images from Unsplash, Placehold, etc
            urlPattern: /^https:\/\/images\.unsplash\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'external-images',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          }
        ]
      },
      manifest: {
        name: 'Anúncios MZ - Classificados',
        short_name: 'AnúnciosMZ',
        description: 'Compre e venda veículos, imóveis e eletrónicos em Moçambique com facilidade.',
        theme_color: '#135bec',
        background_color: '#f6f6f8',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '.',
        scope: '/',
        id: '/',
        icons: [
          {
            src: 'https://placehold.co/72x72/135bec/ffffff?text=MZ',
            sizes: '72x72',
            type: 'image/png'
          },
          {
            src: 'https://placehold.co/96x96/135bec/ffffff?text=MZ',
            sizes: '96x96',
            type: 'image/png'
          },
          {
            src: 'https://placehold.co/128x128/135bec/ffffff?text=MZ',
            sizes: '128x128',
            type: 'image/png'
          },
          {
            src: 'https://placehold.co/144x144/135bec/ffffff?text=MZ',
            sizes: '144x144',
            type: 'image/png'
          },
          {
            src: 'https://placehold.co/152x152/135bec/ffffff?text=MZ',
            sizes: '152x152',
            type: 'image/png'
          },
          {
            src: 'https://placehold.co/192x192/135bec/ffffff?text=MZ',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'https://placehold.co/256x256/135bec/ffffff?text=MZ',
            sizes: '256x256',
            type: 'image/png'
          },
          {
            src: 'https://placehold.co/384x384/135bec/ffffff?text=MZ',
            sizes: '384x384',
            type: 'image/png'
          },
          {
            src: 'https://placehold.co/512x512/135bec/ffffff?text=MZ',
            sizes: '512x512',
            type: 'image/png'
          }
        ],
        screenshots: [
          {
            src: "https://placehold.co/1280x720/135bec/ffffff?text=Anuncios+MZ+Desktop",
            sizes: "1280x720",
            type: "image/png",
            form_factor: "wide",
            label: "Ecrã Desktop"
          },
          {
            src: "https://placehold.co/750x1334/135bec/ffffff?text=Anuncios+MZ+Mobile",
            sizes: "750x1334",
            type: "image/png",
            form_factor: "narrow",
            label: "Ecrã Mobile"
          }
        ]
      },
      devOptions: {
        enabled: true
      }
    })
  ],
})