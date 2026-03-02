import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Rota padrão (home) — carrega o portfólio default */}
        <Route path="/" element={<App />} />
        {/* Rotas por slug — ex: /20260302_01, /20260302_02, etc. */}
        <Route path="/:slug" element={<App />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
