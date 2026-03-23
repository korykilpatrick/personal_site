import React from 'react';
import Card from '@/components/common/Card';
import QuoteCarousel from '@/components/home/QuoteCarousel';

/**
 * QuotesPage
 * A dedicated page for browsing quotes in a focused, one-at-a-time carousel style.
 */
const QuotesPage: React.FC = () => {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-4xl items-center justify-center py-6">
      <Card padding="lg" className="w-full text-center">
        <p className="site-eyebrow mb-4">Quotes</p>
        <h1 className="mb-6 text-[2.6rem]">Lines worth keeping</h1>
        <QuoteCarousel />
      </Card>
    </div>
  );
};

export default QuotesPage;
