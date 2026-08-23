import React, { useEffect } from 'react';

const SITE_NAME = 'Kory Kilpatrick';
const SITE_ORIGIN = 'https://korykilpatrick.com';

interface PageMetadataProps {
  title?: string;
  description: string;
  path: string;
  type?: 'website' | 'article';
  image?: string;
  noIndex?: boolean;
  structuredData?: Record<string, unknown>;
}

interface ManagedElement {
  element: HTMLMetaElement | HTMLLinkElement;
  previousContent: string | null;
}

const STRUCTURED_DATA_SELECTOR =
  'script[type="application/ld+json"][data-page-metadata="structured-data"]';

function upsertMeta(selector: string, attributes: Record<string, string>): ManagedElement {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  const previousContent = element?.getAttribute('content') ?? null;
  if (!element) {
    element = document.createElement('meta');
    element.dataset.pageMetadata = 'true';
    document.head.appendChild(element);
  }
  Object.entries(attributes).forEach(([name, value]) => element?.setAttribute(name, value));
  return { element, previousContent };
}

function upsertCanonical(href: string): ManagedElement {
  let element = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  const previousContent = element?.getAttribute('href') ?? null;
  if (!element) {
    element = document.createElement('link');
    element.rel = 'canonical';
    element.dataset.pageMetadata = 'true';
    document.head.appendChild(element);
  }
  element.href = href;
  return { element, previousContent };
}

function reconcileStructuredData(
  structuredData: Record<string, unknown> | undefined,
): HTMLScriptElement | null {
  const existingElements = Array.from(
    document.head.querySelectorAll<HTMLScriptElement>(STRUCTURED_DATA_SELECTOR),
  );

  if (!structuredData) {
    existingElements.forEach((element) => element.remove());
    return null;
  }

  const [existingElement, ...duplicates] = existingElements;
  duplicates.forEach((element) => element.remove());

  const element = existingElement ?? document.createElement('script');
  element.type = 'application/ld+json';
  element.dataset.pageMetadata = 'structured-data';
  element.textContent = JSON.stringify(structuredData);
  if (!existingElement) {
    document.head.appendChild(element);
  }
  return element;
}

const PageMetadata: React.FC<PageMetadataProps> = ({
  title,
  description,
  path,
  type = 'website',
  image,
  noIndex = false,
  structuredData,
}) => {
  useEffect(() => {
    const previousTitle = document.title;
    const pageTitle = title ? `${title} · ${SITE_NAME}` : SITE_NAME;
    const canonicalUrl = new URL(path, SITE_ORIGIN).toString();
    document.title = pageTitle;

    const managed: ManagedElement[] = [
      upsertMeta('meta[name="description"]', { name: 'description', content: description }),
      upsertMeta('meta[property="og:title"]', { property: 'og:title', content: pageTitle }),
      upsertMeta('meta[property="og:description"]', {
        property: 'og:description',
        content: description,
      }),
      upsertMeta('meta[property="og:type"]', { property: 'og:type', content: type }),
      upsertMeta('meta[property="og:url"]', { property: 'og:url', content: canonicalUrl }),
      upsertMeta('meta[name="twitter:card"]', {
        name: 'twitter:card',
        content: image ? 'summary_large_image' : 'summary',
      }),
      upsertMeta('meta[name="twitter:title"]', {
        name: 'twitter:title',
        content: pageTitle,
      }),
      upsertMeta('meta[name="twitter:description"]', {
        name: 'twitter:description',
        content: description,
      }),
      upsertMeta('meta[name="robots"]', {
        name: 'robots',
        content: noIndex ? 'noindex, nofollow' : 'index, follow',
      }),
      upsertCanonical(canonicalUrl),
    ];

    if (image) {
      const imageUrl = new URL(image, SITE_ORIGIN).toString();
      managed.push(
        upsertMeta('meta[property="og:image"]', {
          property: 'og:image',
          content: imageUrl,
        }),
        upsertMeta('meta[name="twitter:image"]', {
          name: 'twitter:image',
          content: imageUrl,
        }),
      );
    }

    const structuredDataElement = reconcileStructuredData(structuredData);

    return () => {
      document.title = previousTitle;
      managed.forEach(({ element, previousContent }) => {
        if (element.dataset.pageMetadata === 'true') {
          element.remove();
          return;
        }
        const contentAttribute = element instanceof HTMLLinkElement ? 'href' : 'content';
        if (previousContent === null) {
          element.removeAttribute(contentAttribute);
        } else {
          element.setAttribute(contentAttribute, previousContent);
        }
      });
      structuredDataElement?.remove();
    };
  }, [description, image, noIndex, path, structuredData, title, type]);

  return null;
};

export default PageMetadata;
