import React from 'react';
import { Maximize2 } from 'lucide-react';

const ProjectCard = ({ project }) => {
  return (
    <section className="project-section">
      <div className="project-header">
        <h2 className="project-title">{project.title}</h2>
        <div className="project-tags">
          {project.tags.map(tag => (
            <span key={tag} className="tag">{tag}</span>
          ))}
        </div>
      </div>

      {project.intro && (
        <div className="project-intro">
          <p>{project.intro}</p>
        </div>
      )}

      <div className="project-grid">
        {project.items.map((item, index) => (
          <div key={index} className="project-grid-item">
            <div className="image-wrapper shadow-premium">
              <img src={item.url} alt={item.title || ""} loading="lazy" />
              <div className="image-overlay">
                <Maximize2 size={24} />
              </div>
            </div>
            <div className="item-content">
              {item.title && <h4 className="item-title">{item.title}</h4>}
              {item.description && <p className="item-description">{item.description}</p>}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ProjectCard;
