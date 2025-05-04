import React, { useCallback } from 'react';
import Card from '@/components/common/Card';
import { useApi } from '@/hooks';
import api from '@/services/api';
import type { SiteNote } from 'types';
import { Loading, ErrorDisplay } from '@/components/ui';
import MarkdownRenderer from '@/components/common/MarkdownRenderer';

/**
 * Fetch and render the active site note from the server
 */
const SiteNote: React.FC = () => {
  const fetchSiteNote = useCallback(async () => {
    const res = await api.get<SiteNote>('/site_notes/active');
    return res.data;
  }, []); // Empty dependency array means this function is stable

  const { data, loading, error } = useApi<SiteNote>(
    fetchSiteNote, // Use the memoized callback
    [],
  );

  if (loading) {
    return null; // or <Loading/> if we want to show loader
  }
  if (error) {
    // If there's no active site note, or not found
    return null; // or <ErrorDisplay error={error}/>
  }
  if (!data) {
    return null;
  }

  return (
    <Card variant="default" className="border-l-4 border-l-secondary">
      <h2 className="text-lg font-semibold mb-3">Captain's Log</h2>
      <MarkdownRenderer>
        {data.content}
      </MarkdownRenderer>
    </Card>
  );
};

export default SiteNote;