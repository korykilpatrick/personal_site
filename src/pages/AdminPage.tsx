import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, Outlet, useParams, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Import useAuth
import api from '../services/api'; // Import configured API service
import ProjectForm from '../components/admin/ProjectForm'; // Import the form
import { Project, ProjectFormData } from '../types/project'; // Import shared type
import WorkForm from '../components/admin/WorkForm'; // Import WorkForm
import { WorkEntry, WorkEntryFormData } from '../types/work'; // Import Work types
import ProjectList from '../components/admin/ProjectList';
import { Button } from '../components/common'; // Import Button
import WorkList from '../components/admin/WorkList';
import AdminDashboard from '../components/admin/AdminDashboard';

// Project Form Wrapper (Handles Create/Edit logic)
const ProjectFormWrapper: React.FC<{ mode: 'create' | 'edit' }> = ({ mode }) => {
  const { projectId } = useParams<{ projectId: string }>(); // Get ID for editing
  const navigate = useNavigate();
  const [initialData, setInitialData] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch project data if in edit mode
  useEffect(() => {
    if (mode === 'edit' && projectId) {
      const fetchProject = async () => {
        setIsLoading(true);
        setError(null);
        try {
          // Fetch the specific project by ID
          const response = await api.get<Project>(`/admin/projects/${projectId}`);
          setInitialData(response.data);
        } catch (err: any) {
          console.error('Error fetching project for edit:', err);
          if (err.response && err.response.status === 404) {
            setError('Project not found for editing.');
          } else {
            setError(err.response?.data?.message || err.message || 'Failed to load project data');
          }
          setInitialData(null); // Ensure initialData is null on error
        } finally {
          setIsLoading(false);
        }
      };
      fetchProject();
    }
  }, [mode, projectId]);

  const handleSubmit = async (projectData: ProjectFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      if (mode === 'edit' && projectId) {
        await api.put(`/admin/projects/${projectId}`, projectData);
        navigate('../', { relative: 'path' });
      } else {
        await api.post('/admin/projects', projectData);
        navigate('.', { relative: 'path' });
      }
    } catch (err: any) {
      console.error(`Error ${mode === 'edit' ? 'updating' : 'creating'} project:`, err);
      setError(err.response?.data?.message || err.message || `Failed to ${mode === 'edit' ? 'update' : 'create'} project`);
      setIsLoading(false); // Keep loading false on error to allow retry
      throw err; // Re-throw to allow ProjectForm to potentially handle it too
    }
    // Don't set loading false here if navigation happens
  };

  const handleCancel = () => {
    navigate(mode === 'edit' ? '../' : '.', { relative: 'path' }); // Go back to list
  };

  // Render loading/error or the form
  if (mode === 'edit' && isLoading) return <p>Loading project data...</p>; // Simplified loading check
  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;
  // Ensure form doesn't render in edit mode if initialData failed to load
  if (mode === 'create' || (mode === 'edit' && initialData)) {
    return (
      <ProjectForm 
        initialData={initialData} 
        onSubmit={handleSubmit} 
        isLoading={isLoading} 
        onCancel={handleCancel}
      />
    );
  }
  // Optional: Add specific message if project not found in edit mode and not loading
  if (mode === 'edit' && !isLoading && !initialData) {
      return <p>Could not load project data.</p>;
  }
  return null; // Or some fallback UI
};

// ManageProjects Container (Handles Routing)
const ManageProjects: React.FC = () => {
  return (
    <div>
      {/* Outlet renders the nested route's element (List, Create Form, Edit Form) */}
      <Outlet /> 
    </div>
  );
};

// --- Work Form Wrapper ---
const WorkFormWrapper: React.FC<{ mode: 'create' | 'edit' }> = ({ mode }) => {
  const { workId } = useParams<{ workId: string }>(); // Use relevant param name
  const navigate = useNavigate();
  const [initialData, setInitialData] = useState<WorkEntry | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (mode === 'edit' && workId) {
      const fetchWorkEntry = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const response = await api.get<WorkEntry>(`/admin/work/${workId}`);
          setInitialData(response.data);
        } catch (err: any) {
          if (err.response && err.response.status === 404) {
            setError('Work entry not found for editing.');
          } else {
            setError(err.response?.data?.message || err.message || 'Failed to load work entry data');
          }
          setInitialData(null);
        } finally {
          setIsLoading(false);
        }
      };
      fetchWorkEntry();
    }
  }, [mode, workId]);

  const handleSubmit = async (workData: WorkEntryFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      if (mode === 'edit' && workId) {
        await api.put(`/admin/work/${workId}`, workData);
        navigate('../', { relative: 'path' });
      } else {
        await api.post('/admin/work', workData);
        navigate('.', { relative: 'path' });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || `Failed to ${mode === 'edit' ? 'update' : 'create'} work entry`);
      setIsLoading(false);
      throw err;
    }
  };

  const handleCancel = () => {
    navigate(mode === 'edit' ? '../' : '.', { relative: 'path' });
  };

  if (mode === 'edit' && isLoading) return <p>Loading work entry data...</p>;
  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;
  if (mode === 'create' || (mode === 'edit' && initialData)) {
    return (
      <WorkForm 
        initialData={initialData} 
        onSubmit={handleSubmit} 
        isLoading={isLoading} 
        onCancel={handleCancel}
      />
    );
  }
  if (mode === 'edit' && !isLoading && !initialData) {
      return <p>Could not load work entry data.</p>;
  }
  return null;
};

// --- ManageWork Container (Handles Routing) ---
const ManageWork: React.FC = () => {
  return (
    <div>
      <Outlet /> 
    </div>
  );
};

const AdminPage: React.FC = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const activeClassName = "underline text-primary";

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */} 
      <div className="flex justify-between items-center mb-4 pb-4 border-b">
        <h1 className="text-2xl font-semibold">Admin Area</h1>
        <div>
          <span className="mr-4">Welcome, {user?.username || 'admin'}!</span>
          <Button variant="outline" size="sm" onClick={handleLogout}>Logout</Button>
        </div>
      </div>

      {/* Top Navigation */} 
      <nav className="flex flex-row space-x-6 mb-6 pb-3 border-b"> {/* Horizontal nav, spacing, margin */} 
        <NavLink 
          to="/admin" 
          end 
          className={({ isActive }) => isActive ? activeClassName : 'hover:text-primary'}
        >
          Dashboard
        </NavLink>
        <NavLink 
          to="/admin/projects" 
          className={({ isActive }) => isActive ? activeClassName : 'hover:text-primary'}
        >
          Manage Projects
        </NavLink>
        <NavLink 
          to="/admin/work" 
          className={({ isActive }) => isActive ? activeClassName : 'hover:text-primary'}
        >
          Manage Work
        </NavLink>
        {/* Add other admin links here */}
      </nav>

      {/* Main Content Area - Takes full width now */} 
      <main> {/* Removed width restrictions */} 
        <Routes>
          <Route index element={<AdminDashboard />} />
          <Route path="projects" element={<ManageProjects />}>
            <Route index element={<ProjectList />} />
            <Route path="new" element={<ProjectFormWrapper mode="create" />} />
            <Route path=":projectId/edit" element={<ProjectFormWrapper mode="edit" />} />
          </Route>
          <Route path="work" element={<ManageWork />}>
            <Route index element={<WorkList />} />
            <Route path="new" element={<WorkFormWrapper mode="create" />} />
            <Route path=":workId/edit" element={<WorkFormWrapper mode="edit" />} />
          </Route>
          {/* Add other admin routes here */}
        </Routes>
      </main>
      
      {/* Removed the outer flex container */}
    </div>
  );
};

export default AdminPage; 