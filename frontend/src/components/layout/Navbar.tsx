import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaXTwitter, FaGithub, FaLinkedinIn } from 'react-icons/fa6';
import { MdEmail } from 'react-icons/md';

// Icon size constants
const DESKTOP_ICON_SIZE = 32;
const MOBILE_ICON_SIZE = 18;

// Icon style constants
const ICON_LINK_CLASSNAME = "text-white hover:text-secondary-light no-underline";

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Library', path: '/library' },
    { name: 'Bookshelf', path: '/bookshelf' },
    { name: 'Work', path: '/work' },
    { name: 'About', path: '/about' },
  ];

  const isActive = (path: string) => location.pathname.startsWith(path) && path !== '/';

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <header className="bg-primary text-white py-3 mb-4 px-4 shadow-md">
      <nav>
        {/* Desktop */}
        <div className="hidden md:grid grid-cols-3 items-center">
          {/* Logo (no name) */}
          <div className="justify-self-start">
            <Link to="/" className="flex items-center hover:no-underline" aria-label="Homepage">
              <img src="/images/logo.png" alt="" className="h-16 w-auto" />
            </Link>
          </div>

          {/* Links */}
          <div className="justify-self-center flex space-x-6 font-sans text-lg tracking-wider">
            {navLinks.map(link => (
              <Link
                key={link.name}
                to={link.path}
                className={`px-2 py-1 rounded-sm no-underline ${
                  isActive(link.path)
                    ? 'text-secondary-light border-b border-secondary-light'
                    : 'text-white hover:text-secondary-light hover:bg-primary-dark'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Social icons */}
          <div className="justify-self-end flex space-x-5">
            {/* X (formerly Twitter) */}
            <a
              href="https://x.com/kory_kilpatrick"
              target="_blank"
              rel="noopener noreferrer"
              className={ICON_LINK_CLASSNAME}
              aria-label="X (formerly Twitter)"
            >
              <FaXTwitter size={DESKTOP_ICON_SIZE} />
            </a>
            {/* GitHub */}
            <a
              href="https://github.com/korykilpatrick"
              target="_blank"
              rel="noopener noreferrer"
              className={ICON_LINK_CLASSNAME}
              aria-label="GitHub"
            >
              <FaGithub size={DESKTOP_ICON_SIZE} />
            </a>
            {/* LinkedIn */}
            <a
              href="https://www.linkedin.com/in/kory-kilpatrick-b60707243/"
              target="_blank"
              rel="noopener noreferrer"
              className={ICON_LINK_CLASSNAME}
              aria-label="LinkedIn"
            >
              <FaLinkedinIn size={DESKTOP_ICON_SIZE} />
            </a>
            {/* Email */}
            <a
              href="mailto:koryrkilpatrick@gmail.com?subject=Are%20you%20a%20bank%20loan?&body=Because%20you%20have%20my%20interest."
              className={ICON_LINK_CLASSNAME}
              aria-label="Email"
            >
              <MdEmail size={DESKTOP_ICON_SIZE} />
            </a>
          </div>
        </div>

        {/* Mobile */}
        <div className="md:hidden flex flex-col items-center">
          <div className="w-full flex justify-between items-center">
            <Link to="/" className="flex items-center hover:no-underline" aria-label="Homepage">
              <img src="/images/logo.png" alt="" className="h-12 w-auto" />
            </Link>
            <button
              className="text-white focus:outline-none"
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {isMenuOpen && (
            <div className="mt-3 flex flex-col items-center space-y-2 py-2 w-full">
              {navLinks.map(link => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`block py-1 px-2 text-lg no-underline ${
                    isActive(link.path)
                      ? 'text-secondary-light'
                      : 'text-white hover:text-secondary-light'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              {/* Social icons for mobile */}
              <div className="flex justify-center space-x-5 pt-2 mt-2 border-t border-primary-light w-full">
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
                  href="mailto:koryrkilpatrick@gmail.com?subject=Are%20you%20a%20bank%20loan?&body=Because%20you%20have%20my%20interest."
                  className={ICON_LINK_CLASSNAME}
                  aria-label="Email"
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