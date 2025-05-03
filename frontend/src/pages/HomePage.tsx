import React from 'react';
import Section from '@/components/layout/Section';
import WelcomeBlurb from '@/components/home/WelcomeBlurb';
import SiteNote from '@/components/home/SiteNote';
import CurrentlyReading from '@/components/home/CurrentlyReading';
import QuoteCarousel from '@/components/home/QuoteCarousel';
import ExploreGrid from '@/components/home/ExploreGrid';

/**
 * HomePage
 * Renders the landing content in a vertically-stacked,
 * centrally-aligned flow; minimal horizontal distraction.
 */
const HomePage: React.FC = () => {
  return (
    <>
      <Section className="text-center">
        <WelcomeBlurb />
      </Section>

      <Section className="text-center">
        <SiteNote />
      </Section>

      <Section className="text-center">
        <CurrentlyReading />
      </Section>

      <Section className="text-center">
        <QuoteCarousel />
      </Section>

      {/* <Section className="text-center">
        <ExploreGrid />
      </Section> */}
    </>
  );
};

export default HomePage;