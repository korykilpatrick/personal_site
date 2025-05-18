import React, { useMemo } from 'react';
import Section from '@/components/layout/Section';
import SiteNote from '@/components/home/SiteNote';
import CurrentlyReading from '@/components/home/CurrentlyReading';
import QuoteCarousel from '@/components/home/QuoteCarousel';
import HomepageLibraryItem from '@/components/home/HomepageLibraryItem';
import { Loading, ErrorDisplay, EmptyState } from '@/components/ui';
import Card from '@/components/common/Card';
import { LibraryItem } from 'types';
import { useLibrary } from '@/context/LibraryContext';

/**
 * HomePage
 * Renders the landing content in a vertically-stacked,
 * centrally-aligned flow; minimal horizontal distraction.
 */
const HomePage: React.FC = () => {
  const { libraryItems, loading, error } = useLibrary();

  const latestLibraryItem = useMemo(() => {
    if (!libraryItems || libraryItems.length === 0) {
      return null;
    }
    const sortedItems = [...libraryItems].sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return dateB - dateA;
    });
    return sortedItems[0];
  }, [libraryItems]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
      {/* Left Column: Captain's Log and Quotes (1/3 width) */}
      <div className="md:col-span-1 flex flex-col gap-2">
        <Section className="text-center mb-0">
          <h2 className="text-xl font-semibold mb-4">Captain's Log</h2>
          <SiteNote />
        </Section>
        <Section className="text-center">
          <h2 className="text-xl font-semibold mb-4">Quotes</h2>
          <QuoteCarousel />
        </Section>
      </div>

      {/* Right Column: Library's Latest and Currently Reading (2/3 width) */}
      <div className="md:col-span-2 flex flex-col gap-2">
        <Section className="w-full max-w-none mb-0">
          <h2 className="text-xl font-semibold mb-4">Library's Latest</h2>
          <Card padding="lg" className="w-full">
            {loading && <Loading />}
            {error && <ErrorDisplay error={`Error loading library: ${error.message}`} />}
            {!loading && !error && !latestLibraryItem && (
              <EmptyState message="The library is quiet right now. Check back soon!" />
            )}
            {!loading && !error && latestLibraryItem && (
              <div className="mt-4">
                <HomepageLibraryItem item={latestLibraryItem} />
              </div>
            )}
          </Card>
        </Section>
        <Section className="text-center w-full max-w-none">
          <h2 className="text-xl font-semibold mb-4">Currently Reading</h2>
          <CurrentlyReading />
        </Section>
      </div>
    </div>
  );
};

export default HomePage;