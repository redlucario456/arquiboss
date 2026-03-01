import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // 1. CONFIGURACIÓN DE CONSTRUCCIÓN (Para Railway/Producción)
  build: {
    // Sacamos el build a la carpeta 'public' de la raíz del proyecto (donde está app.js)
    outDir: '../public', 
    emptyOutDir: true,
    // Optimización de chunks para que la web cargue más rápido
    sourcemap: false,
    minify: 'terser',
  },

  // 2. CONFIGURACIÓN DE DESARROLLO (npm run dev)
  server: {
    port: 5173, // Puerto estándar de Vite
    proxy: {
      // Cualquier llamada a /api se redirige al backend de Node
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
      // También redirigimos /uploads para poder ver las fotos en desarrollo
      '/uploads': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      }
    }
  },

  // 3. RESOLUCIÓN DE RUTAS (Opcional pero recomendado)
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
