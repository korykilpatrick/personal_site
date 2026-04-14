import React from 'react';
import { Link } from 'react-router-dom';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Timeline from '@/components/timeline/Timeline';
import timelineData from '@/data/timelineData';

const waitlistHref = 'mailto:koryrkilpatrick@gmail.com';
const homepageImageUrl =
  'https://sharetribe.imgix.net/68a34eb7-4086-41be-9b2c-074dba6d0972/6930b69e-1db2-4c80-90c4-0e691eedeff0?auto=format&fit=clip&h=2400&w=2400&s=24bed4c4cecc984ab31605a80c498f59';

const HomePage: React.FC = () => {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <Card padding="lg" className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(63,127,216,0.12),transparent_30%),radial-gradient(circle_at_82%_18%,rgba(21,38,63,0.12),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.24),transparent_58%)]"
        />

        <div className="relative grid gap-8 lg:grid-cols-[1.2fr_0.88fr] lg:items-center">
          <div className="max-w-3xl">
            <p className="site-eyebrow mb-4">AI, Product, Judgment</p>
            <h1 className="mb-5 max-w-3xl text-[3.15rem] leading-[0.94] text-primary sm:text-[4.15rem]">
              Kory Kilpatrick
            </h1>

            <div className="max-w-2xl text-[1.04rem]">
              <p className="mb-4 text-[1.08rem] leading-[1.74] text-textSecondary sm:text-[1.12rem]">
                I work with founders, operators, and small teams who want to use AI with better
                judgment, stronger product instincts, and less noise.
              </p>
              <p>
                My consulting practice is currently full, but I&apos;m keeping a short waitlist.
                If you think I could be helpful, send me a note with a little context and I&apos;ll
                let you know if it feels like a fit.
              </p>
              <p className="mb-0">
                If you&apos;re working on a nonprofit or mission-driven project, mention that too.
                I&apos;m open to considering select pro bono work.
              </p>
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <a href={waitlistHref} className="no-underline">
                <Button size="lg">Join the waitlist</Button>
              </a>
              <Link to="/bookshelf" className="no-underline">
                <Button variant="outline" size="lg">
                  View bookshelf
                </Button>
              </Link>
              <Link to="/about" className="no-underline">
                <Button variant="text" size="lg" className="justify-center">
                  About Kory
                </Button>
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="https://www.youtube.com/watch?v=Fm5K86Nu6zQ"
                target="_blank"
                rel="noopener noreferrer"
              className="site-link-chip"
              >
                The AI Metagame
              </a>
              <a
                href="https://www.5hc.ai/l/kory-kilpatrick/6930b6b6-baa7-419a-a441-eac0a7225a6e"
                target="_blank"
                rel="noopener noreferrer"
              className="site-link-chip"
              >
                Five Hour Consulting
              </a>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[24rem] lg:mx-0 lg:justify-self-end">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -inset-4 rounded-[34px] bg-[radial-gradient(circle_at_center,rgba(63,127,216,0.16),transparent_62%)] blur-2xl"
            />
            <div className="site-card-soft relative overflow-hidden rounded-[32px] p-3">
              <img
                src={homepageImageUrl}
                alt="Portrait of Kory Kilpatrick"
                className="aspect-[4/5] w-full rounded-[18px] object-cover shadow-[0_18px_40px_rgba(15,28,46,0.18)]"
              />
              <div className="mt-4 flex items-center justify-between gap-4 px-2 pb-1">
                <div>
                  <p className="site-meta mb-1">Currently</p>
                  <p className="mb-0 text-sm text-textSecondary">Consulting waitlist open</p>
                </div>
                <div className="h-10 w-px bg-[rgba(21,38,63,0.1)]" />
                <div className="text-right">
                  <p className="site-meta mb-1">Signals</p>
                  <p className="mb-0 text-sm text-textSecondary">Operator, builder, reader</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Timeline */}
      <Timeline items={timelineData} />

      <div className="grid gap-4 md:grid-cols-2">
        <Card padding="md" variant="outline" className="relative overflow-hidden">
          <p className="site-eyebrow mb-3">Bookshelf</p>
          <h2 className="mb-3 text-[2rem]">The part I keep current</h2>
          <p className="mb-5 max-w-xl">
            The bookshelf is the most reliable map of how I think: systems, judgment, literature,
            product, psychology, and the books that keep earning a return visit.
          </p>
          <Link to="/bookshelf" className="site-link-chip">
            Enter the shelf
          </Link>
        </Card>

        <Card padding="md" variant="outline" className="relative overflow-hidden">
          <p className="site-eyebrow mb-3">About</p>
          <h2 className="mb-3 text-[2rem]">A little more context</h2>
          <p className="mb-5 max-w-xl">
            I&apos;m interested in leverage, taste, judgment, and the difference between looking
            sophisticated and actually being useful.
          </p>
          <Link to="/about" className="site-link-chip">
            More about me
          </Link>
        </Card>
      </div>
    </div>
  );
};

export default HomePage;
