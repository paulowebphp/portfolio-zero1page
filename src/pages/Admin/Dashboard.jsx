import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ListFilter, Sliders, Home, LogOut, FilePlus, Plus, Phone } from 'lucide-react';
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

                    {/* Propostas com botão de nova proposta */}
                    <NavLink to="/admin/proposals" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                        <ListFilter size={20} />
                        <span>Propostas</span>
                    </NavLink>
                    <NavLink to="/admin/proposals/new" className={({ isActive }) => isActive ? 'nav-item nav-item-sub active' : 'nav-item nav-item-sub'}>
                        <Plus size={16} />
                        <span>Nova Proposta</span>
                    </NavLink>


                    <NavLink to="/admin/whatsapp" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                        <Phone size={20} />
                        <span>WhatsApp</span>
                    </NavLink>
                    <NavLink to="/admin/structurer" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                        <Sliders size={20} />
                        <span>Estruturador</span>
                    </NavLink>
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
                <NavLink to="/admin/proposals" className={({ isActive }) => isActive ? 'mobile-nav-item active' : 'mobile-nav-item'}>
                    <ListFilter size={20} />
                    <span>Propostas</span>
                </NavLink>
                <NavLink to="/admin/proposals/new" className={({ isActive }) => isActive ? 'mobile-nav-item active' : 'mobile-nav-item'}>
                    <FilePlus size={20} />
                    <span>Nova</span>
                </NavLink>
                <NavLink to="/admin/whatsapp" className={({ isActive }) => isActive ? 'mobile-nav-item active' : 'mobile-nav-item'}>
                    <Phone size={20} />
                    <span>WhatsApp</span>
                </NavLink>
                <NavLink to="/admin/structurer" className={({ isActive }) => isActive ? 'mobile-nav-item active' : 'mobile-nav-item'}>
                    <Sliders size={20} />
                    <span>Estruturador</span>
                </NavLink>
                <button onClick={handleLogout} className="mobile-nav-item btn-mobile-logout" style={{ background: 'none', border: 'none' }}>
                    <LogOut size={20} />
                    <span>Sair</span>
                </button>
            </div>
        </div>
    );
};

export default AdminDashboard;
