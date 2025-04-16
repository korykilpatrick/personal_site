import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, Outlet, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Import useAuth
import api from '../services/api'; // Import configured API service
import ProjectForm from '../components/admin/ProjectForm'; // Import the form
import { Project, ProjectFormData } from '../types/project'; // Import shared type
import WorkForm from '../components/admin/WorkForm'; // Import WorkForm
import { WorkEntry, WorkEntryFormData } from '../types/work'; // Import Work types

// Placeholder components for admin sections
const AdminDashboard: React.FC = () => <h2>Admin Dashboard</h2>;

// Project List Component
const ProjectList: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate(); // For Edit button

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
  }, []); // Empty dependency array means run once on mount

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      setIsLoading(true); // Indicate loading during delete
      setError(null);
      try {
        await api.delete(`/admin/projects/${id}`);
        // Refetch projects or remove locally
        setProjects(projects.filter(p => p.id !== id)); 
      } catch (err: any) {
        console.error('Error deleting project:', err);
        setError(err.response?.data?.message || err.message || 'Failed to delete project');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h2>Manage Projects</h2>
        {/* Link to the "Create New" route */}
        <Link to="new">
          <button>Create New Project</button>
        </Link>
      </div>
      {isLoading && <p>Loading projects...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {!isLoading && !error && (
        <table border={1} style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Description</th>
              <th>Created</th>
              <th>Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr key={project.id}>
                <td>{project.id}</td>
                <td>{project.title}</td>
                {/* Truncate long descriptions if needed */}
                <td>{project.description.substring(0, 100)}{project.description.length > 100 ? '...' : ''}</td> 
                <td>{new Date(project.created_at).toLocaleDateString()}</td>
                <td>{new Date(project.updated_at).toLocaleDateString()}</td>
                <td>
                  {/* Edit Button navigates to the edit route */}
                  <button onClick={() => navigate(`${project.id}/edit`)} style={{ marginRight: '5px' }} disabled={isLoading}>
                    Edit
                  </button>
                  <button onClick={() => handleDelete(project.id)} disabled={isLoading}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {projects.length === 0 && !isLoading && !error && <p>No projects found.</p>}
    </div>
  );
};

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

// --- Work List Component ---
const WorkList: React.FC = () => {
  const [workEntries, setWorkEntries] = useState<WorkEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWork = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await api.get<WorkEntry[]>('/admin/work');
        setWorkEntries(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || err.message || 'Failed to fetch work entries');
      } finally {
        setIsLoading(false);
      }
    };
    fetchWork();
  }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this work entry?')) {
      setIsLoading(true);
      setError(null);
      try {
        await api.delete(`/admin/work/${id}`);
        setWorkEntries(workEntries.filter(w => w.id !== id));
      } catch (err: any) {
        setError(err.response?.data?.message || err.message || 'Failed to delete work entry');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h2>Manage Work Entries</h2>
        <Link to="new"><button>Create New Entry</button></Link>
      </div>
      {isLoading && <p>Loading work entries...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {!isLoading && !error && (
        <table border={1} style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Company</th>
              <th>Role</th>
              <th>Duration</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {workEntries.map((entry) => (
              <tr key={entry.id}>
                <td>{entry.id}</td>
                <td>{entry.company}</td>
                <td>{entry.role}</td>
                <td>{entry.duration}</td>
                <td>
                  <button onClick={() => navigate(`${entry.id}/edit`)} style={{ marginRight: '5px' }} disabled={isLoading}>Edit</button>
                  <button onClick={() => handleDelete(entry.id)} disabled={isLoading}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {workEntries.length === 0 && !isLoading && !error && <p>No work entries found.</p>}
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
  const { logout, user } = useAuth(); // Get logout function and user info
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login'); // Redirect to login after logout
  };

  return (
    <div style={{ padding: '20px' }}> { /* Add some padding */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Admin Area</h1>
        <div>
          {user && <span>Welcome, {user.username}! </span>}
          <button onClick={handleLogout}>Logout</button>
        </div>
      </header>
      <nav style={{ marginBottom: '20px' }}> { /* Add margin */}
        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', gap: '15px' }}> { /* Basic nav styling */}
          <li><Link to=".">Dashboard</Link></li>
          <li><Link to="projects">Manage Projects</Link></li>
          <li><Link to="work">Manage Work</Link></li>
          {/* Add links to other admin sections here */}
        </ul>
      </nav>
      <hr style={{ marginBottom: '20px' }}/>
      <Routes>
        <Route index element={<AdminDashboard />} />
        {/* Nested routes for Projects section */}
        <Route path="projects" element={<ManageProjects />}>
          <Route index element={<ProjectList />} />
          <Route path="new" element={<ProjectFormWrapper mode="create" />} />
          <Route path=":projectId/edit" element={<ProjectFormWrapper mode="edit" />} />
        </Route>
        {/* Work Routes */}
        <Route path="work" element={<ManageWork />}>
          <Route index element={<WorkList />} />
          <Route path="new" element={<WorkFormWrapper mode="create" />} />
          <Route path=":workId/edit" element={<WorkFormWrapper mode="edit" />} />
        </Route>
        {/* Add routes for other admin sections here */}
      </Routes>
    </div>
  );
};

export default AdminPage; 