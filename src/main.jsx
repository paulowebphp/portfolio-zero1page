import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import AdminDashboard from './pages/Admin/Dashboard.jsx'
import Generator from './pages/Admin/Generator.jsx'
import ProposalsList from './pages/Admin/ProposalsList.jsx'
import Settings from './pages/Admin/Settings.jsx'
import Structurer from './pages/Admin/Structurer.jsx'
import WhatsAppManager from './pages/Admin/WhatsAppManager.jsx'
import Login from './pages/Login.jsx'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import { Navigate } from 'react-router-dom'

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Carregando...</div>;
  if (!user) return <Navigate to="/login" />;
  return children;
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/login" element={<Login />} />

          {/* Painel Administrativo Protegido */}
          <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>}>
            <Route index element={<div>Bem-vindo ao Painel Admin</div>} />
            <Route path="generator" element={<Generator />} />
            <Route path="proposals" element={<ProposalsList />} />
            <Route path="structurer" element={<Structurer />} />
            <Route path="whatsapp" element={<WhatsAppManager />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Rotas por slug — ex: /20260302_01, /20260302_02, etc. */}
          <Route path="/:slug" element={<App />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
)
