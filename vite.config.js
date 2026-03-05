import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Define o caminho base como relativo para funcionar em qualquer subdiretório
  base: './',
  // Garante que rotas como /20260302_01 funcionem no modo dev
  appType: 'spa',
})
