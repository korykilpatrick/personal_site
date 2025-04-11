import React from 'react';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
  // Sample recent blog posts
  const recentPosts = [
    {
      id: 1,
      title: 'Exploring the Creative Process',
      excerpt: 'Thoughts on finding inspiration and maintaining creative momentum in daily life...',
      date: 'April 4, 2025',
      slug: '/blog/exploring-creative-process',
    },
    {
      id: 2,
      title: 'Books That Changed My Perspective',
      excerpt: 'A reflection on three books that fundamentally shifted how I see the world...',
      date: 'March 21, 2025',
      slug: '/blog/books-changed-perspective',
    },
    {
      id: 3,
      title: 'Learning to Embrace Imperfection',
      excerpt: 'Why perfectionism holds us back and how to find beauty in the imperfect...',
      date: 'March 8, 2025',
      slug: '/blog/embrace-imperfection',
    },
  ];

  return (
    <>
      <section className="mb-10">
        <div className="prose">
          <h1 className="text-4xl">Hello, I'm <span className="text-primary">Kory</span></h1>
          <p>
            Welcome to my little corner of the internet. I write about technology, creativity, books, 
            and life's small wonders.
          </p>
          <p className="italic text-textSecondary border-l border-sky-200 pl-3 text-xs md:text-sm">
            "The purpose of life is not to be happy. It is to be useful, to be honorable, to be compassionate, 
            to have it make some difference that you have lived and lived well." — Ralph Waldo Emerson
          </p>
        </div>
      </section>

      <section className="mb-14">
        <h2 className="text-2xl mb-5">Recent Writings</h2>
        <div className="space-y-6">
          {recentPosts.map(post => (
            <article key={post.id} className="border-b border-sky-100 pb-5">
              <h3 className="text-xl mb-1">
                <Link to={post.slug} className="hover:text-primary no-underline">
                  {post.title}
                </Link>
              </h3>
              <p className="text-xs text-textSecondary mb-2">{post.date}</p>
              <p className="mb-2 text-sm">{post.excerpt}</p>
              <Link to={post.slug} className="text-primary text-xs font-sans">
                Continue reading →
              </Link>
            </article>
          ))}
        </div>
        <div className="mt-6">
          <Link to="/blog" className="text-primary font-sans text-xs inline-flex items-center">
            View all posts
            <svg
              className="w-3 h-3 ml-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl mb-2">Bookshelf</h2>
          <p className="mb-2 text-xs md:text-sm">
            A curated collection of books that have shaped my thinking and brought me joy.
          </p>
          <Link to="/bookshelf" className="text-primary font-sans text-xs">
            Browse my bookshelf →
          </Link>
        </div>

        <div>
          <h2 className="text-2xl mb-2">Projects</h2>
          <p className="mb-2 text-xs md:text-sm">
            Creative and technical projects I've built, from web applications to exploratory ideas.
          </p>
          <Link to="/projects" className="text-primary font-sans text-xs">
            See my work →
          </Link>
        </div>
      </section>
    </>
  );
};

export default HomePage;
