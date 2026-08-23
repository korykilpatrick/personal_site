import React, { useEffect, useState } from 'react';
import MarkdownRenderer from '@/components/common/MarkdownRenderer';
import PageMetadata from '@/components/layout/PageMetadata';
import useActiveQuotes from '@/hooks/useActiveQuotes';

const QuotesPage: React.FC = () => {
  const { quotes, loading, error } = useActiveQuotes();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index >= quotes.length) setIndex(0);
  }, [index, quotes.length]);

  const current = quotes[index];

  return (
    <section className="quotes-room">
      <PageMetadata title="Quotes" description="Lines Kory Kilpatrick has kept." path="/quotes" />
      <header className="quotes-heading">
        <p className="site-eyebrow">Commonplace</p>
        <h1>Quotes</h1>
      </header>

      {loading ? <p className="quotes-state">Loading quotes…</p> : null}
      {error ? <p className="quotes-state">The quotes could not be loaded.</p> : null}
      {!loading && !error && !current ? <p className="quotes-state">No quotes here yet.</p> : null}

      {current ? (
        <figure className="commonplace-entry">
          <blockquote>
            <MarkdownRenderer forceBlock>{current.text}</MarkdownRenderer>
          </blockquote>
          {(current.author || current.source) && (
            <figcaption>
              {current.author ? <strong>{current.author}</strong> : null}
              {current.author && current.source ? <span aria-hidden="true"> · </span> : null}
              {current.source ? <cite>{current.source}</cite> : null}
            </figcaption>
          )}
        </figure>
      ) : null}

      {quotes.length > 1 ? (
        <nav className="commonplace-controls" aria-label="Browse quotes">
          <button
            type="button"
            onClick={() => setIndex((value) => (value === 0 ? quotes.length - 1 : value - 1))}
          >
            <span aria-hidden="true">←</span> Previous
          </button>
          <span>
            {index + 1} / {quotes.length}
          </span>
          <button type="button" onClick={() => setIndex((value) => (value + 1) % quotes.length)}>
            Next <span aria-hidden="true">→</span>
          </button>
        </nav>
      ) : null}
    </section>
  );
};

export default QuotesPage;
