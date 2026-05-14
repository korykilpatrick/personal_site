import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Outlet, Route, Routes } from 'react-router-dom';
import adminApi from '../api/adminApi';
import { EntityFormWrapper } from './AdminPage';

jest.mock('../api/adminApi', () => ({
  __esModule: true,
  default: {
    create: jest.fn(),
    getById: jest.fn(),
    update: jest.fn(),
  },
}));

interface TestEntity {
  id: number;
  name: string;
  created_at?: string;
  updated_at?: string;
}

const mockedAdminApi = adminApi as jest.Mocked<typeof adminApi>;

const TestForm: React.FC<{
  initialData: TestEntity | null;
  onSubmit: (data: Omit<TestEntity, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  isLoading: boolean;
  onCancel?: () => void;
}> = ({ onSubmit, isLoading }) => (
  <form
    onSubmit={(event) => {
      event.preventDefault();
      void onSubmit({ name: 'created record' });
    }}
  >
    <button type="submit" disabled={isLoading}>
      {isLoading ? 'Saving...' : 'Save'}
    </button>
  </form>
);

describe('EntityFormWrapper', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns to the parent list route after a successful create', async () => {
    mockedAdminApi.create.mockResolvedValue(undefined);

    render(
      <MemoryRouter
        initialEntries={['/admin/test/new']}
        future={{ v7_relativeSplatPath: true, v7_startTransition: true }}
      >
        <Routes>
          <Route path="/admin/test" element={<Outlet />}>
            <Route index element={<div>List route</div>} />
            <Route
              path="new"
              element={
                <EntityFormWrapper<TestEntity>
                  mode="create"
                  paramKey="testId"
                  entityName="Test Entity"
                  apiPath="/admin/test"
                  FormComponent={TestForm}
                />
              }
            />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(mockedAdminApi.create).toHaveBeenCalledWith('/admin/test', {
        name: 'created record',
      });
    });
    expect(await screen.findByText('List route')).toBeInTheDocument();
  });
});
