import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import vueDevTools from 'vite-plugin-vue-devtools'
import { VitePWA } from 'vite-plugin-pwa'

const cmsPort = 4174

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    vue(),
    mode !== 'production' && vueDevTools(),
    tailwindcss(),
    Components({
      dts: false,
      resolvers: [
        ElementPlusResolver({
          importStyle: mode === 'test' ? false : 'css',
          directives: true,
        }),
      ],
    }),
    mode !== 'test' && VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['favicon.ico'],
      manifest: {
        name: 'FCC CMS',
        short_name: 'FCC CMS',
        description: 'Fair Competition Commission — Content Management System',
        theme_color: '#1d4ed8',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/pwa-maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // The CMS is an authenticated dashboard; precaching JSON API
        // responses is risky. Cache the app shell only and let API
        // calls fall through to the network.
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//, /^\/content\//],
        runtimeCaching: [
          {
            urlPattern: ({ request }) =>
              ['style', 'script', 'worker', 'font', 'image'].includes(request.destination),
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'fcc-cms-assets' },
          },
        ],
        cleanupOutdatedCaches: true,
      },
      devOptions: {
        enabled: false,
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    host: true,
    port: cmsPort,
    strictPort: true,
    fs: {
      allow: ['..'],
    },
  },
  preview: {
    host: true,
    port: cmsPort,
    strictPort: true,
  },
  build: {
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('element-plus')) return 'vendor-element-plus'
            if (id.includes('@element-plus/icons-vue')) return 'vendor-element-icons'
            if (id.includes('vue-router')) return 'vendor-vue-router'
            if (id.includes('pinia')) return 'vendor-pinia'
            if (id.includes('vue-i18n')) return 'vendor-i18n'
            if (id.includes('axios')) return 'vendor-axios'
            if (id.includes('/vue/') || id.includes('@vue')) return 'vendor-vue'
            return 'vendor'
          }

          return undefined
        },
      },
    },
  },
}))
