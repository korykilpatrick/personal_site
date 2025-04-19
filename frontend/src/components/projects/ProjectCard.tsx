import React, { useState } from 'react';
import MarkdownToJsx from 'markdown-to-jsx';
import { Project, ProjectLink } from 'types/index'; // Correct import path
import Card from '@/components/common/Card';
import Tag from '@/components/ui/Tag';
// We can potentially add Icon component usage later if needed

interface ProjectCardProps {
  project: Project;
  /** Callback function when a tag is clicked. */
  onTagClick: (tag: string) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onTagClick }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  // Defensive check for project data
  if (!project) {
    return null; // Or render some placeholder/error state
  }

  return (
    <Card variant="hover" padding="none" className="project-card">
      {/* Main content area */}
      <div className="p-4 md:p-5 flex flex-col md:flex-row gap-4 md:items-start">
        {/* Left side: Tags, Title, Desc, Links */}
        <div className="md:flex-1 min-w-0"> {/* Added min-w-0 for flex truncation */}
          {/* Tags */}
          {project.tags && project.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {project.tags.map((tag: string) => (
                <Tag key={tag} label={tag} onClick={() => onTagClick(tag)} />
              ))}
            </div>
          )}

          {/* Title & Description */}
          <h2 className="text-lg font-bold mb-2 truncate">{project.title}</h2>
          {project.description && (
             <p className="text-textSecondary mb-3 text-sm line-clamp-3">{project.description}</p>
          )}

          {/* Links */}
          {project.links && project.links.length > 0 && (
             <div className="flex flex-wrap gap-2 mb-0">
               {project.links.map((link: ProjectLink, index: number) => (
                 <a
                   key={index}
                   href={link.url}
                   target="_blank"
                   rel="noopener noreferrer"
                   className="inline-flex items-center px-2.5 py-1 border border-primary text-primary rounded text-xs hover:bg-primary/10 transition"
                   aria-label={`Link to ${link.title || link.url}`}
                 >
                   {/* Inlined SVGs for now - Consider replacing with Icon component later */}
                   {link.icon === 'github' && (
                     <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                       <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                     </svg>
                   )}
                   {link.icon === 'external-link' && (
                     <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                     </svg>
                   )}
                   {link.title || 'Link'}
                 </a>
               ))}
             </div>
          )}
        </div>

        {/* Right side: Image */}
        {!imageError && project.media_urls && project.media_urls.length > 0 && (
          <div className="md:w-1/3 lg:w-1/4 flex-shrink-0 md:self-center project-image-container">
            <div className="relative overflow-hidden rounded-md shadow-sm h-32 md:h-40 bg-gray-100"> {/* Added bg placeholder */}
              <img
                src={project.media_urls[0]}
                alt={`Screenshot of ${project.title}`}
                className="w-full h-full object-cover object-center"
                onError={() => setImageError(true)}
                loading="lazy"
              />
            </div>
          </div>
        )}
      </div>

      {/* Expandable Writeup Section */}
      {project.writeup && (
        <div className="px-4 md:px-5 pb-4 md:pb-5 border-t border-gray-100">
          <button
            onClick={toggleExpand}
            className="flex items-center text-primary hover:underline text-sm font-medium mt-3 mb-3"
            aria-expanded={isExpanded}
            aria-controls={`project-details-${project.id}`} // Added aria-controls
          >
            {isExpanded ? 'Hide Details' : 'Show Details'}
            <svg
              className={`w-4 h-4 ml-1 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isExpanded && (
            <div
              id={`project-details-${project.id}`} // Added id for aria-controls
              className="prose prose-primary max-w-none text-sm"
            >
              {/* Ensure MarkdownToJsx handles potential null/undefined writeup gracefully */}
              <MarkdownToJsx>{project.writeup || ''}</MarkdownToJsx>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export default ProjectCard; 