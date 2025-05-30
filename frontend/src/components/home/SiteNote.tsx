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

  // Format the date: Month 'YY
  const date = new Date(data.created_at || Date.now());
  const formattedDate = date.toLocaleDateString('en-US', {
    month: 'short',
    year: '2-digit',
  }).replace(' ', " '");

  // Construct the content with styled date
  const contentWithStyledDate = `\
<span class="font-serif text-primary font-bold pr-1">${formattedDate}:</span> ${data.content}\
`;

  return (
    <Card variant="default" className="border-l-4 border-l-secondary">
      {/* Title centered by parent Section */}
      {/* <h2 className="text-lg font-semibold mb-2">Captain's Log</h2> */}
      {/* <hr className="my-2 border-dashed border-gray-200/50 dark:border-gray-700/25" /> */}
      {/* Date is styled and prepended within MarkdownRenderer */}
      <MarkdownRenderer>
        {contentWithStyledDate}
      </MarkdownRenderer>
    </Card>
  );
};

export default SiteNote;