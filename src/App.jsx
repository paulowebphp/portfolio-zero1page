import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ProjectCard from './components/ProjectCard';
import { supabase } from './lib/supabase';
import globalAuthority from './data/global_authority.json';
import { Clock, Loader2, AlertCircle, Globe } from 'lucide-react';

// Função para obter cliente Supabase dinâmico (caso mude via painel Settings)
const getSupabaseClient = () => {
  const localSettings = localStorage.getItem('admin_settings');
  if (localSettings) {
    try {
      const { supabaseUrl, supabaseAnonKey } = JSON.parse(localSettings);
      if (supabaseUrl && supabaseAnonKey) {
        // Para simplificar, usamos o supabase client exportado, mas o ideal seria re-instanciar
        return supabase;
      }
    } catch (e) { }
  }
  return supabase;
};

function App() {
  const { slug } = useParams();
  const [proposalData, setProposalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  const client = getSupabaseClient();
  const proposalSlug = slug || 'default';

  useEffect(() => {
    async function fetchProposal() {
      try {
        setLoading(true);
        // Fetch proposal with contact join
        const { data, error: sbError } = await client
          .from('propostas')
          .select(`
            *,
            whatsapp_contatos (*)
          `)
          .eq('slug', proposalSlug)
          .single();

        if (sbError) throw sbError;
        setProposalData(data);
      } catch (err) {
        console.error('Erro ao buscar proposta:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchProposal();
  }, [proposalSlug]);

  useEffect(() => {
    if (!proposalData || proposalData.prazo_tipo !== 'countdown') return;

    const targetDate = new Date(proposalData.prazo_inicio).getTime() + (proposalData.prazo_dias * 24 * 60 * 60 * 1000);

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return false;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
      return true;
    };

    calculateTimeLeft();
    const timer = setInterval(() => {
      if (!calculateTimeLeft()) clearInterval(timer);
    }, 1000);

    return () => clearInterval(timer);
  }, [proposalData]);

  if (loading) {
    return (
      <div className="flex-center min-vh-100">
        <Loader2 className="animate-spin text-accent" size={48} />
        <p className="ml-4 text-xl">Carregando Proposta...</p>
      </div>
    );
  }

  if (error || !proposalData) {
    return (
      <div className="flex-center min-vh-100 flex-column text-center p-4">
        <AlertCircle className="text-red-500 mb-4" size={64} />
        <h2 className="text-2xl mb-2">Proposta não encontrada</h2>
        <p className="text-muted mb-6">O link que você seguiu pode ter expirado ou estar incorreto.</p>
        <Link to="/" className="btn-primary">Voltar ao Início</Link>
      </div>
    );
  }

  const { projects: projectData, conceptual: conceptualData, fullstack: fullstackData, traffic: trafficData, automation: automationData } = globalAuthority;

  const contact = proposalData.whatsapp_contatos;
  const whatsappUrl = contact ? `https://wa.me/${contact.numero}?text=${encodeURIComponent(contact.mensagem_padrao)}` : '#';

  return (
    <div className="portfolio-container">
      <nav className="navbar">
        <div className="nav-content">
          <h1 className="logo">Portfolio <span>Zero1Page</span></h1>
          {contact && (
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="whatsapp-contact">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
              <span>Fale com {contact.nome}</span>
            </a>
          )}
        </div>
      </nav>

      <header className="hero">
        <div className="hero-content">
          <h2><span>{proposalData.titulo_proposta}</span></h2>
          <p>Potencializando sua operação digital com autoridade e tecnologia.</p>
        </div>
      </header>

      <main>
        <div className="section-header">
          <h3>Cases de <span>Sucesso</span></h3>
          <div className="divider"></div>
        </div>
        <div className="projects-list">
          {projectData.map(project => <ProjectCard key={project.id} project={project} />)}
        </div>

        {conceptualData.length > 0 && (
          <div className="conceptual-showcase pt-20">
            <div className="section-header conceptual-header">
              <h3>Projetos <span>Demonstrativos</span></h3>
              <p className="section-subtitle">(Conceituais)</p>
              <div className="divider"></div>
            </div>
            <div className="conceptual-grid">
              {conceptualData.map(item => (
                <div key={item.id} className="conceptual-item">
                  <div className="image-wrapper shadow-premium">
                    <img src={item.image} alt={item.title} loading="lazy" />
                    <div className="image-overlay"><div className="view-badge">Conceitual</div></div>
                  </div>
                  <div className="item-content">
                    <h4 className="item-title">{item.title}</h4>
                    <p className="item-description">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Seção Comercial Dinâmica */}
        <div className="section-header pricing-header">
          <h3>Investimento & <span>Estratégia</span></h3>
          <p className="section-subtitle">Proposta Comercial</p>
          <div className="divider"></div>
        </div>

        <div className="pricing-container">
          <div className="commercial-grid">
            {proposalData.mova_principal && (
              <div className="pricing-card highlight-card">
                <div className="pricing-content">
                  <h4 className="pricing-title">M.O.V.A — Máquina Orgânica</h4>
                  <div className="highlight-values">
                    <p className="main-price">{proposalData.mova_principal}</p>
                    <p className="special-price">{proposalData.mova_avista}</p>
                  </div>
                </div>
              </div>
            )}

            {proposalData.performance_range && (
              <div className="pricing-card">
                <div className="pricing-content">
                  <h4 className="pricing-title">Aluguel por Performance</h4>
                  <div className="highlight-values">
                    <p className="main-price">{proposalData.performance_range}</p>
                  </div>
                </div>
              </div>
            )}

            {proposalData.trafego_mensal && (
              <div className="pricing-card">
                <div className="pricing-content">
                  <h4 className="pricing-title">Tráfego Pago</h4>
                  <div className="highlight-values">
                    <p className="main-price">{proposalData.trafego_mensal}</p>
                  </div>
                </div>
              </div>
            )}

            {proposalData.automacao_setup && (
              <div className="pricing-card">
                <div className="pricing-content">
                  <h4 className="pricing-title">Automação de Atendimento</h4>
                  <div className="highlight-values">
                    <p className="main-price">{proposalData.automacao_setup}</p>
                    <p className="special-price">+ {proposalData.automacao_mensal}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="pricing-footer-note">
            <Clock size={32} />
            <p>
              Esta proposta expira em: <span>
                {proposalData.prazo_tipo === 'static'
                  ? `${proposalData.prazo_dias} dias`
                  : `${timeLeft.days}d ${timeLeft.hours}h ${timeLeft.minutes}m ${timeLeft.seconds}s`}
              </span> — Exclusividade de nicho garantida.
            </p>
          </div>

          <div className="footer-cta">
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="footer-whatsapp-btn">
              <span>Fale com {contact ? contact.nome : 'o Diretor'} agora</span>
            </a>
          </div>
        </div>
      </main>

      <footer className="footer">
        <p>© {new Date().getFullYear()} Zero 1 Page - Todos os Direitos Reservados</p>
      </footer>
    </div>
  );
}

export default App;
