import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Volta para a raiz para evitar problemas com caminhos relativos em SPAs
  base: '/',
  // Garante que rotas como /20260302_01 funcionem no modo dev
  appType: 'spa',
})
