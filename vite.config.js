import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ command, mode }) => {




  return {
    base:"/",
    build: {
      outDir: 'docs',
      emptyOutDir: true,
      rollupOptions: {
        input: '/index.html',
        output: {
          entryFileNames: 'assets/[name].[hash].js',
          chunkFileNames: 'assets/[name].[hash].js',
          assetFileNames: 'assets/[name].[hash].[ext]'
        }
      }
    },
    server: {
      origin: 'http://localhost:5173',
    }
  }
})