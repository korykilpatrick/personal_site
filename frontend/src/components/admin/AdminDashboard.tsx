import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Card } from '../common';
import { Loading, ErrorDisplay } from '../ui';

interface CountResponse {
  count: number;
}

const AdminDashboard: React.FC = () => {
  const [projectCount, setProjectCount] = useState<number | null>(null);
  const [workCount, setWorkCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [projectRes, workRes] = await Promise.all([
          api.get<CountResponse>('/projects/summary/count'),
          api.get<CountResponse>('/work/summary/count')
        ]);
        setProjectCount(projectRes.data.count);
        setWorkCount(workRes.data.count);
      } catch (err: any) {
        console.error("Error fetching dashboard counts:", err);
        setError(err.response?.data?.message || err.message || 'Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Dashboard</h2>
      {isLoading && <Loading />}
      {error && <ErrorDisplay error={error} />}
      {!isLoading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="text-center">
            <h3 className="text-lg font-medium text-gray-600 mb-2">Total Projects</h3>
            <p className="text-3xl font-bold">{projectCount ?? '-'}</p>
          </Card>
          <Card className="text-center">
            <h3 className="text-lg font-medium text-gray-600 mb-2">Total Work Entries</h3>
            <p className="text-3xl font-bold">{workCount ?? '-'}</p>
          </Card>
          {/* Add Quick Action buttons or Recent Activity here later */}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard; 