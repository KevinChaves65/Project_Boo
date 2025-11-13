import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        // Note: background.js and content.js will be copied manually as they need to be plain JS
      },
      output: {
        entryFileNames: (chunkInfo) => {
          // Keep main entry as is, others go to assets
          if (chunkInfo.name === 'main') {
            return 'assets/[name]-[hash].js'
          }
          return 'assets/[name]-[hash].js'
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    outDir: 'dist',
    sourcemap: false, // Disable sourcemaps for extension
    minify: 'esbuild',
    target: 'esnext',
    assetsDir: 'assets'
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
    __VUE_OPTIONS_API__: true,
    __VUE_PROD_DEVTOOLS__: false
  },
  server: {
    port: 5173,
    host: true
  }
})
