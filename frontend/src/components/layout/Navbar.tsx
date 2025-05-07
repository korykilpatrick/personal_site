import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Work', path: '/work' },
    { name: 'Bookshelf', path: '/bookshelf' },
    { name: 'Library', path: '/library' },
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
          <div className="justify-self-end flex space-x-4">
            {/* Twitter */}
            <a
              href="https://twitter.com/kory_kilpatrick"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-secondary-light"
              aria-label="Twitter"
            >
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 ..."/>
              </svg>
            </a>
            {/* GitHub */}
            <a
              href="https://github.com/korykilpatrick"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-secondary-light"
              aria-label="GitHub"
            >
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M12 2C6.477 2 ... "
                  clipRule="evenodd"
                />
              </svg>
            </a>
            {/* LinkedIn */}
            <a
              href="https://www.linkedin.com/in/kory-kilpatrick-b60707243/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-secondary-light"
              aria-label="LinkedIn"
            >
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-..."/>
              </svg>
            </a>
            {/* Email */}
            <a
              href="mailto:koryrkilpatrick@gmail.com?subject=Are%20you%20a%20bank%20loan?&body=Because%20you%20have%20my%20interest."
              className="text-white hover:text-secondary-light"
              aria-label="Email"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 ..."/>
              </svg>
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
              <div className="flex justify-center space-x-6 pt-2 mt-2 border-t border-primary-light w-full">
                <a
                  href="https://twitter.com/kory_kilpatrick"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-secondary-light"
                  aria-label="Twitter"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 ..."/>
                  </svg>
                </a>
                <a
                  href="https://github.com/korykilpatrick"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-secondary-light"
                  aria-label="GitHub"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12 2C6.477 2 ..." clipRule="evenodd" />
                  </svg>
                </a>
                <a
                  href="https://www.linkedin.com/in/kory-kilpatrick-b60707243/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-secondary-light"
                  aria-label="LinkedIn"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M20.447 20.452h-3.554 ..."/>
                  </svg>
                </a>
                <a
                  href="mailto:koryrkilpatrick@gmail.com?subject=Are%20you%20a%20bank%20loan?&body=Because%20you%20have%20my%20interest."
                  className="text-white hover:text-secondary-light"
                  aria-label="Email"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 ..."/>
                  </svg>
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