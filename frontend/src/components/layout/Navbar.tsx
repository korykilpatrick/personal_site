import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaXTwitter, FaGithub, FaLinkedinIn } from 'react-icons/fa6';
import { MdEmail } from 'react-icons/md';

// Icon size constants
const DESKTOP_ICON_SIZE = 32;
const MOBILE_ICON_SIZE = 18;

// Icon style constants
const ICON_LINK_CLASSNAME =
  'text-slate-100 hover:text-secondary-light no-underline transition duration-300';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Bookshelf', path: '/' },
    { name: 'About', path: '/about' },
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <header className="sticky top-0 z-40 mb-2 border-b border-[rgba(137,181,255,0.12)] bg-[linear-gradient(180deg,rgba(15,29,48,0.97),rgba(10,19,33,0.93))] text-white shadow-[0_16px_46px_rgba(10,19,33,0.24)] backdrop-blur-md">
      <nav className="container py-3 sm:py-4">
        {/* Desktop */}
        <div className="hidden md:grid grid-cols-[1fr_auto_1fr] items-center gap-4">
          {/* Logo (no name) */}
          <div className="justify-self-start">
            <Link
              to="/"
              className="flex items-center gap-3 text-white no-underline transition hover:text-secondary-light"
              aria-label="Homepage"
            >
              <span className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-white/14 bg-white/[0.05] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                <img src="/images/logo.png" alt="" className="h-12 w-12" />
              </span>
              <span className="hidden font-mono text-[0.68rem] uppercase tracking-[0.18em] text-slate-100 lg:inline">
                Kory Kilpatrick
              </span>
            </Link>
          </div>

          {/* Links */}
          <div className="justify-self-center flex items-center gap-2 rounded-[16px] border border-white/22 bg-white/[0.08] px-2 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`rounded-[12px] px-4 py-2 font-mono text-[0.74rem] uppercase tracking-[0.12em] no-underline transition ${
                  isActive(link.path)
                    ? 'border border-secondary/40 bg-[rgba(63,127,216,0.26)] !text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]'
                    : '!text-slate-100 hover:bg-white/[0.12] hover:!text-white'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Social icons */}
          <div className="justify-self-end flex items-center gap-4">
            <a
              href="https://www.5hc.ai/l/kory-kilpatrick/6930b6b6-baa7-419a-a441-eac0a7225a6e"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-[12px] border border-white/20 bg-white/[0.08] px-3 py-1.5 font-mono text-[0.64rem] uppercase tracking-[0.1em] !text-slate-100 no-underline transition duration-300 hover:border-secondary/40 hover:bg-white/[0.12] hover:text-secondary-light"
              aria-label="Five Hour Consulting profile"
            >
              5HC
            </a>
            {/* X (formerly Twitter) */}
            <a
              href="https://x.com/kory_kilpatrick"
              target="_blank"
              rel="noopener noreferrer"
              className={ICON_LINK_CLASSNAME}
              aria-label="X (formerly Twitter)"
            >
              <FaXTwitter size={28} />
            </a>
            {/* GitHub */}
            <a
              href="https://github.com/korykilpatrick"
              target="_blank"
              rel="noopener noreferrer"
              className={ICON_LINK_CLASSNAME}
              aria-label="GitHub"
            >
              <FaGithub size={28} />
            </a>
            {/* LinkedIn */}
            <a
              href="https://www.linkedin.com/in/kory-kilpatrick-b60707243/"
              target="_blank"
              rel="noopener noreferrer"
              className={ICON_LINK_CLASSNAME}
              aria-label="LinkedIn"
            >
              <FaLinkedinIn size={28} />
            </a>
            {/* Email */}
            <a
              href="mailto:koryrkilpatrick@gmail.com?subject=Consulting%20Waitlist&body=Hi%20Kory%2C%0A%0AI%27d%20like%20to%20join%20the%20consulting%20waitlist.%0A%0AContext%3A%0A%0AThanks%2C"
              className={ICON_LINK_CLASSNAME}
              aria-label="Email Kory"
            >
              <MdEmail size={28} />
            </a>
          </div>
        </div>

        {/* Mobile */}
        <div className="md:hidden flex flex-col items-center">
          <div className="w-full flex justify-between items-center">
            <Link
              to="/"
              className="flex items-center gap-3 text-white no-underline"
              aria-label="Homepage"
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/18 bg-white/[0.06]">
                <img src="/images/logo.png" alt="" className="h-9 w-9" />
              </span>
              <span className="font-mono text-[0.64rem] uppercase tracking-[0.12em] text-slate-100">
                Kory Kilpatrick
              </span>
            </Link>
            <button
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white focus:outline-none"
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>

          {isMenuOpen && (
            <div className="mt-3 w-full rounded-[20px] border border-white/16 bg-white/[0.08] px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`block rounded-[12px] px-3 py-2 font-mono text-[0.72rem] uppercase tracking-[0.12em] no-underline transition ${
                    isActive(link.path)
                      ? 'border border-secondary/40 bg-[rgba(63,127,216,0.26)] !text-white'
                      : '!text-slate-100 hover:bg-white/[0.12] hover:!text-white'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              {/* Social icons for mobile */}
              <div className="mt-3 flex items-center justify-center gap-4 border-t border-white/10 pt-3">
                <a
                  href="https://www.5hc.ai/l/kory-kilpatrick/6930b6b6-baa7-419a-a441-eac0a7225a6e"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-[12px] border border-white/20 bg-white/[0.08] px-3 py-1.5 font-mono text-[0.62rem] uppercase tracking-[0.1em] !text-slate-100 no-underline transition duration-300 hover:border-secondary/40 hover:bg-white/[0.12] hover:text-secondary-light"
                  aria-label="Five Hour Consulting profile"
                >
                  5HC
                </a>
                <a
                  href="https://x.com/kory_kilpatrick"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={ICON_LINK_CLASSNAME}
                  aria-label="X (formerly Twitter)"
                >
                  <FaXTwitter size={MOBILE_ICON_SIZE} />
                </a>
                <a
                  href="https://github.com/korykilpatrick"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={ICON_LINK_CLASSNAME}
                  aria-label="GitHub"
                >
                  <FaGithub size={MOBILE_ICON_SIZE} />
                </a>
                <a
                  href="https://www.linkedin.com/in/kory-kilpatrick-b60707243/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={ICON_LINK_CLASSNAME}
                  aria-label="LinkedIn"
                >
                  <FaLinkedinIn size={MOBILE_ICON_SIZE} />
                </a>
                <a
                  href="mailto:koryrkilpatrick@gmail.com?subject=Consulting%20Waitlist&body=Hi%20Kory%2C%0A%0AI%27d%20like%20to%20join%20the%20consulting%20waitlist.%0A%0AContext%3A%0A%0AThanks%2C"
                  className={ICON_LINK_CLASSNAME}
                  aria-label="Email Kory"
                >
                  <MdEmail size={MOBILE_ICON_SIZE} />
                </a>
              </div>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
