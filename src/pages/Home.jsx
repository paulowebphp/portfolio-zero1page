import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Rocket, Target, ArrowRight } from 'lucide-react';

const Home = () => {
    return (
        <div className="portfolio-container min-vh-100 flex flex-column">
            {/* Header */}
            <nav className="navbar">
                <div className="nav-content" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className="logo-group">
                        <h1 className="logo">Zero1<span>Page</span></h1>
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', margin: 0, letterSpacing: '2px', textTransform: 'uppercase' }}>
                            High Performance Solutions
                        </p>
                    </div>
                    
                    <Link to="/login" className="btn-icon-bg" style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px', 
                        padding: '8px 16px', 
                        background: 'rgba(255,255,255,0.05)', 
                        border: '1px solid var(--glass-border)', 
                        borderRadius: '8px',
                        color: 'var(--text-secondary)',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        transition: 'all 0.3s ease'
                    }}>
                        <Shield size={16} />
                        Acesso Restrito
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
                <div className="hero-content text-center" style={{ maxWidth: '800px' }}>
                    <div className="badge-premium mb-6" style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '8px', 
                        padding: '6px 14px', 
                        background: 'linear-gradient(135deg, rgba(0,200,83,0.1) 0%, rgba(0,112,243,0.1) 100%)', 
                        border: '1px solid rgba(0,200,83,0.2)', 
                        borderRadius: '20px',
                        color: 'var(--accent-color)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '1px'
                    }}>
                        <Rocket size={14} />
                        Engine de Autoridade Digital
                    </div>

                    <h2 style={{ fontSize: 'clamp(2.5rem, 8vw, 4.5rem)', fontWeight: 800, lineHeight: 1.1, marginBottom: '24px' }}>
                        Transformando Visão em <span className="text-gradient">Domínio Digital.</span>
                    </h2>

                    <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px' }}>
                        Desenvolvemos ecossistemas de alta conversão para negócios que buscam autoridade, escala e tecnologia de ponta.
                    </p>

                    <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <div className="glass-card" style={{ padding: '24px', borderRadius: '16px', textAlign: 'left', width: '220px' }}>
                            <Target className="text-accent mb-3" size={24} />
                            <h4 style={{ color: '#fff', marginBottom: '8px' }}>Estratégia</h4>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Mapeamento de nicho e posicionamento de elite.</p>
                        </div>
                        <div className="glass-card" style={{ padding: '24px', borderRadius: '16px', textAlign: 'left', width: '220px' }}>
                            <Rocket className="text-accent mb-3" size={24} />
                            <h4 style={{ color: '#fff', marginBottom: '8px' }}>Escala</h4>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Automação e tráfego otimizado para ROI.</p>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="footer" style={{ padding: '30px 20px', borderTop: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                        © {new Date().getFullYear()} Zero 1 Page - Todos os Direitos Reservados
                    </p>
                </div>
            </footer>

            <style dangerouslySetInnerHTML={{ __html: `
                .text-gradient {
                    background: linear-gradient(135deg, #00c853 0%, #0070f3 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                .glass-card {
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    backdrop-filter: blur(10px);
                    transition: transform 0.3s ease, border-color 0.3s ease;
                }
                .glass-card:hover {
                    transform: translateY(-5px);
                    border-color: var(--accent-color);
                }
                .btn-icon-bg:hover {
                    background: rgba(255, 255, 255, 0.1) !important;
                    color: #fff !important;
                }
                @media (max-width: 600px) {
                    .hero-content h2 { font-size: 2.5rem !important; }
                    .glass-card { width: 100% !important; }
                }
            `}} />
        </div>
    );
};

export default Home;
