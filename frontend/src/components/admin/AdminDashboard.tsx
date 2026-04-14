import React, { useState, useEffect } from 'react';
import adminApi from '../../api/adminApi';
import { Card } from '../common';
import { Loading, ErrorDisplay } from '../ui';
import { getErrorMessage, logError } from '@/utils/errorUtils';

const AdminDashboard: React.FC = () => {
  const [projectCount, setProjectCount] = useState<number | null>(null);
  const [workCount, setWorkCount] = useState<number | null>(null);
  const [siteNoteCounts, setSiteNoteCounts] = useState<{ active: number | null; total: number | null }>({ active: null, total: null });
  const [quoteCounts, setQuoteCounts] = useState<{ active: number | null; total: number | null }>({ active: null, total: null });
  const [libraryItemCount, setLibraryItemCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const counts = await adminApi.getDashboardCounts();
        setProjectCount(counts.projectCount);
        setWorkCount(counts.workCount);
        setSiteNoteCounts(counts.siteNoteCounts);
        setQuoteCounts(counts.quoteCounts);
        setLibraryItemCount(counts.libraryItemCount);
      } catch (err: unknown) {
        logError('fetching dashboard counts', err);
        const errorMsg = getErrorMessage(err, 'Failed to load dashboard data');
        setError(errorMsg);
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="text-center">
            <h3 className="text-lg font-medium text-gray-600 mb-2">Total Projects</h3>
            <p className="text-3xl font-bold">{projectCount ?? '-'}</p>
          </Card>
          <Card className="text-center">
            <h3 className="text-lg font-medium text-gray-600 mb-2">Total Work Entries</h3>
            <p className="text-3xl font-bold">{workCount ?? '-'}</p>
          </Card>
          <Card className="text-center">
            <h3 className="text-lg font-medium text-gray-600 mb-2">Site Notes</h3>
            <p className="text-3xl font-bold">
              <div>
                {siteNoteCounts.active ?? '-'}
                <span className="text-lg font-medium text-gray-500 ml-1">active</span>
              </div>
              <div>
                {siteNoteCounts.total ?? '-'}
                <span className="text-lg font-medium text-gray-500 ml-1">total</span>
              </div>
            </p>
          </Card>
          <Card className="text-center">
            <h3 className="text-lg font-medium text-gray-600 mb-2">Quotes</h3>
            <p className="text-3xl font-bold">
              <div>
                {quoteCounts.active ?? '-'}
                <span className="text-lg font-medium text-gray-500 ml-1">active</span>
              </div>
              <div>
                {quoteCounts.total ?? '-'}
                <span className="text-lg font-medium text-gray-500 ml-1">total</span>
              </div>
            </p>
          </Card>
          <Card className="text-center">
            <h3 className="text-lg font-medium text-gray-600 mb-2">Library Items</h3>
            <p className="text-3xl font-bold">{libraryItemCount ?? '-'}</p>
          </Card>
          {/* Add Quick Action buttons or Recent Activity here later */}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard; 
