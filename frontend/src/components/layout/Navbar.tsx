import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { warmBookshelfExperience } from '@/pages/bookshelfWarmup';

const EMAIL_HREF = 'mailto:koryrkilpatrick@gmail.com';
const POSTS_ENABLED = process.env.REACT_APP_POSTS_ENABLED === 'true';

const NAV_LINKS = [
  ...(POSTS_ENABLED ? [{ name: 'Posts', path: '/posts' }] : []),
  { name: 'Bookshelf', path: '/bookshelf' },
  { name: 'About', path: '/about' },
] as const;

const ELSEWHERE_LINKS = [
  { label: 'Quotes', href: '/quotes', internal: true },
  {
    label: 'Five Hour Consulting',
    href: 'https://www.5hc.ai/l/kory-kilpatrick/6930b6b6-baa7-419a-a441-eac0a7225a6e',
  },
  { label: 'X', href: 'https://x.com/kory_kilpatrick' },
  { label: 'GitHub', href: 'https://github.com/korykilpatrick' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/kory-kilpatrick-b60707243/' },
  { label: 'Email', href: EMAIL_HREF },
] as const;

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const mobileMenuRef = useRef<HTMLElement>(null);
  const location = useLocation();
  const warmBookshelf = () => {
    void warmBookshelfExperience().catch(() => undefined);
  };

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isMenuOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setIsMenuOpen(false);
      requestAnimationFrame(() => menuButtonRef.current?.focus());
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [isMenuOpen]);

  useEffect(() => {
    mobileMenuRef.current?.toggleAttribute('inert', !isMenuOpen);
  }, [isMenuOpen]);

  const isActive = (path: string) => location.pathname.startsWith(path);
  return (
    <header className="site-header">
      <nav className="site-nav" aria-label="Primary navigation">
        <Link to="/" className="site-wordmark" aria-label="Kory Kilpatrick, home">
          <span className="site-wordmark-mark" aria-hidden="true">
            K
          </span>
          <span>Kory Kilpatrick</span>
        </Link>

        <div className="site-nav-links">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="site-nav-link"
              aria-current={isActive(link.path) ? 'page' : undefined}
              onMouseEnter={link.path === '/bookshelf' ? warmBookshelf : undefined}
              onFocus={link.path === '/bookshelf' ? warmBookshelf : undefined}
            >
              {link.name}
            </Link>
          ))}

          <details className="site-elsewhere">
            <summary>Elsewhere</summary>
            <div className="site-elsewhere-menu">
              {ELSEWHERE_LINKS.map((link) =>
                'internal' in link && link.internal ? (
                  <Link key={link.label} to={link.href}>
                    {link.label}
                  </Link>
                ) : (
                  <a
                    key={link.label}
                    href={link.href}
                    target={link.href === EMAIL_HREF ? undefined : '_blank'}
                    rel={link.href === EMAIL_HREF ? undefined : 'noopener noreferrer'}
                  >
                    {link.label}
                    {link.href === EMAIL_HREF ? null : <span aria-hidden="true">↗</span>}
                  </a>
                ),
              )}
            </div>
          </details>
        </div>

        <button
          ref={menuButtonRef}
          type="button"
          className="site-menu-button"
          onClick={() => setIsMenuOpen((open) => !open)}
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-site-menu"
        >
          <span />
          <span />
        </button>
      </nav>

      <nav
        ref={mobileMenuRef}
        id="mobile-site-menu"
        className={`site-mobile-menu${isMenuOpen ? ' is-open' : ''}`}
        aria-label="Mobile navigation"
        aria-hidden={!isMenuOpen}
      >
        <div className="site-mobile-menu-inner">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              tabIndex={isMenuOpen ? undefined : -1}
              aria-current={isActive(link.path) ? 'page' : undefined}
              onTouchStart={link.path === '/bookshelf' ? warmBookshelf : undefined}
            >
              {link.name}
            </Link>
          ))}
          <div className="site-mobile-elsewhere">
            {ELSEWHERE_LINKS.map((link) =>
              'internal' in link && link.internal ? (
                <Link key={link.label} to={link.href} tabIndex={isMenuOpen ? undefined : -1}>
                  {link.label}
                </Link>
              ) : (
                <a
                  key={link.label}
                  href={link.href}
                  tabIndex={isMenuOpen ? undefined : -1}
                  target={link.href === EMAIL_HREF ? undefined : '_blank'}
                  rel={link.href === EMAIL_HREF ? undefined : 'noopener noreferrer'}
                >
                  {link.label}
                </a>
              ),
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
