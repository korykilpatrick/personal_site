import React from 'react';
import { render } from '@testing-library/react';
import PageMetadata from './PageMetadata';

const STRUCTURED_DATA_SELECTOR =
  'script[type="application/ld+json"][data-page-metadata="structured-data"]';

const metadataProps = {
  description: 'A page description.',
  path: '/posts/example',
  title: 'Example',
};

function managedStructuredDataElements(): HTMLScriptElement[] {
  return Array.from(document.head.querySelectorAll<HTMLScriptElement>(STRUCTURED_DATA_SELECTOR));
}

describe('PageMetadata structured data', () => {
  beforeEach(() => {
    managedStructuredDataElements().forEach((element) => element.remove());
  });

  test('reuses server-rendered JSON-LD and keeps exactly one current record', () => {
    const serverElement = document.createElement('script');
    serverElement.type = 'application/ld+json';
    serverElement.dataset.pageMetadata = 'structured-data';
    serverElement.textContent = JSON.stringify({ headline: 'Server version' });
    document.head.appendChild(serverElement);

    const firstRecord = {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: 'First post',
      keywords: 'ai, context-windows',
    };
    const { rerender } = render(<PageMetadata {...metadataProps} structuredData={firstRecord} />);

    expect(managedStructuredDataElements()).toEqual([serverElement]);
    expect(JSON.parse(serverElement.textContent ?? '')).toEqual(firstRecord);

    const secondRecord = {
      ...firstRecord,
      headline: 'Second post',
      keywords: 'writing, craft',
    };
    rerender(
      <PageMetadata {...metadataProps} path="/posts/second" structuredData={secondRecord} />,
    );

    const [currentElement] = managedStructuredDataElements();
    expect(managedStructuredDataElements()).toHaveLength(1);
    expect(JSON.parse(currentElement.textContent ?? '')).toEqual(secondRecord);
  });

  test('removes a static post record when the current page has no structured data', () => {
    const serverElement = document.createElement('script');
    serverElement.type = 'application/ld+json';
    serverElement.dataset.pageMetadata = 'structured-data';
    serverElement.textContent = JSON.stringify({ headline: 'Stale post' });
    document.head.appendChild(serverElement);

    render(<PageMetadata {...metadataProps} path="/posts" />);

    expect(managedStructuredDataElements()).toHaveLength(0);
  });
});
