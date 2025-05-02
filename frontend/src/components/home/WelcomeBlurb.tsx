import React from 'react';

/**
 * WelcomeBlurb – relaxed greeting at top of home page.
 */
const WelcomeBlurb: React.FC = () => (
  <div className="text-center mt-4">
    <h1 className="font-serif text-3xl md:text-4xl text-primary mb-2">
      Hey, I’m Kory&nbsp;👋
    </h1>
    {/* <p className="text-textSecondary text-base">
      Kick off your shoes, click around, and see what I’m building, reading, or tinkering with today.
    </p> */}
  </div>
);

export default WelcomeBlurb;