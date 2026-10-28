import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // সার্ভার অর্ডার লিখলে এই ফাইল বদলায়। না আটকালে প্রতিটি অর্ডারে পাতা রিলোড হয়।
    watch: { ignored: ['**/data/orders.json'] },
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
})
