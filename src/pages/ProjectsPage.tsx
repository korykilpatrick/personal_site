import React, { useState } from 'react';
import apiService from '../api/apiService';
import { Loading, ErrorDisplay, FilterButton, Tag, EmptyState } from '../components/ui';
import useApi from '../hooks/useApi';
import { Project } from '../../types';
import ProjectCard from '../components/projects/ProjectCard';

const ProjectsPage: React.FC = () => {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const {
    data: projects,
    loading,
    error,
    fetchData,
  } = useApi<Project[], [string | undefined]>(
    apiService.getProjects,
    [selectedTag || undefined]
  );

  const allTags = React.useMemo(() => {
    if (!projects) return [];

    const tags = projects.flatMap((project) => project.tags || []);
    return Array.from(new Set(tags));
  }, [projects]);

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
        <div className="space-y-4">
          {projects.map((project) => (
            <ProjectCard 
              key={project.id} 
              project={project} 
              onTagClick={setSelectedTag}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;
