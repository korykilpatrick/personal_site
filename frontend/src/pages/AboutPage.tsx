import React, { useState } from 'react';
import ImageModal from '../components/common/ImageModal';

const imageUrl =
  'https://korykilpatrick-bucket.s3.us-west-1.amazonaws.com/kory_winnie_mountains.jpg';
const altText = 'Kory Kilpatrick with his dog Winnie in the Canadian Rockies';

const AboutPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="mx-auto flex w-full max-w-[62rem] flex-col lg:min-h-[calc(100vh-10rem)] lg:justify-center">
      <div className="grid gap-10 lg:grid-cols-[21rem_minmax(0,1fr)] lg:items-center lg:gap-14 xl:gap-16">
        <div className="mx-auto w-full max-w-[21rem] lg:mx-0">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="group block w-full text-left transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/25"
            aria-label={`View larger image: ${altText}`}
          >
            <img
              src={imageUrl}
              alt={altText}
              className="aspect-[4/5] w-full rounded-[28px] border border-white/70 object-cover shadow-[0_24px_52px_rgba(15,28,46,0.16)] transition duration-700 group-hover:scale-[1.01]"
            />
          </button>
        </div>

        <div className="max-w-[36rem]">
          <div className="space-y-5 text-[1.04rem] leading-[1.88] sm:text-[1.1rem] sm:leading-[1.92]">
            <p className="text-textPrimary">
              I like solving problems, helping people, and cleaning the lens
              through which I see the world. My first career was as a top-ranked
              poker player. In 2015 I read{' '}
              <a
                href="https://waitbutwhy.com/2015/01/artificial-intelligence-revolution-1.html"
                target="_blank"
                rel="noopener noreferrer"
                className="text-secondary underline decoration-secondary/30 underline-offset-2 transition hover:decoration-secondary/60"
              >
                this article
              </a>{' '}
              and became convinced AI was going to be the most important
              technology in history, so I taught myself to code and built a
              SaaS business to get up to speed. I&rsquo;m now working
              in AI, taking entrepreneurial swings at products while
              also advising executives on how to use it for themselves
              and across their companies.
            </p>
            <p className="text-textSecondary">
              When I&rsquo;m not working, I&rsquo;m doing physical
              activities (&#127934; being the current favorite), reading,
              trying to be a good role model, or enjoying the company of
              people and animals I love.
            </p>
          </div>
        </div>
      </div>

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
