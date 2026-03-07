import React from 'react';
import { Link } from 'react-router-dom';
import Section from '@/components/layout/Section';
import Card from '@/components/common/Card';

const waitlistHref =
  'mailto:koryrkilpatrick@gmail.com?subject=Consulting%20Waitlist&body=Hi%20Kory%2C%0A%0AI%27d%20like%20to%20join%20the%20consulting%20waitlist.%0A%0AContext%3A%0A%0AThanks%2C';
const homepageImageUrl =
  'https://sharetribe.imgix.net/68a34eb7-4086-41be-9b2c-074dba6d0972/6930b69e-1db2-4c80-90c4-0e691eedeff0?auto=format&fit=clip&h=2400&w=2400&s=24bed4c4cecc984ab31605a80c498f59';

/**
 * HomePage
 * Presents a simple front door with clear consulting availability and
 * lightweight paths to learn more.
 */
const HomePage: React.FC = () => {
  return (
    <div className="px-6 pb-6 max-w-4xl mx-auto">
      <Section className="w-full mb-0">
        <Card padding="lg" className="w-full border-primary/10 shadow-lg">
          <div className="flex flex-col gap-8 md:flex-row md:items-start">
            <div className="w-full max-w-[17rem] mx-auto md:mx-0 md:w-72 md:flex-shrink-0">
              <img
                src={homepageImageUrl}
                alt="Portrait of Kory Kilpatrick"
                className="w-full aspect-[4/5] rounded-lg object-cover shadow-sm border border-primary/10"
              />
            </div>

            <div className="space-y-6 text-center md:text-left">
              <div className="space-y-4">
                <h1 className="font-serif text-4xl md:text-5xl text-primary font-bold leading-tight mb-0">
                  Kory Kilpatrick
                </h1>
                <p className="text-lg md:text-xl text-textSecondary max-w-3xl mx-auto md:mx-0">
                  I spend a lot of time thinking about how to use AI without getting lost in hype,
                  noise, or unnecessary complexity.
                </p>
                <p className="text-textSecondary max-w-3xl mx-auto md:mx-0">
                  I work with founders, operators, and small teams who want to think more clearly,
                  make better decisions, and build things that are actually worth building.
                </p>
                <p className="text-textSecondary max-w-3xl mx-auto md:mx-0 mb-0">
                  My consulting practice is currently full, but I&apos;m keeping a short waitlist.
                  If you think I could be helpful, send me a note with a little context and
                  I&apos;ll let you know if it seems like a fit.
                </p>
                <p className="text-textSecondary max-w-3xl mx-auto md:mx-0 mb-0">
                  If you&apos;re working on a nonprofit or mission-driven project, mention that too.
                  I&apos;m open to considering select pro bono work.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                <a
                  href={waitlistHref}
                  className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white no-underline transition-colors hover:bg-primary-dark"
                >
                  Join the waitlist
                </a>
                <Link
                  to="/bookshelf"
                  className="inline-flex items-center justify-center rounded-md border border-primary/15 bg-white px-4 py-2 text-sm font-medium text-primary no-underline transition-colors hover:bg-primary-light/5"
                >
                  View bookshelf
                </Link>
                <Link
                  to="/about"
                  className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-textSecondary no-underline transition-colors hover:bg-stone-100 hover:text-primary"
                >
                  About Kory
                </Link>
              </div>

              <p className="text-sm text-textTertiary mb-0">
                Elsewhere:{' '}
                <a
                  href="https://www.youtube.com/watch?v=Fm5K86Nu6zQ"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-primary no-underline hover:text-secondary-dark"
                >
                  The AI Metagame
                </a>{' '}
                ·{' '}
                <a
                  href="https://www.5hc.ai/l/kory-kilpatrick/6930b6b6-baa7-419a-a441-eac0a7225a6e"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-primary no-underline hover:text-secondary-dark"
                >
                  Five Hour Consulting
                </a>
              </p>
            </div>
          </div>
        </Card>
      </Section>
    </div>
  );
};

export default HomePage;
