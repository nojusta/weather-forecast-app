import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import compression from 'vite-plugin-compression'

export default defineConfig({
  plugins: [
    react(),
    compression({ 
      algorithm: 'gzip',
      ext: '.gz',
    })
  ],
  build: {
    minify: 'terser', 
    terserOptions: {
      compress: {
        drop_console: true,
        pure_funcs: ['console.log', 'console.info'],
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          utils: ['axios', 'prop-types'],
        },
      },
    },
  },
  css: {
    postcss: './postcss.config.js',
  }
})