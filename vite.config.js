import { defineConfig } from 'vite';
import path from 'path';


// https://vitejs.dev/config/
export default defineConfig({
  publicDir: 'src',
  build: {
    lib: {
      entry: 'index.html',
      formats: ['es']
    },
  },
  server: {
    host: true,
    port: 3000,
  },
})