import React from 'react';
import MarkdownToJsx from 'markdown-to-jsx';
import { Link } from 'react-router-dom';
import { numberFootnotes } from '@/content/posts/postText';
import '@/styles/posts.css';
import FootnoteBubble from './FootnoteBubble';
import { PostFigure, PostPullQuote, PostVideo, TweetEmbed, YouTubeEmbed } from './PostMedia';

interface PostRendererProps {
  body: string;
  postsOrigin?: string;
  onPrefetchPost?: (slug: string) => void;
}

interface PostAnchorProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  children?: React.ReactNode;
  href?: string | null;
  postsOrigin?: string;
  onPrefetchPost?: (slug: string) => void;
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
  postsOrigin?: string;
  onPrefetchPost?: (slug: string) => void;
}

interface PostNavigationContextValue {
  postsOrigin?: string;
  onPrefetchPost?: (slug: string) => void;
}

const PostNavigationContext = React.createContext<PostNavigationContextValue>({});

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

const postSlugFromHref = (href: string) =>
  href.match(/^\/posts\/([a-z0-9]+(?:-[a-z0-9]+)*)(?:[?#/]|$)/)?.[1];

const PostAnchor: React.FC<PostAnchorProps> = ({
  children,
  href = '',
  postsOrigin,
  onPrefetchPost,
  ...props
}) => {
  if (typeof href !== 'string' || !href.trim()) {
    return <>{children}</>;
  }

  if (href.startsWith('/') && !href.startsWith('//')) {
    const linkedPostSlug = postSlugFromHref(href);
    return (
      <Link
        to={href}
        state={linkedPostSlug && postsOrigin ? { postsOrigin } : undefined}
        className={props.className}
        title={props.title}
        onMouseEnter={() => linkedPostSlug && onPrefetchPost?.(linkedPostSlug)}
        onFocus={() => linkedPostSlug && onPrefetchPost?.(linkedPostSlug)}
        onTouchStart={() => linkedPostSlug && onPrefetchPost?.(linkedPostSlug)}
      >
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

  if (url.protocol === 'https:' && url.hostname.replace(/^www\./, '') === 'korykilpatrick.com') {
    const internalHref = `${url.pathname}${url.search}${url.hash}`;
    const linkedPostSlug = postSlugFromHref(internalHref);
    return (
      <Link
        to={internalHref}
        state={linkedPostSlug && postsOrigin ? { postsOrigin } : undefined}
        className={props.className}
        title={props.title}
        onMouseEnter={() => linkedPostSlug && onPrefetchPost?.(linkedPostSlug)}
        onFocus={() => linkedPostSlug && onPrefetchPost?.(linkedPostSlug)}
        onTouchStart={() => linkedPostSlug && onPrefetchPost?.(linkedPostSlug)}
      >
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

const PostLink: React.FC<PostLinkProps> = ({
  children,
  slug = '',
  postsOrigin,
  onPrefetchPost,
}) => {
  const normalizedSlug = slug.replace(/^\/+|\/+$/g, '');
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(normalizedSlug)) {
    return <>{children}</>;
  }
  return (
    <Link
      to={`/posts/${normalizedSlug}`}
      state={postsOrigin ? { postsOrigin } : undefined}
      onMouseEnter={() => onPrefetchPost?.(normalizedSlug)}
      onFocus={() => onPrefetchPost?.(normalizedSlug)}
      onTouchStart={() => onPrefetchPost?.(normalizedSlug)}
    >
      {children}
    </Link>
  );
};

const MarkdownPostAnchor: React.FC<PostAnchorProps> = (props) => {
  const { postsOrigin, onPrefetchPost } = React.useContext(PostNavigationContext);
  return <PostAnchor {...props} postsOrigin={postsOrigin} onPrefetchPost={onPrefetchPost} />;
};

const MarkdownPostLink: React.FC<PostLinkProps> = (props) => {
  const { postsOrigin, onPrefetchPost } = React.useContext(PostNavigationContext);
  return <PostLink {...props} postsOrigin={postsOrigin} onPrefetchPost={onPrefetchPost} />;
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

const PostRenderer: React.FC<PostRendererProps> = ({ body, postsOrigin, onPrefetchPost }) => {
  const navigation = React.useMemo(
    () => ({ postsOrigin, onPrefetchPost }),
    [onPrefetchPost, postsOrigin],
  );

  return (
    <PostNavigationContext.Provider value={navigation}>
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
            a: { component: MarkdownPostAnchor },
            h2: { component: H2 },
            h3: { component: H3 },
            img: { component: MarkdownImage },
            Figure: { component: PostFigure },
            Footnote: { component: FootnoteBubble },
            PostLink: { component: MarkdownPostLink },
            PullQuote: { component: PostPullQuote },
            Tweet: { component: TweetEmbed },
            Video: { component: PostVideo },
            YouTube: { component: YouTubeEmbed },
          },
        }}
      >
        {numberFootnotes(body)}
      </MarkdownToJsx>
    </PostNavigationContext.Provider>
  );
};

export default PostRenderer;
