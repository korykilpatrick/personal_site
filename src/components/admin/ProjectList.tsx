import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Project } from '../../../types';
import { Button, Card } from '../common';
import { Loading, ErrorDisplay, EmptyState } from '../ui';

const ProjectList: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Start loading true
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await api.get<Project[]>('/admin/projects');
        setProjects(response.data);
      } catch (err: any) {
        console.error('Error fetching projects:', err);
        setError(err.response?.data?.message || err.message || 'Failed to fetch projects');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const handleDelete = async (id: number) => {
    // Basic confirmation
    if (window.confirm('Are you sure you want to delete this project?')) {
      // Ideally show loading state on the specific row/button during delete
      // For simplicity, we'll just disable buttons via main isLoading
      // A more complex implementation could track deletingId state.
      setIsLoading(true); 
      setError(null);
      try {
        await api.delete(`/admin/projects/${id}`);
        setProjects(projects.filter(p => p.id !== id));
      } catch (err: any) { 
        console.error('Error deleting project:', err);
        setError(err.response?.data?.message || err.message || 'Failed to delete project');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return <Loading className="mt-4" />;
    }
    if (error) {
      return <ErrorDisplay error={error} className="mt-4" />;
    }
    if (projects.length === 0) {
      return <EmptyState message="No projects found. Create one!" className="mt-4" />;
    }

    return (
      <div className="mt-4 space-y-3"> {/* List container */} 
        {/* Header Row - Removed Description, updated grid columns */}
        <div className="hidden md:grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 px-4 py-2 font-medium text-gray-600 border-b">
          <span>ID</span>
          <span>Title</span>
          {/* Removed Description Header */} 
          <span>Created</span>
          <span>Updated</span>
          <span>Actions</span>
        </div>
        {/* Project Rows - Removed Description, updated grid columns */} 
        {projects.map((project) => (
          <div 
            key={project.id} 
            className="grid grid-cols-1 md:grid-cols-[auto_1fr_auto_auto_auto] gap-3 md:gap-4 px-4 py-3 border rounded-md hover:bg-gray-50 items-center"
          >
            <span className="text-sm font-medium text-gray-500 md:text-base md:font-normal md:text-inherit">{project.id}</span>
            {/* Removed truncate from title */}
            <span className="font-medium">{project.title}</span> 
            {/* Add check for optional dates before formatting */}
            <span className="text-xs text-gray-500 md:text-sm">
              {project.created_at ? new Date(project.created_at).toLocaleDateString() : '-'}
            </span>
            <span className="text-xs text-gray-500 md:text-sm">
              {project.updated_at ? new Date(project.updated_at).toLocaleDateString() : '-'}
            </span>
            <div className="flex space-x-2 justify-end md:justify-start"> {/* Action buttons */} 
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate(`${project.id}/edit`)} 
                disabled={isLoading}
              >
                Edit
              </Button>
              <Button 
                variant="text" 
                size="sm" 
                onClick={() => handleDelete(project.id)} 
                disabled={isLoading}
                className="text-red-600 hover:bg-red-50"
              >
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card>
      <div className="flex justify-between items-center mb-0"> {/* Remove bottom margin from Card's content */} 
        <h2 className="text-xl font-semibold">Manage Projects</h2>
        <Link to="new">
          <Button variant="primary">Create New Project</Button>
        </Link>
      </div>
      {renderContent()} {/* Render loading/error/list */} 
    </Card>
  );
};

export default ProjectList; 