import { defineConfig } from 'vite';


// https://vitejs.dev/config/
export default defineConfig({
  // root: 'src',
  base: 'index.html',
  build: {
    lib: {
      entry: 'index.html',
      formats: ['es']
    },
    outDir: '../dist'
    // rollupOptions: {
    //   external: /^lit/
    // }
  },
  server: {
    host: true,
    port: 3000,
  },
})