import React from 'react';
import PageMetadata from '@/components/layout/PageMetadata';

const imageUrl =
  'https://korykilpatrick-bucket.s3.us-west-1.amazonaws.com/kory_winnie_mountains.jpg';
const altText = 'Kory Kilpatrick with his dog Winnie in the Canadian Rockies';

const AboutPage: React.FC = () => (
  <article className="about-room">
    <PageMetadata
      title="About"
      description="Kory Kilpatrick on poker, software, AI, reading, tennis, and cleaning the lens through which he sees the world."
      path="/about"
    />

    <figure className="about-portrait">
      <img src={imageUrl} alt={altText} />
      <figcaption>Kory and Winnie · Canadian Rockies</figcaption>
    </figure>

    <div className="about-copy">
      <p className="site-eyebrow">About</p>
      <h1>My first career was as a top-ranked poker player.</h1>
      <div className="about-prose">
        <p>
          In 2015 I read{' '}
          <a
            href="https://waitbutwhy.com/2015/01/artificial-intelligence-revolution-1.html"
            target="_blank"
            rel="noopener noreferrer"
          >
            this article
          </a>{' '}
          and became convinced AI was going to be the most important technology in history, so I
          taught myself to code and built a SaaS business to get up to speed. I&rsquo;m now working
          in AI, taking entrepreneurial swings at products while also advising executives on how to
          use it for themselves and across their companies.
        </p>
        <p>
          When I&rsquo;m not working, I&rsquo;m doing physical activities (&#127934; being the
          current favorite), reading, trying to be a good role model, or enjoying the company of
          people and animals I love.
        </p>
      </div>
    </div>
  </article>
);

export default AboutPage;
