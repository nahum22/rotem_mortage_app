import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://www.boi.org.il',
        changeOrigin: true,
        rewrite: (_path) => '/PublicApi/GetInterest',
        configure: (_proxy, _options) => {
          _proxy.on('proxyReq', (_proxyReq, _req, _res) => {
            console.log('Proxying request to Bank of Israel API');
          });
        }
      }
    }
  }
})
