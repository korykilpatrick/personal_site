import React from 'react';
import WelcomeBlurb from '@/components/home/WelcomeBlurb';
import SiteNote from '@/components/home/SiteNote';
import CurrentlyReading from '@/components/home/CurrentlyReading';
import QuoteCarousel from '@/components/home/QuoteCarousel';

const HomePage: React.FC = () => (
  <>
    <WelcomeBlurb />

    <div className="my-10">
      <SiteNote />
    </div>

    <div className="my-10">
      <CurrentlyReading />
    </div>

    <div className="my-10">
      <QuoteCarousel />
    </div>
  </>
);

export default HomePage;