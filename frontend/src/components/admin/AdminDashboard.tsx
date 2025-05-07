import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Card } from '../common';
import { Loading, ErrorDisplay } from '../ui';

interface CountResponse {
  count: number;
}

interface ActiveCountResponse extends CountResponse {
  active_count?: number; // Optional for items that don't have an active state
  total_count?: number; // Optional, can use 'count' if only total is needed
}

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
        const [
          projectRes,
          workRes,
          siteNotesTotalRes,
          siteNotesActiveRes,
          quotesTotalRes,
          quotesActiveRes,
          libraryItemsRes
        ] = await Promise.all([
          api.get<CountResponse>('/projects/summary/count'),
          api.get<CountResponse>('/work/summary/count'),
          api.get<CountResponse>('/site_notes/summary/count'),
          api.get<CountResponse>('/site_notes/summary/count?active=true'),
          api.get<CountResponse>('/quotes/summary/count'),
          api.get<CountResponse>('/quotes/summary/count?active=true'),
          api.get<CountResponse>('/library-items/summary/count'),
        ]);
        setProjectCount(projectRes.data.count);
        setWorkCount(workRes.data.count);
        setSiteNoteCounts({ total: siteNotesTotalRes.data.count, active: siteNotesActiveRes.data.count });
        setQuoteCounts({ total: quotesTotalRes.data.count, active: quotesActiveRes.data.count });
        setLibraryItemCount(libraryItemsRes.data.count);
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