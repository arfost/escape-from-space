import { defineConfig } from 'vite';


// https://vitejs.dev/config/
export default defineConfig({
  // assetsInclude: ['**/*.png','**/*.jpg'],
  build: {
    lib: {
      entry: 'index.html',
      formats: ['es']
    },
    // outDir: '../dist'
    // rollupOptions: {
    //   external: /^lit/
    // }
  },
  server: {
    host: true,
    port: 3000,
  },
})