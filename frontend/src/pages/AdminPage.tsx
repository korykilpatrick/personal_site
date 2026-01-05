import React from 'react';
import {
  Routes,
  Route,
  useNavigate,
  Outlet,
  useParams,
  NavLink,
} from 'react-router-dom';
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
import { getErrorMessage, logError } from '../utils/errorUtils';
import { ErrorDisplay } from '../components/ui';

// Library Items
import LibraryItemList from '@/components/admin/LibraryItemList';
import LibraryItemForm from '@/components/admin/LibraryItemForm';

/**
 * Generic form wrapper component that handles loading, error states, and CRUD operations.
 * This eliminates the code duplication in entity-specific wrappers.
 */
interface EntityFormWrapperProps<T> {
  mode: 'create' | 'edit';
  paramKey: string;
  entityName: string;
  apiPath: string;
  FormComponent: React.ComponentType<{
    initialData: T | null;
    onSubmit: (data: Omit<T, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
    isLoading: boolean;
    onCancel?: () => void;
  }>;
}

function EntityFormWrapper<T extends { id: number }>({
  mode,
  paramKey,
  entityName,
  apiPath,
  FormComponent,
}: EntityFormWrapperProps<T>): React.ReactElement {
  const params = useParams<Record<string, string>>();
  const entityId = params[paramKey];
  const navigate = useNavigate();
  const [initialData, setInitialData] = React.useState<T | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (mode === 'edit' && entityId) {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          const res = await api.get<T>(`${apiPath}/${entityId}`);
          setInitialData(res.data);
        } catch (err: unknown) {
          const errorMsg = getErrorMessage(err, `Failed to load ${entityName}`);
          setError(errorMsg);
          logError(`loading ${entityName}`, err);
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }
  }, [mode, entityId, apiPath, entityName]);

  const handleSubmit = async (data: Omit<T, 'id' | 'created_at' | 'updated_at'>) => {
    setIsLoading(true);
    setError(null);
    try {
      if (mode === 'edit' && entityId) {
        await api.put(`${apiPath}/${entityId}`, data);
        navigate('../');
      } else {
        await api.post(apiPath, data);
        navigate('.');
      }
    } catch (err: unknown) {
      const errorMsg = getErrorMessage(err, `Failed to save ${entityName}`);
      setError(errorMsg);
      logError(`saving ${entityName}`, err);
      setIsLoading(false);
      throw err;
    }
  };

  if (mode === 'edit' && isLoading && !initialData) {
    return <p>Loading {entityName} data...</p>;
  }

  if (error) {
    return <ErrorDisplay error={error} />;
  }

  if (mode === 'edit' && !initialData && !isLoading) {
    return <p>{entityName} not found.</p>;
  }

  return (
    <FormComponent
      initialData={initialData}
      onSubmit={handleSubmit}
      isLoading={isLoading}
      onCancel={() => navigate(mode === 'edit' ? '../' : '.')}
    />
  );
}

// Type-safe wrapper components for each entity
const ProjectFormWrapper: React.FC<{ mode: 'create' | 'edit' }> = ({ mode }) => (
  <EntityFormWrapper<Project>
    mode={mode}
    paramKey="projectId"
    entityName="Project"
    apiPath="/admin/projects"
    FormComponent={ProjectForm}
  />
);

const WorkFormWrapper: React.FC<{ mode: 'create' | 'edit' }> = ({ mode }) => (
  <EntityFormWrapper<WorkEntry>
    mode={mode}
    paramKey="workId"
    entityName="Work Entry"
    apiPath="/admin/work"
    FormComponent={WorkForm}
  />
);

const SiteNoteFormWrapper: React.FC<{ mode: 'create' | 'edit' }> = ({ mode }) => (
  <EntityFormWrapper<SiteNote>
    mode={mode}
    paramKey="siteNoteId"
    entityName="Site Note"
    apiPath="/admin/site_notes"
    FormComponent={SiteNoteForm}
  />
);

const QuoteFormWrapper: React.FC<{ mode: 'create' | 'edit' }> = ({ mode }) => (
  <EntityFormWrapper<Quote>
    mode={mode}
    paramKey="quoteId"
    entityName="Quote"
    apiPath="/admin/quotes"
    FormComponent={QuoteForm}
  />
);

// Library Items use a different pattern due to the form component structure
const LibraryItemFormWrapper: React.FC<{ mode: 'create' | 'edit' }> = ({ mode }) => {
  const { libraryItemId } = useParams<{ libraryItemId: string }>();
  return <LibraryItemForm mode={mode} key={libraryItemId || 'new'} />;
};

// Outlet wrapper components
const ManageProjects: React.FC = () => <Outlet />;
const ManageWork: React.FC = () => <Outlet />;
const ManageSiteNotes: React.FC = () => <Outlet />;
const ManageQuotes: React.FC = () => <Outlet />;
const ManageLibraryItems: React.FC = () => <Outlet />;

const AdminPage: React.FC = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const activeClassName = 'underline text-primary';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-4 pb-4 border-b">
        <h1 className="text-2xl font-semibold">Admin Area</h1>
        <div>
          <span className="mr-4">Welcome, {user?.username || 'admin'}!</span>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>

      <nav className="flex flex-row space-x-6 mb-6 pb-3 border-b">
        <NavLink
          to="/admin"
          end
          className={({ isActive }) => (isActive ? activeClassName : 'hover:text-primary')}
        >
          Dashboard
        </NavLink>
        <NavLink
          to="/admin/projects"
          className={({ isActive }) => (isActive ? activeClassName : 'hover:text-primary')}
        >
          Manage Projects
        </NavLink>
        <NavLink
          to="/admin/work"
          className={({ isActive }) => (isActive ? activeClassName : 'hover:text-primary')}
        >
          Manage Work
        </NavLink>
        <NavLink
          to="/admin/site_notes"
          className={({ isActive }) => (isActive ? activeClassName : 'hover:text-primary')}
        >
          Site Notes
        </NavLink>
        <NavLink
          to="/admin/quotes"
          className={({ isActive }) => (isActive ? activeClassName : 'hover:text-primary')}
        >
          Quotes
        </NavLink>
        <NavLink
          to="/admin/library-items"
          className={({ isActive }) => (isActive ? activeClassName : 'hover:text-primary')}
        >
          Library Items
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
            <Route path="new" element={<SiteNoteFormWrapper mode="create" />} />
            <Route path=":siteNoteId/edit" element={<SiteNoteFormWrapper mode="edit" />} />
          </Route>

          <Route path="quotes" element={<ManageQuotes />}>
            <Route index element={<QuoteList />} />
            <Route path="new" element={<QuoteFormWrapper mode="create" />} />
            <Route path=":quoteId/edit" element={<QuoteFormWrapper mode="edit" />} />
          </Route>

          <Route path="library-items" element={<ManageLibraryItems />}>
            <Route index element={<LibraryItemList />} />
            <Route path="new" element={<LibraryItemFormWrapper mode="create" />} />
            <Route path=":libraryItemId/edit" element={<LibraryItemFormWrapper mode="edit" />} />
          </Route>
        </Routes>
      </main>
    </div>
  );
};

export default AdminPage;
