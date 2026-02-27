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
    // Check if there's already an expiration date in localStorage
    let expirationDate = localStorage.getItem('proposalExpiration');

    if (!expirationDate) {
      // Set expiration to 7 days from now
      const now = new Date();
      const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      expirationDate = sevenDaysLater.toISOString();
      localStorage.setItem('proposalExpiration', expirationDate);
    }

    const targetDate = new Date(expirationDate).getTime();

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
      const isActive = calculateTimeLeft();
      if (!isActive) clearInterval(timer);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="portfolio-container">
      <nav className="navbar">
        <div className="nav-content">
          <h1 className="logo">Portfolio <span>Zero1Page</span></h1>
          <div className="social-links">
            <a href="#"><Github size={20} /></a>
            <a href="#"><Mail size={20} /></a>
            <a href="#"><Linkedin size={20} /></a>
          </div>
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
              Esta proposta expira em: <span>{timeLeft.days}d {timeLeft.hours.toString().padStart(2, '0')}h {timeLeft.minutes.toString().padStart(2, '0')}m {timeLeft.seconds.toString().padStart(2, '0')}s</span> — Exclusividade de nicho garantida no período.
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
