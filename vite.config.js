import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      formats: ['es']
    },
    // If we want to publish standalone components we don't externalize lit,
    // if you are going to use lit in your own project, you can make it a dep instead.
    // external: /^lit/, <-- comment this line
    // rollupOptions: {
    //   external: /^lit/
    // }
  },
  server: {
    host: true,
    port: 3000,
  },
})