import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Work', path: '/work' },
    { name: 'Bookshelf', path: '/bookshelf' },
    { name: 'About', path: '/about' },
  ];

  const isActive = (path: string) => location.pathname.startsWith(path) && path !== '/';

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <header className="border-b border-stone-200 py-3 mb-4 px-4">
      <nav>
        {/* Desktop */}
        <div className="hidden md:grid grid-cols-3 items-center">
          {/* Logo (no name) */}
          <div className="justify-self-start">
            <Link to="/" className="flex items-center hover:no-underline" aria-label="Homepage">
              <img src="/images/logo.png" alt="" className="h-8 w-auto" />
            </Link>
          </div>

          {/* Links */}
          <div className="justify-self-center flex space-x-6 font-sans text-sm tracking-wider">
            {navLinks.map(link => (
              <Link
                key={link.name}
                to={link.path}
                className={`px-2 py-1 rounded-sm no-underline ${
                  isActive(link.path)
                    ? 'text-primary border-b border-primary'
                    : 'text-textSecondary hover:text-primary hover:bg-sky-50'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Social icons (unchanged) */}
          <div className="justify-self-end flex space-x-4">
            {/* Twitter */}<a href="https://twitter.com/kory_kilpatrick" target="_blank" rel="noopener noreferrer" className="text-textSecondary hover:text-primary" aria-label="Twitter"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996A4.107 4.107 0 008.047 9.14a11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477 4.072 4.072 0 01-1.267-.404v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"/></svg></a>
            {/* GitHub */}<a href="https://github.com/korykilpatrick" target="_blank" rel="noopener noreferrer" className="text-textSecondary hover:text-primary" aria-label="GitHub"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd"/></svg></a>
            {/* LinkedIn */}<a href="https://www.linkedin.com/in/kory-kilpatrick-b60707243/" target="_blank" rel="noopener noreferrer" className="text-textSecondary hover:text-primary" aria-label="LinkedIn"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg></a>
            {/* Email */}<a href="mailto:koryrkilpatrick@gmail.com?subject=Are%20you%20a%20bank%20loan?&body=Because%20you%20have%20my%20interest." className="text-textSecondary hover:text-primary" aria-label="Email"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg></a>
          </div>
        </div>

        {/* Mobile */}
        <div className="md:hidden flex flex-col items-center">
          <div className="w-full flex justify-between items-center">
            <Link to="/" className="flex items-center hover:no-underline" aria-label="Homepage">
              <img src="/images/logo.png" alt="" className="h-7 w-auto" />
            </Link>
            <button className="text-textPrimary focus:outline-none" onClick={toggleMenu} aria-label="Toggle menu">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12"/>
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 6h16M4 12h16M4 18h16"/>
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
                  className={`block py-1 px-2 text-sm no-underline ${isActive(link.path) ? 'text-primary' : 'text-textSecondary'}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              {/* Social icons for mobile (same as desktop order) */}
              <div className="flex justify-center space-x-6 pt-2 mt-2 border-t border-sky-100 w-full">
                <a href="https://twitter.com/kory_kilpatrick" target="_blank" rel="noopener noreferrer" className="text-textSecondary hover:text-primary" aria-label="Twitter">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M8.29 20.251c7.547..."/></svg>
                </a>
                <a href="https://github.com/korykilpatrick" target="_blank" rel="noopener noreferrer" className="text-textSecondary hover:text-primary" aria-label="GitHub">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fill-rule="evenodd" d="M12 2C6.477 2..."/></svg>
                </a>
                <a href="https://www.linkedin.com/in/kory-kilpatrick-b60707243/" target="_blank" rel="noopener noreferrer" className="text-textSecondary hover:text-primary" aria-label="LinkedIn">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.447 20.452h-3.554..."/></svg>
                </a>
                <a href="mailto:koryrkilpatrick@gmail.com?subject=Are%20you%20a%20bank%20loan?&body=Because%20you%20have%20my%20interest." className="text-textSecondary hover:text-primary" aria-label="Email">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89..."/></svg>
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