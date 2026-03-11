import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import AdminDashboard from './pages/Admin/Dashboard.jsx'
import Generator from './pages/Admin/Generator.jsx'
import ProposalsList from './pages/Admin/ProposalsList.jsx'
import ProposalNew from './pages/Admin/ProposalNew.jsx'
import ProposalWorkspace from './pages/Admin/ProposalWorkspace.jsx'
import Structurer from './pages/Admin/Structurer.jsx'

import ProposalCases from './pages/Admin/ProposalCases.jsx'
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
            <Route index element={<Navigate to="proposals" replace />} />

            {/* Lista e criação de propostas */}
            <Route path="proposals" element={<ProposalsList />} />
            <Route path="proposals/new" element={<ProposalNew />} />

            {/* Workspace por proposta */}
            <Route path="proposals/:slug" element={<ProposalWorkspace />}>
              <Route path="details"  element={<Generator />} />
              <Route path="cases"    element={<ProposalCases />} />
            </Route>

            {/* Módulos globais */}

            <Route path="whatsapp"   element={<WhatsAppManager />} />
            <Route path="structurer" element={<Structurer />} />
          </Route>

          {/* Rotas por slug — ex: /joao-marcos, /20260302_01, etc. */}
          <Route path="/:slug" element={<App />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
)
