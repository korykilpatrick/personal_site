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
    <>
      <Section className="text-center">
        <SiteNote />
      </Section>

      <Section className="text-center">
        <CurrentlyReading />
      </Section>

      <Section className="text-center">
        <Card padding="lg" className="mx-auto">
          {/* <h2 className="text-xl font-semibold mb-4">Library's Latest</h2> */}
          {/* <hr className="my-2 border-dashed border-gray-200/50 dark:border-gray-700/25" /> */}
          
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

      <Section className="text-center">
        <QuoteCarousel />
      </Section>
    </>
  );
};

export default HomePage;