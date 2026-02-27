import React, { useState, useEffect } from 'react';
import ProjectCard from './components/ProjectCard';
import projectData from './data/projects.json';
import conceptualData from './data/conceptual.json';
import fullstackData from './data/fullstack.json';
import pricingData from './data/pricing.json';
import { Github, Mail, Linkedin, Clock } from 'lucide-react';

function App() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    // BALIZA GLOBAL: Data fixa de expiração (March 6, 2026 16:00 Brazil)
    const targetDate = new Date('2026-03-06T16:00:00-03:00').getTime();

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

    // Calculate immediately on mount
    calculateTimeLeft();

    const timer = setInterval(() => {
      if (!calculateTimeLeft()) clearInterval(timer);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="portfolio-container">
      <nav className="navbar">
        <div className="nav-content">
          <h1 className="logo">Portfolio <span>Zero1Page</span></h1>
          <a
            href="https://wa.me/5521989248813?text=Quero%20Falar%20com%20o%20Diretor%20Comercial%20e%20Head%20PR%20sobre%20a%20proposta%21"
            target="_blank"
            rel="noopener noreferrer"
            className="whatsapp-contact"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
            <span>Fale com o Diretor Comercial e Head PR</span>
          </a>
        </div>
      </nav>

      <header className="hero">
        <div className="hero-content">
          <h2>Transformando ideias em <span>experiências digitais</span></h2>
          <p>Especialistas em desenvolvimento web focado em performance e design.</p>
        </div>
      </header>

      <main>
        <div className="section-header">
          <h3>Cases de <span>Sucesso</span></h3>
          <div className="divider"></div>
        </div>

        <div className="projects-list">
          {projectData.map(project => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>

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
                <div className="image-overlay">
                  <div className="view-badge">Conceitual</div>
                </div>
              </div>
              <div className="item-content">
                <h4 className="item-title">{item.title}</h4>
                <p className="item-description">{item.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="section-header fullstack-header">
          <h3>Projetos de <span>Programação</span></h3>
          <p className="section-subtitle">Full Stack</p>
          <div className="divider"></div>
        </div>

        <div className="fullstack-grid">
          {fullstackData.map(item => (
            <div key={item.id} className="fullstack-item">
              <div className="image-wrapper shadow-premium">
                <img src={item.image} alt={item.title} loading="lazy" />
                <div className="image-overlay">
                  <div className="view-badge">Software</div>
                </div>
              </div>
              <div className="item-content">
                <h4 className="item-title">{item.title}</h4>
                <p className="item-description">{item.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="section-header pricing-header">
          <h3>Investimento & <span>Estratégia</span></h3>
          <p className="section-subtitle">Proposta Comercial</p>
          <div className="divider"></div>
        </div>

        <div className="pricing-container">
          {pricingData.map(item => (
            <div key={item.id} className={`pricing-card ${item.isHighlight ? 'highlight-card' : ''}`}>
              <div className="pricing-content">
                {item.subtitle && <p className="pricing-subtitle-tag">{item.subtitle}</p>}
                <h4 className="pricing-title">{item.title}</h4>
                {item.price && (
                  <div className="highlight-values">
                    <p className="main-price">{item.price}</p>
                    <p className="special-price">{item.specialPrice}</p>
                  </div>
                )}
                <p className="pricing-description">{item.description}</p>
              </div>
            </div>
          ))}
          <div className="pricing-footer-note">
            <Clock size={32} />
            <p>
              Esta proposta expira em: <span>{timeLeft.days}d {timeLeft.hours.toString().padStart(2, '0')}h {timeLeft.minutes.toString().padStart(2, '0')}m {timeLeft.seconds.toString().padStart(2, '0')}s</span> — Exclusividade de nicho garantida no período, em âmbito nacional.
            </p>
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
