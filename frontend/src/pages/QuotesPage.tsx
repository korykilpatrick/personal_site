import React from 'react';
import Section from '@/components/layout/Section';
import QuoteCarousel from '@/components/home/QuoteCarousel';

/**
 * QuotesPage
 * A dedicated page for browsing quotes in a focused, one-at-a-time carousel style.
 */
const QuotesPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
      <Section className="w-full max-w-2xl text-center">
        <h1 className="text-2xl font-semibold mb-6">Quotes</h1>
        <QuoteCarousel />
      </Section>
    </div>
  );
};

export default QuotesPage;
