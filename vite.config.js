import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import vueDevTools from 'vite-plugin-vue-devtools'

const cmsPort = 4173

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    vue(),
    vueDevTools(),
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
  ],
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
