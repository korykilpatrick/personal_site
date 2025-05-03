import React from 'react';
import { Routes, Route, Link, useNavigate, Outlet, useParams, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProjectForm from '@/components/admin/ProjectForm';
import ProjectList from '@/components/admin/ProjectList';
import WorkForm from '@/components/admin/WorkForm';
import WorkList from '@/components/admin/WorkList';
import AdminDashboard from '@/components/admin/AdminDashboard';
import SiteNoteList from '@/components/admin/SiteNoteList';
import SiteNoteForm from '@/components/admin/SiteNoteForm';
import QuoteList from '@/components/admin/QuoteList';
import QuoteForm from '@/components/admin/QuoteForm';
import { Project, WorkEntry, SiteNote, Quote } from 'types';
import api from '../services/api';
import { Button } from '../components/common';

// Wrapper for "Projects"
const ProjectFormWrapper: React.FC<{ mode: 'create' | 'edit' }> = ({ mode }) => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [initialData, setInitialData] = React.useState<Project | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (mode === 'edit' && projectId) {
      (async () => {
        setIsLoading(true);
        try {
          const res = await api.get<Project>(`/admin/projects/${projectId}`);
          setInitialData(res.data);
        } catch (err: any) {
          setError(err.response?.data?.message || err.message || 'Failed to load project');
        } finally {
          setIsLoading(false);
        }
      })();
    }
  }, [mode, projectId]);

  const handleSubmit = async (data: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => {
    setIsLoading(true);
    setError(null);
    try {
      if (mode === 'edit' && projectId) {
        await api.put(`/admin/projects/${projectId}`, data);
        navigate('../');
      } else {
        await api.post('/admin/projects', data);
        navigate('.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to save project');
      setIsLoading(false);
      throw err;
    }
  };

  if (mode === 'edit' && isLoading) return <p>Loading project data...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (mode === 'edit' && !initialData && !isLoading) return <p>Project not found.</p>;

  return (
    <ProjectForm
      initialData={initialData}
      onSubmit={handleSubmit}
      isLoading={isLoading}
      onCancel={() => navigate(mode === 'edit' ? '../' : '.')}
    />
  );
};

const ManageProjects: React.FC = () => {
  return <Outlet />;
};

// Wrapper for "Work"
const WorkFormWrapper: React.FC<{ mode: 'create' | 'edit' }> = ({ mode }) => {
  const { workId } = useParams<{ workId: string }>();
  const navigate = useNavigate();
  const [initialData, setInitialData] = React.useState<WorkEntry | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (mode === 'edit' && workId) {
      (async () => {
        setIsLoading(true);
        try {
          const res = await api.get<WorkEntry>(`/admin/work/${workId}`);
          setInitialData(res.data);
        } catch (err: any) {
          setError(err.response?.data?.message || err.message || 'Failed to load work entry');
        } finally {
          setIsLoading(false);
        }
      })();
    }
  }, [mode, workId]);

  const handleSubmit = async (data: Omit<WorkEntry, 'id' | 'created_at' | 'updated_at'>) => {
    setIsLoading(true);
    setError(null);
    try {
      if (mode === 'edit' && workId) {
        await api.put(`/admin/work/${workId}`, data);
        navigate('../');
      } else {
        await api.post('/admin/work', data);
        navigate('.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to save work entry');
      setIsLoading(false);
      throw err;
    }
  };

  if (mode === 'edit' && isLoading) return <p>Loading work entry data...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (mode === 'edit' && !initialData && !isLoading) return <p>Work entry not found.</p>;

  return (
    <WorkForm
      initialData={initialData}
      onSubmit={handleSubmit}
      isLoading={isLoading}
      onCancel={() => navigate(mode === 'edit' ? '../' : '.')}
    />
  );
};

const ManageWork: React.FC = () => {
  return <Outlet />;
};

// Wrapper for "SiteNote"
const SiteNoteFormWrapper: React.FC<{ mode: 'create' | 'edit' }> = ({ mode }) => {
  const { siteNoteId } = useParams<{ siteNoteId: string }>();
  const navigate = useNavigate();
  const [initialData, setInitialData] = React.useState<SiteNote | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (mode === 'edit' && siteNoteId) {
      (async () => {
        setIsLoading(true);
        try {
          const res = await api.get<SiteNote>(`/admin/site_notes/${siteNoteId}`);
          setInitialData(res.data);
        } catch (err: any) {
          setError(err.response?.data?.message || err.message || 'Failed to load site note');
        } finally {
          setIsLoading(false);
        }
      })();
    }
  }, [mode, siteNoteId]);

  const handleSubmit = async (data: Omit<SiteNote, 'id' | 'created_at' | 'updated_at'>) => {
    setIsLoading(true);
    setError(null);
    try {
      if (mode === 'edit' && siteNoteId) {
        await api.put(`/admin/site_notes/${siteNoteId}`, data);
        navigate('../');
      } else {
        await api.post('/admin/site_notes', data);
        navigate('.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to save site note');
      setIsLoading(false);
      throw err;
    }
  };

  if (mode === 'edit' && isLoading) return <p>Loading site note...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (mode === 'edit' && !initialData && !isLoading) return <p>Site note not found.</p>;

  return (
    <SiteNoteForm
      initialData={initialData}
      onSubmit={handleSubmit}
      isLoading={isLoading}
      onCancel={() => navigate(mode === 'edit' ? '../' : '.')}
    />
  );
};

const ManageSiteNotes: React.FC = () => {
  return <Outlet />;
};

// Wrapper for "Quote"
const QuoteFormWrapper: React.FC<{ mode: 'create' | 'edit' }> = ({ mode }) => {
  const { quoteId } = useParams<{ quoteId: string }>();
  const navigate = useNavigate();
  const [initialData, setInitialData] = React.useState<Quote | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (mode === 'edit' && quoteId) {
      (async () => {
        setIsLoading(true);
        try {
          const res = await api.get<Quote>(`/admin/quotes/${quoteId}`);
          setInitialData(res.data);
        } catch (err: any) {
          setError(err.response?.data?.message || err.message || 'Failed to load quote');
        } finally {
          setIsLoading(false);
        }
      })();
    }
  }, [mode, quoteId]);

  const handleSubmit = async (data: Omit<Quote, 'id' | 'created_at' | 'updated_at'>) => {
    setIsLoading(true);
    setError(null);
    try {
      if (mode === 'edit' && quoteId) {
        await api.put(`/admin/quotes/${quoteId}`, data);
        navigate('../');
      } else {
        await api.post('/admin/quotes', data);
        navigate('.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to save quote');
      setIsLoading(false);
      throw err;
    }
  };

  if (mode === 'edit' && isLoading) return <p>Loading quote...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (mode === 'edit' && !initialData && !isLoading) return <p>Quote not found.</p>;

  return (
    <QuoteForm
      initialData={initialData}
      onSubmit={handleSubmit}
      isLoading={isLoading}
      onCancel={() => navigate(mode === 'edit' ? '../' : '.')}
    />
  );
};

const ManageQuotes: React.FC = () => {
  return <Outlet />;
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
      <div className="flex justify-between items-center mb-4 pb-4 border-b">
        <h1 className="text-2xl font-semibold">Admin Area</h1>
        <div>
          <span className="mr-4">Welcome, {user?.username || 'admin'}!</span>
          <Button variant="outline" size="sm" onClick={handleLogout}>Logout</Button>
        </div>
      </div>

      <nav className="flex flex-row space-x-6 mb-6 pb-3 border-b">
        <NavLink to="/admin" end className={({ isActive }) => isActive ? activeClassName : 'hover:text-primary'}>
          Dashboard
        </NavLink>
        <NavLink to="/admin/projects" className={({ isActive }) => isActive ? activeClassName : 'hover:text-primary'}>
          Manage Projects
        </NavLink>
        <NavLink to="/admin/work" className={({ isActive }) => isActive ? activeClassName : 'hover:text-primary'}>
          Manage Work
        </NavLink>
        <NavLink to="/admin/site_notes" className={({ isActive }) => isActive ? activeClassName : 'hover:text-primary'}>
          Site Notes
        </NavLink>
        <NavLink to="/admin/quotes" className={({ isActive }) => isActive ? activeClassName : 'hover:text-primary'}>
          Quotes
        </NavLink>
      </nav>

      <main>
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

          <Route path="site_notes" element={<ManageSiteNotes />}>
            <Route index element={<SiteNoteList />} />
            <Route path="new" element={<SiteNoteFormWrapper mode='create' />} />
            <Route path=":siteNoteId/edit" element={<SiteNoteFormWrapper mode='edit' />} />
          </Route>

          <Route path="quotes" element={<ManageQuotes />}>
            <Route index element={<QuoteList />} />
            <Route path="new" element={<QuoteFormWrapper mode='create' />} />
            <Route path=":quoteId/edit" element={<QuoteFormWrapper mode='edit' />} />
          </Route>

        </Routes>
      </main>
    </div>
  );
};

export default AdminPage; 