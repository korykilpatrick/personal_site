import React, { useState } from 'react';
import Card from '@/components/common/Card';
import ImageModal from '../components/common/ImageModal';

const imageUrl =
  'https://korykilpatrick-bucket.s3.us-west-1.amazonaws.com/kory_winnie_mountains.jpg';
const altText = 'Kory Kilpatrick with his dog Winnie in the Canadian Rockies';

const AboutPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <Card padding="lg" className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(21,38,63,0.12),transparent_28%),radial-gradient(circle_at_85%_18%,rgba(63,127,216,0.12),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.24),transparent_58%)]"
        />

        <div className="relative grid gap-8 lg:grid-cols-[0.78fr_1.18fr] lg:items-start">
          <div className="mx-auto w-full max-w-[24rem] lg:mx-0">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="site-card-soft group block w-full overflow-hidden rounded-[22px] p-3 text-left transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/25"
              aria-label={`View larger image: ${altText}`}
            >
              <img
                src={imageUrl}
                alt={altText}
                className="aspect-[4/5] w-full rounded-[18px] object-cover shadow-[0_18px_40px_rgba(15,28,46,0.18)] transition duration-700 group-hover:scale-[1.01]"
              />
              <p className="site-meta mt-4 text-center">Winnie and me in the Canadian Rockies</p>
            </button>
          </div>

          <div className="max-w-3xl">
            <p className="site-eyebrow mb-4">About</p>
            <h1 className="mb-5 text-[2.95rem] sm:text-[3.55rem]">Hey, I&apos;m Kory.</h1>
            <div className="space-y-0 text-[1.04rem]">
              <p>
                I&apos;m a software engineer, product person, and consultant. I like figuring out
                what matters, making sense of messy situations, and helping people get unstuck.
              </p>
              <p>
                A lot of my work lately has been around AI, but what interests me most isn&apos;t
                the technology by itself. It&apos;s where it genuinely helps, where it quietly
                misleads, and how people can build better judgment around it.
              </p>
              <p>
                I care about clear thinking, good tools, and the difference between looking
                sophisticated and being effective. I&apos;m drawn to people who take craft
                seriously, move with conviction, and still stay grounded.
              </p>
              <p className="mb-0">
                Outside of work, I read a lot, stay active, and try to show up well for the people
                in my life.
              </p>
            </div>

            <div className="site-divider my-6" />

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <p className="site-meta mb-2">Bias</p>
                <p className="mb-0 text-sm text-textSecondary">Clarity over sophistication</p>
              </div>
              <div>
                <p className="site-meta mb-2">Work</p>
                <p className="mb-0 text-sm text-textSecondary">Product, systems, decision-making</p>
              </div>
              <div>
                <p className="site-meta mb-2">North Star</p>
                <p className="mb-0 text-sm text-textSecondary">Become more useful over time</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <ImageModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        imageUrl={isModalOpen ? imageUrl : null}
        altText={altText}
      />
    </div>
  );
};

export default AboutPage;
