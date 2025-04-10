import React, { useState } from 'react';
import apiService from '../api/apiService';
import MarkdownToJsx from 'markdown-to-jsx';
import { Loading, ErrorDisplay, FilterButton, Tag, EmptyState } from '../components/ui';
import useApi from '../hooks/useApi';
import { Project } from '../../types';

const ProjectsPage: React.FC = () => {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Updated useApi call:
  // - Pass auto-fetch parameters directly as the second argument.
  // - Removed the options object containing dependencies and initialParams.
  const {
    data: projects,
    loading,
    error,
    // Note: The returned function is now named fetchDataCallback internally in useApi,
    // but we can still destructure it as fetchData here.
    fetchData,
  } = useApi<Project[], [string | undefined]>(
    apiService.getProjects,
    [selectedTag || undefined] // Parameters for automatic fetching
    // No third argument needed if using default options (e.g., autoFetch=true)
  );

  // Extract all unique tags from projects
  const allTags = React.useMemo(() => {
    if (!projects) return [];

    const tags = projects.flatMap((project) => project.tags || []);
    return Array.from(new Set(tags));
  }, [projects]);

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-8">
        <Loading className="h-64" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto py-8">
        <ErrorDisplay error={error} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {allTags.length > 0 && (
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            <FilterButton
              label="All Projects"
              active={!selectedTag}
              onClick={() => setSelectedTag(null)}
            />
            {allTags.map((tag) => (
              <FilterButton
                key={tag}
                label={tag}
                active={selectedTag === tag}
                onClick={() => setSelectedTag(tag)}
              />
            ))}
          </div>
        </div>
      )}

      {!projects || projects.length === 0 ? (
        <EmptyState message="No projects found matching the selected filter" />
      ) : (
        <div className="space-y-12">
          {projects.map((project) => (
            <div key={project.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-4 md:p-5 flex flex-col md:flex-row gap-4 md:items-start">
                <div className="md:flex-1">
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {project.tags?.map((tag) => (
                      <Tag key={tag} label={tag} onClick={() => setSelectedTag(tag)} />
                    ))}
                  </div>

                  <h2 className="text-lg font-bold mb-2">{project.title}</h2>
                  <p className="text-textSecondary mb-3 text-sm">{project.description}</p>

                  <div className="flex flex-wrap gap-2 mb-0">
                    {project.links.map((link, index) => (
                      <a
                        key={index}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-2.5 py-1 border border-primary text-primary rounded text-xs hover:bg-primary/10 transition"
                      >
                        {link.icon === 'github' && (
                          <svg
                            className="w-4 h-4 mr-1.5"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                          >
                            <path
                              fillRule="evenodd"
                              d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                        {link.icon === 'external-link' && (
                          <svg
                            className="w-4 h-4 mr-1.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                          </svg>
                        )}
                        {link.title}
                      </a>
                    ))}
                  </div>
                </div>

                {/* Only render image if it exists and loads properly */}
                {project.media_urls && project.media_urls.length > 0 && (
                  <div 
                    className="md:w-1/3 lg:w-1/4 flex-shrink-0 md:self-center"
                    id={`img-container-${project.id}`}
                  >
                    <div className="relative overflow-hidden rounded-md shadow-sm h-32 md:h-40">
                      <img
                        src={project.media_urls[0]}
                        alt={`Screenshot of ${project.title}`}
                        className="w-full h-full object-cover object-center"
                        onError={(e) => {
                          // Hide the entire container on error
                          const imgContainer = document.getElementById(`img-container-${project.id}`);
                          if (imgContainer) {
                            imgContainer.style.display = 'none';
                          }
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {project.writeup && (
                <div className="px-4 md:px-5 pb-4 md:pb-5">
                  <button
                    onClick={() => toggleExpand(project.id)}
                    className="flex items-center text-primary hover:underline mb-3"
                  >
                    {expandedId === project.id ? 'Hide Details' : 'Show Details'}
                    <svg
                      className={`w-4 h-4 ml-1 transition-transform ${expandedId === project.id ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      />
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
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;
