import React from 'react';
import ProjectCard from './components/ProjectCard';
import projectData from './data/projects.json';
import { Github, Mail, Linkedin } from 'lucide-react';

function App() {
  return (
    <div className="portfolio-container">
      <nav className="navbar">
        <div className="nav-content">
          <h1 className="logo">Meu<span>Portfólio</span></h1>
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
          <p>Especialista em desenvolvimento web focado em performance e design.</p>
        </div>
      </header>

      <main className="projects-grid">
        <div className="section-header">
          <h3>Projetos Selecionados</h3>
          <div className="divider"></div>
        </div>

        <div className="projects-list">
          {projectData.map(project => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </main>

      <footer className="footer">
        <p>© {new Date().getFullYear()} Zero 1 Page - Todos os Direitos Reservados</p>
      </footer>
    </div>
  );
}

export default App;
