import React, { useState } from 'react';
import MarkdownToJsx from 'markdown-to-jsx';
import { Project, ProjectLink } from 'types/index'; // Correct import path
import Card from '@/components/common/Card';
import Tag from '@/components/ui/Tag';
import { useModal } from '@/context/ModalContext'; // Import the context hook
import LinkIcon from '@/components/common/LinkIcon'; // Import the new LinkIcon component
// We can potentially add Icon component usage later if needed

interface ProjectCardProps {
  project: Project;
  /** Callback function when a tag is clicked. */
  onTagClick: (tag: string) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onTagClick }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { openModal } = useModal(); // Get the openModal function from context

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  // Function to handle image click
  const handleImageClick = () => {
    if (project.media_urls && project.media_urls.length > 0 && !imageError) {
      const imageUrl = project.media_urls[0];
      const altText = `Screenshot of ${project.title}`;
      openModal(imageUrl, altText); // Call openModal from context
    }
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
                   {/* Use the LinkIcon component */}
                   <LinkIcon 
                     iconName={link.icon} 
                     url={link.url} // Pass URL as fallback if iconName is missing
                     className="w-4 h-4 mr-1.5" 
                     ariaLabel="" // Let LinkIcon handle default aria-label based on type
                   />
                   {link.title || 'Link'}
                 </a>
               ))}
             </div>
          )}
        </div>

        {/* Right side: Image */}
        {!imageError && project.media_urls && project.media_urls.length > 0 && (
          <div className="md:w-1/3 lg:w-1/4 flex-shrink-0 md:self-center project-image-container">
            <div className="relative overflow-hidden rounded-md shadow-sm h-32 md:h-40 bg-gray-100">
              <img
                src={project.media_urls[0]}
                alt={`Screenshot of ${project.title}`}
                className="w-full h-full object-cover object-center cursor-pointer"
                onError={() => setImageError(true)}
                loading="lazy"
                onClick={handleImageClick}
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