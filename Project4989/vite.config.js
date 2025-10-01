import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
    // 하드코딩된 환경변수 제거
  },
  resolve: {
    alias: {
      'sockjs-client': 'sockjs-client/dist/sockjs.min.js',
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:4989',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      // /auction 프록시 완전 제거
    },
  },
})
