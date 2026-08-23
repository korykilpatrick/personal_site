import React from 'react';
import { Link } from 'react-router-dom';
import PageMetadata from '@/components/layout/PageMetadata';

const portraitUrl =
  'https://korykilpatrick-bucket.s3.us-west-1.amazonaws.com/kory_winnie_mountains.jpg';

const POSTS_ENABLED = process.env.REACT_APP_POSTS_ENABLED === 'true';

export const getHomePaths = (postsEnabled: boolean) => {
  const destinations = [
    ...(postsEnabled ? [{ title: 'Posts', note: 'Essays and shorter notes', to: '/posts' }] : []),
    { title: 'Bookshelf', note: 'What I’m reading and have read', to: '/bookshelf' },
    { title: 'About', note: 'Poker, software, AI, tennis, Winnie', to: '/about' },
  ];

  return destinations.map((path, index) => ({
    ...path,
    number: String(index + 1).padStart(2, '0'),
  }));
};

const PATHS = getHomePaths(POSTS_ENABLED);

const HomePage: React.FC = () => (
  <section className="home-threshold">
    <PageMetadata
      description="I like solving problems, helping people, and cleaning the lens through which I see the world."
      path="/"
    />

    <div className="home-threshold-copy">
      <p className="home-name">Kory Kilpatrick</p>
      <h1>
        I like solving problems, helping people, and cleaning the lens through which I see the
        world.
      </h1>

      <nav className="home-paths" aria-label="Explore the site">
        {PATHS.map((path) => (
          <Link key={path.to} to={path.to} className="home-path">
            <span className="home-path-number" aria-hidden="true">
              {path.number}
            </span>
            <span className="home-path-copy">
              <strong>{path.title}</strong>
              <span>{path.note}</span>
            </span>
            <span className="home-path-arrow" aria-hidden="true">
              ↗
            </span>
          </Link>
        ))}
      </nav>
    </div>

    <figure className="home-portrait">
      <div className="home-portrait-mat">
        <img src={portraitUrl} alt="Portrait of Kory Kilpatrick" />
      </div>
      <figcaption>With Winnie in the Canadian Rockies</figcaption>
    </figure>
  </section>
);

export default HomePage;
