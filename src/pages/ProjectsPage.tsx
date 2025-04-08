import React, { useState, useEffect } from 'react';
import apiService from '../api/apiService';
import MarkdownToJsx from 'markdown-to-jsx';

interface Project {
  id: number;
  title: string;
  description: string;
  media_urls: string[];
  links: {
    title: string;
    url: string;
    icon?: string;
  }[];
  writeup?: string;
  tags?: string[];
}

const ProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [allTags, setAllTags] = useState<string[]>([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        // For development, use mock data
        // In production, use: const data = await apiService.getProjects();
        const data: Project[] = [
          {
            id: 1,
            title: 'Personal Portfolio Website',
            description: 'A responsive personal website built with React, TypeScript, and Tailwind CSS.',
            media_urls: ['https://via.placeholder.com/800x450?text=Portfolio+Screenshot'],
            links: [
              { title: 'GitHub', url: 'https://github.com/yourusername/portfolio', icon: 'github' },
              { title: 'Live Demo', url: '#', icon: 'external-link' }
            ],
            writeup: '## Personal Portfolio Website\n\nThis website showcases my work as a software engineer and provides a platform for my blog posts.\n\n### Technologies Used\n\n- React\n- TypeScript\n- Tailwind CSS\n- Node.js\n- Express\n- PostgreSQL\n\n### Features\n\n- Responsive design that works on all devices\n- Interactive timeline of my professional journey\n- Blog with filtering and search functionality\n- Bookshelf integrated with Goodreads\n- Dark mode support',
            tags: ['React', 'TypeScript', 'Tailwind CSS', 'Node.js']
          },
          {
            id: 2,
            title: 'E-commerce Platform',
            description: 'A full-stack e-commerce solution with product management, cart functionality, and payment processing.',
            media_urls: ['https://via.placeholder.com/800x450?text=E-commerce+Screenshot'],
            links: [
              { title: 'GitHub', url: 'https://github.com/yourusername/ecommerce', icon: 'github' }
            ],
            writeup: '## E-commerce Platform\n\nA complete e-commerce solution built from scratch.\n\n### Technologies Used\n\n- React\n- Redux\n- Node.js\n- Express\n- MongoDB\n- Stripe Payment Integration\n\n### Features\n\n- User authentication and profiles\n- Product catalog with categories and filters\n- Shopping cart and checkout process\n- Payment processing with Stripe\n- Order history and tracking\n- Admin dashboard for inventory management',
            tags: ['React', 'Redux', 'Node.js', 'MongoDB']
          },
          {
            id: 3,
            title: 'Weather Dashboard',
            description: 'A weather application that displays current conditions and forecasts using the OpenWeather API.',
            media_urls: ['https://via.placeholder.com/800x450?text=Weather+App+Screenshot'],
            links: [
              { title: 'GitHub', url: 'https://github.com/yourusername/weather-app', icon: 'github' },
              { title: 'Live Demo', url: '#', icon: 'external-link' }
            ],
            writeup: '## Weather Dashboard\n\nA sleek weather application that provides current conditions and forecasts.\n\n### Technologies Used\n\n- JavaScript\n- HTML5\n- CSS3\n- OpenWeather API\n\n### Features\n\n- Current weather conditions\n- 5-day forecast\n- Location search\n- Responsive design\n- Geolocation support',
            tags: ['JavaScript', 'API Integration', 'CSS3']
          }
        ];
        
        setProjects(data);
        
        // Extract all unique tags
        const tags = data.flatMap(project => project.tags || []);
        const uniqueTags = Array.from(new Set(tags));
        setAllTags(uniqueTags);
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load projects');
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const filteredProjects = selectedTag
    ? projects.filter(project => project.tags?.includes(selectedTag))
    : projects;

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-8">
        <h1 className="text-4xl font-bold mb-6">Projects</h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto py-8">
        <h1 className="text-4xl font-bold mb-6">Projects</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold mb-6">Projects</h1>
      
      {allTags.length > 0 && (
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedTag(null)}
              className={`px-4 py-2 rounded-md transition ${!selectedTag ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              All Projects
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-4 py-2 rounded-md transition ${selectedTag === tag ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {filteredProjects.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <p className="text-xl text-gray-600">No projects found matching the selected filter</p>
        </div>
      ) : (
        <div className="space-y-12">
          {filteredProjects.map((project) => (
            <div key={project.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              {project.media_urls && project.media_urls.length > 0 && (
                <div className="relative overflow-hidden aspect-video">
                  <img
                    src={project.media_urls[0]}
                    alt={`Screenshot of ${project.title}`}
                    className="w-full h-full object-cover object-top"
                  />
                </div>
              )}
              
              <div className="p-6">
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tags?.map(tag => (
                    <span 
                      key={tag}
                      className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium cursor-pointer"
                      onClick={() => setSelectedTag(tag)}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                
                <h2 className="text-2xl font-bold mb-2">{project.title}</h2>
                <p className="text-textSecondary mb-4">{project.description}</p>
                
                <div className="flex flex-wrap gap-3 mb-6">
                  {project.links.map((link, index) => (
                    <a
                      key={index}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary/10 transition"
                    >
                      {link.icon === 'github' && (
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                        </svg>
                      )}
                      {link.icon === 'external-link' && (
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      )}
                      {link.title}
                    </a>
                  ))}
                </div>
                
                {project.writeup && (
                  <div className="mt-4">
                    <button
                      onClick={() => toggleExpand(project.id)}
                      className="flex items-center text-primary hover:underline mb-4"
                    >
                      {expandedId === project.id ? 'Hide Details' : 'Show Details'}
                      <svg
                        className={`w-4 h-4 ml-1 transition-transform ${expandedId === project.id ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {expandedId === project.id && (
                      <div className="prose prose-primary max-w-none">
                        <MarkdownToJsx>{project.writeup}</MarkdownToJsx>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;