import { Link, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FilePlus, ListFilter, Sliders, Settings, Home, Phone, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AdminDashboard = () => {
    const { signOut } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await signOut();
        navigate('/login');
    };

    return (
        <div className="admin-container">
            <aside className="admin-sidebar shadow-premium">
                <div className="sidebar-header">
                    <LayoutDashboard className="text-accent" />
                    <h2>Admin <span>Panel</span></h2>
                </div>
                <nav className="sidebar-nav">
                    <Link to="/admin" className="nav-item">
                        <LayoutDashboard size={20} />
                        <span>Dashboard</span>
                    </Link>
                    <Link to="/admin/generator" className="nav-item">
                        <FilePlus size={20} />
                        <span>Gerador</span>
                    </Link>
                    <Link to="/admin/proposals" className="nav-item">
                        <ListFilter size={20} />
                        <span>Propostas</span>
                    </Link>
                    <Link to="/admin/structurer" className="nav-item">
                        <Sliders size={20} />
                        <span>Estruturador</span>
                    </Link>
                    <Link to="/admin/whatsapp" className="nav-item">
                        <Phone size={20} />
                        <span>WhatsApp</span>
                    </Link>
                    <Link to="/admin/settings" className="nav-item">
                        <Settings size={20} />
                        <span>Configurações</span>
                    </Link>
                    <hr className="nav-divider" />
                    <Link to="/" className="nav-item">
                        <Home size={20} />
                        <span>Site Público</span>
                    </Link>
                </nav>
                <div className="sidebar-footer">
                    <button onClick={handleLogout} className="btn-logout">
                        <LogOut size={20} />
                        <span>Sair</span>
                    </button>
                </div>
            </aside>

            <main className="admin-main">
                <header className="admin-topbar">
                    <div className="search-placeholder">Controle tudo aqui</div>
                    <div className="user-profile">Admin Zero1Page</div>
                </header>
                <div className="admin-content">
                    <Outlet />
                </div>
            </main>

            {/* Mobile Bottom Navigation */}
            <div className="mobile-bottom-nav">
                <Link to="/admin" className="mobile-nav-item">
                    <LayoutDashboard size={20} />
                    <span>Início</span>
                </Link>
                <Link to="/admin/generator" className="mobile-nav-item">
                    <FilePlus size={20} />
                    <span>Gerador</span>
                </Link>
                <Link to="/admin/proposals" className="mobile-nav-item">
                    <ListFilter size={20} />
                    <span>Propostas</span>
                </Link>
                <Link to="/admin/whatsapp" className="mobile-nav-item">
                    <Phone size={20} />
                    <span>WhatsApp</span>
                </Link>
                <button onClick={handleLogout} className="mobile-nav-item btn-mobile-logout" style={{ background: 'none', border: 'none' }}>
                    <LogOut size={20} />
                    <span>Sair</span>
                </button>
            </div>
        </div>
    );
};

export default AdminDashboard;
