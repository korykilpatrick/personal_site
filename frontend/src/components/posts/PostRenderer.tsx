import React from 'react';
import MarkdownToJsx from 'markdown-to-jsx';
import { Link } from 'react-router-dom';
import { numberFootnotes } from '@/content/posts/postText';
import '@/styles/posts.css';
import FootnoteBubble from './FootnoteBubble';
import { PostFigure, PostPullQuote, PostVideo, TweetEmbed, YouTubeEmbed } from './PostMedia';

interface PostRendererProps {
  body: string;
}

interface PostAnchorProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  children?: React.ReactNode;
  href?: string | null;
}

interface HeadingProps {
  children?: React.ReactNode;
}

interface MarkdownImageProps {
  alt?: string;
  src?: string;
  title?: string;
}

interface PostLinkProps {
  children?: React.ReactNode;
  slug?: string;
}

const SAFE_MARKDOWN_ELEMENTS = new Set([
  'a',
  'blockquote',
  'br',
  'code',
  'del',
  'div',
  'em',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'hr',
  'img',
  'kbd',
  'li',
  'ol',
  'p',
  'pre',
  'span',
  'strong',
  'sub',
  'sup',
  'table',
  'tbody',
  'td',
  'th',
  'thead',
  'tr',
  'ul',
]);

function getTextContent(node: React.ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') {
    return String(node);
  }
  if (Array.isArray(node)) {
    return node.map(getTextContent).join('');
  }
  if (React.isValidElement<{ children?: React.ReactNode }>(node)) {
    return getTextContent(node.props.children);
  }
  return '';
}

export function headingId(children: React.ReactNode): string {
  return getTextContent(children)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

const PostAnchor: React.FC<PostAnchorProps> = ({ children, href = '', ...props }) => {
  if (typeof href !== 'string' || !href.trim()) {
    return <>{children}</>;
  }

  if (href.startsWith('/') && !href.startsWith('//')) {
    return (
      <Link to={href} className={props.className} title={props.title}>
        {children}
      </Link>
    );
  }

  if (href.startsWith('#')) {
    return (
      <a {...props} href={href}>
        {children}
      </a>
    );
  }

  let url: URL;
  try {
    url = new URL(href);
  } catch {
    return <>{children}</>;
  }

  if (
    url.protocol === 'https:' &&
    url.hostname.replace(/^www\./, '') === 'korykilpatrick.com'
  ) {
    return (
      <Link to={`${url.pathname}${url.search}${url.hash}`} className={props.className} title={props.title}>
        {children}
      </Link>
    );
  }

  if (url.protocol === 'mailto:') {
    return (
      <a {...props} href={url.toString()}>
        {children}
      </a>
    );
  }

  if (url.protocol !== 'https:') {
    return <>{children}</>;
  }

  return (
    <a {...props} href={url.toString()} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
};

const PostLink: React.FC<PostLinkProps> = ({ children, slug = '' }) => {
  const normalizedSlug = slug.replace(/^\/+|\/+$/g, '');
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(normalizedSlug)) {
    return <>{children}</>;
  }
  return <Link to={`/posts/${normalizedSlug}`}>{children}</Link>;
};

const H2: React.FC<HeadingProps> = ({ children }) => {
  const id = headingId(children);
  return (
    <h2 id={id} tabIndex={-1}>
      {children}
    </h2>
  );
};

const H3: React.FC<HeadingProps> = ({ children }) => {
  const id = headingId(children);
  return (
    <h3 id={id} tabIndex={-1}>
      {children}
    </h3>
  );
};

const MarkdownImage: React.FC<MarkdownImageProps> = ({ alt = '', src = '', title }) => (
  <PostFigure src={src} alt={alt} caption={title} align="body" />
);

const PostRenderer: React.FC<PostRendererProps> = ({ body }) => (
  <MarkdownToJsx
    className="post-flow post-prose"
    options={{
      createElement: (tag, props, ...children) => {
        if (typeof tag === 'string' && !SAFE_MARKDOWN_ELEMENTS.has(tag)) {
          return null;
        }
        const safeProps =
          typeof tag === 'string'
            ? Object.fromEntries(
                Object.entries(props).filter(
                  ([name]) =>
                    name !== 'style' &&
                    name !== 'dangerouslySetInnerHTML' &&
                    !/^on/i.test(name),
                ),
              )
            : props;
        return React.createElement(tag, safeProps, ...children);
      },
      forceBlock: true,
      overrides: {
        a: { component: PostAnchor },
        h2: { component: H2 },
        h3: { component: H3 },
        img: { component: MarkdownImage },
        Figure: { component: PostFigure },
        Footnote: { component: FootnoteBubble },
        PostLink: { component: PostLink },
        PullQuote: { component: PostPullQuote },
        Tweet: { component: TweetEmbed },
        Video: { component: PostVideo },
        YouTube: { component: YouTubeEmbed },
      },
    }}
  >
    {numberFootnotes(body)}
  </MarkdownToJsx>
);

export default PostRenderer;
